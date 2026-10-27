"""Persisted job events + LISTEN/NOTIFY (plan §8.2).

Every event is a ``job_events`` row keyed ``(job_id, seq)``; seq is assigned
as ``max(seq)+1`` by the writer, which MUST hold ``SELECT … FOR UPDATE`` on
the job row first — that lock serializes seq allocation and job state reads
across workers. ``NOTIFY job_events, '<job_id>'`` is issued inside the same
transaction so SSE streams wake on commit.
"""

import json
from typing import Any

from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.modules.jobs.models import JobEvent

NOTIFY_CHANNEL = "job_events"
EVENT_NAMES = frozenset({"progress", "step", "cell", "token", "done", "error"})
# Events that close a stream after being emitted.
TERMINAL_EVENTS = frozenset({"done"})


def append_event(
    s: Session, job_id: str, event: str, data: dict[str, Any] | None
) -> JobEvent:
    """Append an event row; caller must hold the job row lock."""
    if event not in EVENT_NAMES:
        raise ValueError(f"unknown job event {event!r}")
    s.flush()  # autoflush is off: make earlier pending events visible to MAX
    seq = (
        s.execute(
            select(func.max(JobEvent.seq)).where(JobEvent.job_id == job_id)
        ).scalar_one()
        or 0
    ) + 1
    ev = JobEvent(job_id=job_id, seq=seq, event=event, data=data)
    s.add(ev)
    return ev


def notify(s: Session, job_id: str) -> None:
    """Delivered on commit; wakes SSE streams for this job."""
    s.execute(
        text(f"SELECT pg_notify('{NOTIFY_CHANNEL}', :payload)"),
        {"payload": job_id},
    )


def fetch_events(
    s: Session, job_id: str, after_seq: int, limit: int | None = None
) -> list[JobEvent]:
    stmt = (
        select(JobEvent)
        .where(JobEvent.job_id == job_id, JobEvent.seq > after_seq)
        .order_by(JobEvent.seq)
    )
    if limit is not None:
        stmt = stmt.limit(limit)
    return list(s.execute(stmt).scalars())


def sse_frame(seq: int | None, event: str, data: Any) -> str:
    """`id: <seq>` line is emitted only when seq is not None (the synthesized
    progress snapshot carries no id)."""
    payload = json.dumps(data, separators=(",", ":"), default=str)
    lines = []
    if seq is not None:
        lines.append(f"id: {seq}")
    lines.append(f"event: {event}")
    lines.append(f"data: {payload}")
    return "\n".join(lines) + "\n\n"


SSE_RETRY = "retry: {ms}\n\n"
SSE_PING = ": ping\n\n"
