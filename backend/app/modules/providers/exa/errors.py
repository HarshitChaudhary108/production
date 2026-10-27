"""Typed Exa errors (plan §8.8).

Never put the API key, request headers, or the request body in any of these
messages. Server-provided ``error``/``tag`` strings are safe to carry.
"""

from typing import Any


class ExaError(Exception):
    """Base. ``status_code``/``request_id``/``tag`` come from the wire."""

    def __init__(
        self,
        endpoint: str,
        status_code: int | None,
        message: str,
        *,
        request_id: str | None = None,
        tag: str | None = None,
    ) -> None:
        super().__init__(f"exa {endpoint} {status_code}: {message}")
        self.endpoint = endpoint
        self.status_code = status_code
        self.request_id = request_id
        self.tag = tag


class ExaRequestError(ValueError):
    """Local request validation failure — raised BEFORE any HTTP call."""


class ExaRejected(ExaError):
    """HTTP 400 — cell ``provider_rejected_request``. Never retried."""


class ExaAuth(ExaError):
    """HTTP 401/403 — job ``provider_auth``. Never retried."""


class ExaOutOfCredits(ExaError):
    """HTTP 402 — job ``provider_out_of_credits``. Never retried."""


class ExaUnavailable(ExaError):
    """429/5xx/timeout after max_attempts — ``provider_unavailable``."""


def error_fields(body: Any) -> tuple[str | None, str | None, str]:
    """Pull (request_id, tag, message) out of an Exa error envelope."""
    if not isinstance(body, dict):
        return None, None, "unexpected response"
    return (
        body.get("requestId"),
        body.get("tag"),
        body.get("error") or body.get("tag") or "unknown error",
    )
