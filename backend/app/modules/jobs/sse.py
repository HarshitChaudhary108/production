"""SSE ``GET /jobs/:jobId/events`` (plan §8.2, amendments A1/A2).

Frame: ``id: <seq>`` / ``event: <name>`` / ``data: <json>``; heartbeat comment
``: ping`` every ``sse_heartbeat_seconds``; a ``retry:`` directive first
(mock parity). On connect: synthesized ``progress`` snapshot (no id), then
replay ``job_events`` with ``seq > Last-Event-ID`` (header or
``?lastEventId=``), then stream live via ``LISTEN job_events``. Terminal jobs
get snapshot + replayed tail (ending in ``done``) and the stream closes.
"""

import asyncio
from collections.abc import AsyncIterator
from typing import Any

import psycopg
from fastapi import Request
from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from app.db import psycopg_dsn
from app.modules.jobs import events
from app.modules.jobs.models import Job
from app.modules.jobs.service import TERMINAL_STATUSES


def _connect(database_url: str) -> "psycopg.Connection[Any]":
    return psycopg.connect(psycopg_dsn(database_url), autocommit=True)


def _read_job_state(factory: sessionmaker[Session], job_id: str) -> Job | None:
    with factory() as s:
        job = s.get(Job, job_id)
        if job is not None:
            s.expunge(job)
        return job


def _fetch(
    factory: sessionmaker[Session], job_id: str, after_seq: int
) -> list[tuple[int, str, Any]]:
    with factory() as s:
        return [(e.seq, e.event, e.data) for e in events.fetch_events(s, job_id, after_seq)]


def _wait_notifies(conn: "psycopg.Connection[Any]", timeout: float) -> int:
    """Block up to ``timeout`` for NOTIFY traffic on the channel."""
    return len(list(conn.notifies(timeout=timeout)))


async def job_event_stream(
    request: Request,
    *,
    session_factory: sessionmaker[Session],
    database_url: str,
    job_id: str,
    last_seq: int,
    heartbeat_s: float,
    retry_ms: int,
) -> AsyncIterator[str]:
    heartbeat = max(heartbeat_s, 0.01)
    wake_slice = min(heartbeat, 0.5)
    conn = await asyncio.to_thread(_connect, database_url)
    try:
        await asyncio.to_thread(
            conn.execute, f"LISTEN {events.NOTIFY_CHANNEL}"
        )
        sent = last_seq
        job = await asyncio.to_thread(_read_job_state, session_factory, job_id)
        progress = (job.progress if job else None) or {
            "done": 0,
            "total": 0,
            "unit": "cells",
        }
        yield events.SSE_RETRY.format(ms=retry_ms)
        yield events.sse_frame(None, "progress", progress)

        idle = 0.0
        while True:
            if await request.is_disconnected():
                return
            rows = await asyncio.to_thread(_fetch, session_factory, job_id, sent)
            closed = False
            for seq, name, data in rows:
                sent = seq
                idle = 0.0
                yield events.sse_frame(seq, name, data)
                if name in events.TERMINAL_EVENTS:
                    closed = True
            if closed:
                return
            if not rows:
                status = await asyncio.to_thread(
                    _job_status, session_factory, job_id
                )
                if status in TERMINAL_STATUSES:
                    return
                if idle >= heartbeat:
                    yield events.SSE_PING
                    idle = 0.0
            if await request.is_disconnected():
                return
            got = await asyncio.to_thread(_wait_notifies, conn, wake_slice)
            if got:
                idle = 0.0
            else:
                idle += wake_slice
    finally:
        await asyncio.to_thread(conn.close)


def _job_status(factory: sessionmaker[Session], job_id: str) -> str | None:
    with factory() as s:
        return s.execute(select(Job.status).where(Job.id == job_id)).scalar_one_or_none()
