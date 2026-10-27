"""Async Exa client (plan §5.1, §8.8) — /search and /contents ONLY.

- Auth: ``x-api-key`` header. The key is stored on the instance, never
  logged, never placed in exception messages, request bodies, or
  ``provider_calls`` rows (H4).
- Retry policy (§8.8): 429 / 500 / 503 / transport timeouts retry with
  exponential backoff + jitter, honouring ``Retry-After``; 400 →
  ``ExaRejected``; 401/403 → ``ExaAuth``; 402 → ``ExaOutOfCredits`` — all
  without retries. (The spec also documents 500; the plan's retry table
  lists only 429/503 — we treat 500 like 503, flagged in the report.)
- Observability: every ATTEMPT invokes the optional ``record`` callback with
  a ``ProviderCallRecord`` (provider, endpoint, status_code, request_id,
  cost_dollars, ms). The caller owns turning it into a provider_calls row.
- ``warnings`` on success are logged, never surfaced to a model.

Engineering defaults (not in the plan): timeout 30 s, max_attempts 3,
backoff base 0.5 s capped at 30 s. ``transport``/``sleep`` are injectable for
tests (httpx.MockTransport, no network).
"""

import asyncio
import random
import time
from collections.abc import Awaitable, Callable
from typing import Any

import httpx

from app.logging import get_logger
from app.modules.enrichment.executors.base import ProviderCallRecord
from app.modules.providers.exa.errors import (
    ExaAuth,
    ExaError,
    ExaOutOfCredits,
    ExaRejected,
    ExaUnavailable,
    error_fields,
)
from app.modules.providers.exa.models import ExaResponse, user_identifier

__all__ = ["ExaClient", "user_identifier"]

log = get_logger("exa")

BASE_URL = "https://api.exa.ai"
PROVIDER = "exa"
_RETRYABLE_STATUSES = {429, 500, 503}
_NO_RETRY_MAP: dict[int, type[ExaError]] = {
    400: ExaRejected,
    401: ExaAuth,
    402: ExaOutOfCredits,
    403: ExaAuth,
}
RecordFn = Callable[[ProviderCallRecord], None]
SleepFn = Callable[[float], Awaitable[None]]


class ExaClient:
    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = BASE_URL,
        timeout_s: float = 30.0,
        max_attempts: int = 3,
        backoff_base_s: float = 0.5,
        backoff_cap_s: float = 30.0,
        transport: httpx.AsyncBaseTransport | None = None,
        sleep: SleepFn | None = None,
        record: RecordFn | None = None,
    ) -> None:
        self._api_key = api_key  # NEVER logged or serialized
        self._max_attempts = max(1, max_attempts)
        self._backoff_base = backoff_base_s
        self._backoff_cap = backoff_cap_s
        self._sleep = sleep or asyncio.sleep
        self._record = record
        self._client = httpx.AsyncClient(
            base_url=base_url, timeout=timeout_s, transport=transport
        )

    async def aclose(self) -> None:
        await self._client.aclose()

    async def search(
        self, body: dict[str, Any], *, record: RecordFn | None = None
    ) -> ExaResponse:
        """POST /search. ``body`` should come from models.build_search_request."""
        return await self._call("/search", body, record)

    async def contents(
        self, body: dict[str, Any], *, record: RecordFn | None = None
    ) -> ExaResponse:
        """POST /contents. ``body`` should come from build_contents_request."""
        return await self._call("/contents", body, record)

    # ------------------------------------------------------------- core

    async def _call(
        self,
        endpoint: str,
        body: dict[str, Any],
        record: RecordFn | None = None,
    ) -> ExaResponse:
        last_error: ExaError | None = None
        for attempt in range(1, self._max_attempts + 1):
            started = time.monotonic()
            try:
                resp = await self._client.post(
                    endpoint, json=body, headers={"x-api-key": self._api_key}
                )
            except httpx.HTTPError as exc:
                ms = int((time.monotonic() - started) * 1000)
                self._emit(record, endpoint, None, None, None, ms)
                last_error = ExaUnavailable(
                    endpoint, None, f"transport error ({type(exc).__name__})"
                )
                if attempt < self._max_attempts:
                    await self._sleep(self._delay(attempt, None))
                    continue
                raise last_error from exc
            ms = int((time.monotonic() - started) * 1000)
            status = resp.status_code
            request_id, payload = self._ids(resp)
            cost = None
            if status == 200:
                parsed = ExaResponse.model_validate(payload)
                cost = (
                    parsed.cost_dollars.total if parsed.cost_dollars else None
                )
            self._emit(record, endpoint, status, request_id, cost, ms)
            if status == 200:
                for w in parsed.warnings:  # log, never to a model
                    log.warning(
                        "exa_warning endpoint=%s request_id=%s code=%s path=%s",
                        endpoint, request_id, w.code, w.path,
                    )
                return parsed
            _, tag, message = error_fields(payload)
            err = self._map_error(endpoint, status, message, request_id, tag)
            if status in _RETRYABLE_STATUSES and attempt < self._max_attempts:
                await self._sleep(
                    self._delay(attempt, resp.headers.get("retry-after"))
                )
                last_error = err
                continue
            raise err
        assert last_error is not None  # unreachable
        raise last_error

    def _map_error(
        self, endpoint: str, status: int, message: str,
        request_id: str | None, tag: str | None,
    ) -> ExaError:
        cls = _NO_RETRY_MAP.get(status, ExaUnavailable)
        return cls(
            endpoint, status, message, request_id=request_id, tag=tag
        )

    def _ids(self, resp: httpx.Response) -> tuple[str | None, Any]:
        """(request_id, parsed_json_body). requestId prefers the header, then
        the body envelope — never logs the body itself."""
        try:
            payload = resp.json()
        except ValueError:
            payload = None
        rid = resp.headers.get("x-request-id")
        if not rid and isinstance(payload, dict):
            rid = payload.get("requestId")
        return rid, payload

    def _delay(self, attempt: int, retry_after: str | None) -> float:
        if retry_after:
            try:
                return max(0.0, float(retry_after))
            except ValueError:
                pass
        delay = self._backoff_base * (2 ** (attempt - 1))
        jitter = delay + random.uniform(0.0, delay * 0.5)
        return float(min(self._backoff_cap, jitter))

    def _emit(
        self,
        record: RecordFn | None,
        endpoint: str,
        status: int | None,
        request_id: str | None,
        cost: float | None,
        ms: int,
    ) -> None:
        sink = record or self._record
        if sink is None:
            return
        try:
            sink(
                ProviderCallRecord(
                    provider=PROVIDER,
                    endpoint=endpoint,
                    status_code=status,
                    request_id=request_id,
                    cost_dollars=cost,
                    ms=ms,
                )
            )
        except Exception:  # observability must never break the call
            log.exception("provider_calls record failed endpoint=%s", endpoint)
