"""Logging helpers + request-id middleware (hardening H5, pulled into P2).

- Every response carries ``X-Request-Id`` (incoming header honored, else a
  fresh ``req_…`` token) and the id is bound to a contextvar for log lines.
- Worker log lines carry ``job_id`` / ``row_id`` / provider ``requestId`` via
  the ``extra`` dict (structured ``key=value`` context, no provider bodies).
- Nothing here ever formats secret values; callers pass field names only.
"""

import logging
import re
import secrets
from contextvars import ContextVar
from typing import Any

from starlette.types import ASGIApp, Message, Receive, Scope, Send

request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)

_SAFE_VALUE = re.compile(r"[\s]")


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(f"outmate.{name}")


def kv(**fields: Any) -> str:
    """Structured tail for a log message: ``k=v k=v``; spaces quoted."""
    parts = []
    for key, value in fields.items():
        if value is None:
            continue
        text = str(value)
        if _SAFE_VALUE.search(text):
            text = f'"{text}"'
        parts.append(f"{key}={text}")
    return " ".join(parts)


class RequestIdMiddleware:
    """Pure-ASGI middleware: binds ``request_id_var`` and sets X-Request-Id."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        rid: str | None = None
        for name, value in scope.get("headers", []):
            if name == b"x-request-id":
                rid = value.decode("latin-1")
                break
        if not rid:
            rid = f"req_{secrets.token_urlsafe(8)}"
        token = request_id_var.set(rid)

        async def send_with_request_id(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = message.setdefault("headers", [])
                headers.append((b"x-request-id", rid.encode("latin-1")))
            await send(message)

        try:
            await self.app(scope, receive, send_with_request_id)
        finally:
            request_id_var.reset(token)
