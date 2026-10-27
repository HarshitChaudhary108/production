"""Idempotency (plan §8.9): same (workspace, Idempotency-Key) replays the
stored response with the same status. A different body under the same key
still returns the original and logs a warning (Q9 default = mock behaviour).
"""

import hashlib
import json
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.logging import get_logger
from app.modules.core.models import IdempotencyKey

log = get_logger("idempotency")


def request_hash(body: Any) -> str:
    canonical = json.dumps(body, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(canonical.encode()).hexdigest()


def lookup(s: Session, workspace_id: str, key: str) -> IdempotencyKey | None:
    return s.execute(
        select(IdempotencyKey).where(
            IdempotencyKey.workspace_id == workspace_id,
            IdempotencyKey.key == key,
        )
    ).scalar_one_or_none()


def matches(rec: IdempotencyKey, route: str, body: Any) -> bool:
    """Same request shape? On mismatch we still return the stored response —
    the caller checks ``matches`` only to decide whether to warn (Q9)."""
    ok = rec.route == route and rec.request_hash == request_hash(body)
    if not ok:
        log.warning(
            "idempotency key %r on %s replayed with a different body; "
            "returning the original response",
            rec.key,
            rec.route,
        )
    return ok


def store(
    s: Session,
    workspace_id: str,
    key: str,
    route: str,
    body: Any,
    status: int,
    response: dict[str, Any],
) -> IdempotencyKey:
    rec = IdempotencyKey(
        workspace_id=workspace_id,
        key=key,
        route=route,
        request_hash=request_hash(body),
        response={"status": status, "body": response},
    )
    s.add(rec)
    s.flush()
    return rec
