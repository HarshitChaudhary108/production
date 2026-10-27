"""Typed MoltSets errors (docs: developer.moltsets.com, plan §8.8).

Every 4xx/5xx carries ``{"error": {"code", "message"}}`` — the ``code``
string is the provider's own vocabulary and is what the executor puts on
a failed cell verbatim:

- ``invalid_input`` (422)      — malformed body/param; never retried
- ``unauthorized`` (401)       — bad/revoked key; never retried
- ``insufficient_tokens`` (402) — balance cannot cover; never retried
- ``forbidden`` (403)          — missing User-Agent; never retried
- ``plan_restricted`` (403)    — tool not on the plan; never retried
- ``account_inactive`` (403)   — account inactive; never retried
- ``tool_not_found`` (404)     — unknown tool name; never retried
- ``rate_limited`` / ``fair_use_limit_exceeded`` /
  ``fair_use_requests_exceeded`` /
  ``search_concurrency_exceeded`` (429) — retryable; honour Retry-After
- ``internal_error`` (500)     — retryable

A lookup that finds nothing is NOT an error: HTTP 200
``status: "not_found"`` — surfaced to callers as a normal response.

Never put the API key, request headers, or the request body in any of
these messages (H4). Server-provided error strings are safe to carry.
"""


class MoltSetsError(Exception):
    """Base. ``code`` is the provider's error.code when the body parsed."""

    def __init__(
        self,
        endpoint: str,
        status_code: int | None,
        code: str,
        message: str,
        *,
        retry_after: float | None = None,
    ) -> None:
        super().__init__(f"moltsets {endpoint} {status_code} {code}: {message}")
        self.endpoint = endpoint
        self.status_code = status_code
        self.code = code
        self.message = message
        self.retry_after = retry_after


class MoltSetsRateLimited(MoltSetsError):
    """HTTP 429 after client-side retries — the worker defers the item
    (``available_at``) rather than failing the cell. ``retry_after`` is
    the provider's authoritative delay (``search_concurrency_exceeded``
    carries exactly 1 second)."""


class MoltSetsUnavailable(MoltSetsError):
    """Transport failure or retryable status exhausted (500/timeouts).
    Retries already happened inside the client."""


def error_code(status: int | None, body: object) -> str:
    """The provider's ``error.code``, with an HTTP fallback for bodies
    that don't parse."""
    if isinstance(body, dict):
        err = body.get("error")
        if isinstance(err, dict):
            code = err.get("code")
            if isinstance(code, str):
                return code
    return {
        401: "unauthorized",
        402: "insufficient_tokens",
        403: "forbidden",
        404: "tool_not_found",
        422: "invalid_input",
        429: "rate_limited",
    }.get(status or 0, "internal_error")


def error_message(status: int | None, body: object) -> str:
    if isinstance(body, dict):
        err = body.get("error")
        if isinstance(err, dict):
            message = err.get("message")
            if isinstance(message, str):
                return message
    return f"HTTP {status} from MoltSets."


def retry_after_seconds(body: object, headers: object) -> float | None:
    """``Retry-After`` header wins; else ``metadata.retry_after``."""
    if isinstance(headers, dict):
        raw = headers.get("retry-after") or headers.get("Retry-After")
        if raw is not None:
            try:
                return float(raw)
            except (TypeError, ValueError):
                pass
    if isinstance(body, dict):
        meta = body.get("metadata")
        if isinstance(meta, dict) and meta.get("retry_after") is not None:
            try:
                return float(meta["retry_after"])
            except (TypeError, ValueError):
                pass
    return None
