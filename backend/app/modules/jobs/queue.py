"""Durable queue operations (plan §8.2): promotion, claiming, recovery.

- ``promote_queued``: ``queued`` jobs that have pending items -> ``running``.
- ``claim_items``: ``SELECT … FOR UPDATE OF job_items SKIP LOCKED`` on pending
  items of running jobs; sets ``running`` + ``lease_until`` and marks the cell
  ``running`` (with a ``cell`` event) in the same transaction.
- ``recover_expired_leases``: items stuck ``running`` past ``lease_until`` go
  back to ``pending`` with ``attempts+1``; at ``max_attempts`` the item ends
  with the cell ``failed`` / ``provider_unavailable``.
"""

from collections.abc import Callable, Collection
from datetime import datetime, timedelta

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.modules.jobs import events, service
from app.modules.jobs.models import Job, JobItem
from app.modules.sheets import service as sheets


def promote_queued(s: Session) -> list[Job]:
    """queued -> running for jobs that still have pending items. Emits the
    initial persisted ``progress`` event for each promoted job."""
    jobs = list(
        s.execute(
            select(Job).where(Job.status == "queued").order_by(Job.created_at)
        ).scalars()
    )
    promoted: list[Job] = []
    for job in jobs:
        has_pending = (
            s.execute(
                select(JobItem.id)
                .where(JobItem.job_id == job.id, JobItem.status == "pending")
                .limit(1)
            ).scalar_one_or_none()
            is not None
        )
        if not has_pending:
            continue
        locked = s.execute(
            select(Job).where(Job.id == job.id).with_for_update()
        ).scalar_one()
        if locked.status != "queued":
            continue
        locked.status = "running"
        s.flush()
        events.append_event(s, locked.id, "progress", locked.progress)
        events.notify(s, locked.id)
        promoted.append(locked)
    return promoted


def claim_items(
    s: Session,
    *,
    now: datetime,
    lease_seconds: float,
    limit: int,
    exclude_enrichment_ids: Collection[str] | None = None,
    claim_gate: Callable[[Session, JobItem], bool] | None = None,
) -> list[JobItem]:
    """Claim up to ``limit`` pending items of running jobs. Each claimed item
    becomes ``running`` with ``lease_until``; its cell is marked ``running``
    and a ``cell`` event is emitted (mock ``advance`` parity).

    P4b: items stay claimable only once ``available_at`` has passed
    (provider-deferred). ``exclude_enrichment_ids`` skips gated providers
    (MoltSets budget/concurrency) so other providers keep flowing.
    ``claim_gate`` runs inside this transaction per candidate before the
    item is marked — returning False leaves the item pending (MoltSets
    budget re-check + reservation, atomic under its advisory lock)."""
    query = (
        select(JobItem)
        .join(Job, JobItem.job_id == Job.id)
        .where(
            JobItem.status == "pending",
            Job.status == "running",
            or_(
                JobItem.available_at.is_(None),
                JobItem.available_at <= now,
            ),
        )
        .order_by(Job.created_at, JobItem.id)
        .limit(limit)
        .with_for_update(of=JobItem, skip_locked=True)
    )
    if exclude_enrichment_ids:
        eid = JobItem.payload["enrichmentId"].astext
        query = query.where(or_(eid.is_(None), ~eid.in_(exclude_enrichment_ids)))
    candidates = list(s.execute(query).scalars())
    lease_until = now + timedelta(seconds=lease_seconds)
    seen_jobs: set[str] = set()
    claimed: list[JobItem] = []
    for item in candidates:
        if claim_gate is not None and not claim_gate(s, item):
            continue  # stays pending; its row lock releases at commit
        item.status = "running"
        item.lease_until = lease_until
        item.available_at = None  # consumed by this claim
        claimed.append(item)
        column = (
            sheets.get_column_by_id(s, item.column_id)
            if item.column_id
            else None
        )
        if item.row_id is not None and item.column_id is not None and column is not None:
            cell = sheets.write_enrichment_result(
                s,
                item.row_id,
                item.column_id,
                status="running",
                cost=0,
                set_fetched_at=False,
                run_id=(item.payload or {}).get("runId"),
            )
            if cell is not None:
                events.append_event(
                    s, item.job_id, "cell", service.cell_view(cell, column, s)
                )
        seen_jobs.add(item.job_id)
    s.flush()
    for job_id in seen_jobs:
        events.notify(s, job_id)
    return claimed


def recover_expired_leases(
    s: Session, *, now: datetime, max_attempts: int
) -> int:
    """Return stuck items to pending (attempts+1) or finalize them as failed
    once ``attempts`` reaches ``max_attempts``. Returns items recovered."""
    expired = list(
        s.execute(
            select(JobItem)
            .where(
                JobItem.status == "running",
                JobItem.lease_until.isnot(None),
                JobItem.lease_until < now,
            )
            .with_for_update(skip_locked=True)
        ).scalars()
    )
    for item in expired:
        job = s.execute(
            select(Job).where(Job.id == item.job_id).with_for_update()
        ).scalar_one()
        item.attempts += 1
        if item.attempts >= max_attempts:
            service.fail_item_final(s, item, job)
        else:
            item.status = "pending"
            item.lease_until = None
        events.notify(s, job.id)
    s.flush()
    return len(expired)
