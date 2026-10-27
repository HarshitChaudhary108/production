"""Async MoltSets client (docs: developer.moltsets.com, plan §5.2/§8.8).

- Auth: ``Authorization: Bearer ms_…`` + a REQUIRED ``User-Agent`` header
  (any non-empty value; missing → 403 ``forbidden``). The key is stored on
  the instance, never logged, never placed in exception messages, request
  bodies, or ``provider_calls`` rows (H4).
- All calls are ``POST {base_url}/<tool>`` with a JSON body containing only
  documented fields.
- Retry policy: 429 (``rate_limited``, ``fair_use_*``,
  ``search_concurrency_exceeded``) and 500 ``internal_error`` + transport
  timeouts retry with exponential backoff + jitter, honouring
  ``Retry-After`` / ``metadata.retry_after``. Everything else is a typed
  ``MoltSetsError`` carrying the provider's code — never retried.
- After retries, a still-429 raises ``MoltSetsRateLimited`` (the worker
  defers the item via ``available_at`` — it is not a cell failure).
- A miss is NOT an error: HTTP 200 ``status: "not_found"`` parses to a
  normal response with empty results.
- Observability: every ATTEMPT invokes the optional ``record`` callback
  with a ``ProviderCallRecord``; the caller owns the provider_calls row.

Engineering defaults (not in the plan): timeout 30 s, max_attempts 3,
backoff base 0.5 s capped at 30 s. ``transport``/``sleep`` injectable.
"""

import asyncio
import random
import time
from collections.abc import Awaitable, Callable, Sequence
from typing import Any

import httpx

from app.logging import get_logger
from app.modules.enrichment.executors.base import ProviderCallRecord
from app.modules.providers.moltsets import models
from app.modules.providers.moltsets.errors import (
    MoltSetsError,
    MoltSetsRateLimited,
    MoltSetsUnavailable,
    error_code,
    error_message,
    retry_after_seconds,
)

__all__ = ["MoltSetsClient", "SyncMoltSetsClient"]

log = get_logger("moltsets")

BASE_URL = "https://api.moltsets.com/api/v1/tools"
USER_AGENT = "outmate-backend/0.1.0"
PROVIDER = "moltsets"
_RETRYABLE_STATUSES = {429, 500}
RecordFn = Callable[[ProviderCallRecord], None]
SleepFn = Callable[[float], Awaitable[None]]


class MoltSetsClient:
    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = BASE_URL,
        user_agent: str = USER_AGENT,
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
            base_url=base_url,
            timeout=timeout_s,
            transport=transport,
            headers={
                "Authorization": f"Bearer {api_key}",
                "User-Agent": user_agent,
                "Content-Type": "application/json",
            },
        )

    async def aclose(self) -> None:
        await self._client.aclose()

    # ------------------------------------------------------------- tools

    async def search_people(
        self,
        *,
        company_domain: Sequence[str] | None = None,
        seniority: Sequence[str] | None = None,
        department: Sequence[str] | None = None,
        title: Sequence[str] | str | None = None,
        limit: int = models.DEFAULT_LIMIT,
        offset: int = 0,
        record: RecordFn | None = None,
    ) -> models.PeopleResponse:
        body: dict[str, Any] = {
            "limit": min(max(1, int(limit)), models.MAX_LIMIT),
            "offset": max(0, int(offset)),
        }
        if company_domain:
            body["company_domain"] = list(company_domain)
        if seniority:
            body["seniority"] = list(seniority)
        if department:
            body["department"] = list(department)
        if title:
            body["title"] = title
        raw = await self._call("search_people", body, record=record)
        return models.parse_people_response(raw)

    async def linkedin_to_business_email(
        self, linkedin_url: str, *, record: RecordFn | None = None
    ) -> models.EmailResponse:
        raw = await self._call(
            "linkedin_to_business_email",
            {"linkedin_url": linkedin_url},
            record=record,
        )
        return models.parse_email_response(raw)

    async def search_business_email_by_name(
        self,
        *,
        name: str,
        company_domain: str,
        record: RecordFn | None = None,
    ) -> models.EmailResponse:
        raw = await self._call(
            "search_business_email_by_name",
            {"name": name, "company_domain": company_domain},
            record=record,
        )
        return models.parse_email_response(raw)

    # ------------------------------------------------------------- core

    async def _call(
        self, endpoint: str, body: dict[str, Any], *, record: RecordFn | None
    ) -> dict[str, Any]:
        record = record or self._record
        last_error: MoltSetsError | None = None
        for attempt in range(1, self._max_attempts + 1):
            started = time.monotonic()
            try:
                resp = await self._client.post(f"/{endpoint}", json=body)
            except httpx.HTTPError:
                last_error = MoltSetsUnavailable(
                    endpoint, None, "transport_error", "Connection failed."
                )
                self._emit(record, endpoint, None, None, started)
                if attempt == self._max_attempts:
                    raise last_error from None
                await self._sleep(self._backoff(attempt, None))
                continue
            ms = int((time.monotonic() - started) * 1000)
            try:
                payload: object = resp.json()
            except ValueError:
                payload = None
            retry_after = retry_after_seconds(payload, dict(resp.headers))
            self._emit(
                record, endpoint, resp.status_code, payload, started, ms=ms
            )
            if resp.status_code == 200:
                return payload if isinstance(payload, dict) else {}
            code = error_code(resp.status_code, payload)
            message = error_message(resp.status_code, payload)
            if resp.status_code in _RETRYABLE_STATUSES:
                last_error = (
                    MoltSetsRateLimited(
                        endpoint, resp.status_code, code, message,
                        retry_after=retry_after,
                    )
                    if resp.status_code == 429
                    else MoltSetsUnavailable(
                        endpoint, resp.status_code, code, message
                    )
                )
                if attempt == self._max_attempts:
                    raise last_error
                await self._sleep(self._backoff(attempt, retry_after))
                continue
            raise MoltSetsError(
                endpoint, resp.status_code, code, message,
                retry_after=retry_after,
            )
        assert last_error is not None
        raise last_error

    def _emit(
        self,
        record: RecordFn | None,
        endpoint: str,
        status_code: int | None,
        payload: object,
        started: float,
        *,
        ms: int | None = None,
    ) -> None:
        if record is None:
            return
        tokens = records = None
        if isinstance(payload, dict):
            meta = models.parse_metadata(payload.get("metadata"))
            if meta is not None:
                tokens = meta.tokens_used
            records = _records_in(payload, endpoint)
        record(
            ProviderCallRecord(
                provider=PROVIDER,
                endpoint=endpoint,
                status_code=status_code,
                request_id=None,
                tokens=tokens,
                ms=ms if ms is not None else int((time.monotonic() - started) * 1000),
                records_returned=records,
            )
        )

    def _backoff(self, attempt: int, retry_after: float | None) -> float:
        if retry_after is not None:
            return min(retry_after, self._backoff_cap)
        base = self._backoff_base * (2 ** (attempt - 1))
        return float(min(base + random.uniform(0, base), self._backoff_cap))


def _records_in(payload: dict[str, Any], endpoint: str) -> int:
    """Fair Use records this call consumed: len(results.results) for
    search_people; 1 on a found email, 0 otherwise."""
    results = payload.get("results")
    if not isinstance(results, dict):
        return 0
    if endpoint == "search_people":
        people = results.get("results")
        return len(people) if isinstance(people, list) else 0
    return 1 if results.get("email") else 0


class SyncMoltSetsClient:
    """Sync wrapper: ``asyncio.run`` per call (worker has no loop)."""

    def __init__(self, client: MoltSetsClient) -> None:
        self._client = client

    def search_people(self, **kwargs: Any) -> models.PeopleResponse:
        return asyncio.run(self._client.search_people(**kwargs))

    def linkedin_to_business_email(
        self, linkedin_url: str, **kwargs: Any
    ) -> models.EmailResponse:
        return asyncio.run(
            self._client.linkedin_to_business_email(linkedin_url, **kwargs)
        )

    def search_business_email_by_name(self, **kwargs: Any) -> models.EmailResponse:
        return asyncio.run(self._client.search_business_email_by_name(**kwargs))
