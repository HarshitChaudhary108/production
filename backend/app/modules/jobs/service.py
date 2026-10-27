"""Job service: creation, state machine, transitions, settle, views.

Plan §8.2 minus all credit-ledger work (SA-1/SA-2): ``cell.cost`` is set on
succeeded cells inside the same transaction as the cell write and added to
``jobs.charged_credits`` / ``enrichment_runs.charged_credits`` — derived,
informational counters, never a ledger write.

State machine: queued -> running -> (paused <-> running) ->
succeeded | failed | cancelled. ``succeeded`` if at least one item ended
``succeeded`` or ``no_data``; ``failed`` only if every item failed.

Boundary (§8.4): this module never imports ``sheets.models`` — sheets tables
are reached only through ``sheets.service``. Model-typed values are passed
around as the Protocol shapes below.

Every mutating function takes a caller-owned Session and never commits. All
functions that finalize job state hold ``SELECT … FOR UPDATE`` on the job row
first — that lock serializes completions, cancellations and event seqs.
"""

from collections import Counter
from collections.abc import Sequence
from dataclasses import asdict
from datetime import UTC, datetime
from typing import Any, Protocol

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import Settings
from app.errors import ApiError
from app.ids import new_id
from app.logging import get_logger
from app.modules.enrichment import cache as enrichment_cache
from app.modules.enrichment import leaders as enrichment_leaders
from app.modules.enrichment import signals as enrichment_signals
from app.modules.enrichment.executors import common as ex_common
from app.modules.enrichment.executors.base import ExecResult
from app.modules.enrichment.models import EnrichmentRun
from app.modules.jobs import events
from app.modules.jobs.models import Job, JobItem
from app.modules.providers.models import ProviderCall
from app.modules.sheets import service as sheets

log = get_logger("worker")

JOB_TYPES = ("research", "chat", "enrichment", "run_cells")
TERMINAL_STATUSES = ("succeeded", "failed", "cancelled")
_TRANSITIONS: dict[str, set[str]] = {
    "queued": {"running", "cancelled"},
    "running": {"paused", "succeeded", "failed", "cancelled"},
    "paused": {"running", "cancelled"},
    "succeeded": set(),
    "failed": set(),
    "cancelled": set(),
}


class ColumnShape(Protocol):
    id: str
    key: str
    label: str
    type: str
    enrichment_id: str | None
    prompt: str | None
    params: dict[str, Any] | None


class RowShape(Protocol):
    id: str
    data: dict[str, Any]
    normalized_domain: str | None


class CellShape(Protocol):
    row_id: str
    column_id: str
    status: str
    value: Any
    provenance: str | None
    confidence: Any
    confidence_label: str | None
    source: str | None
    user_edited: bool
    stale: bool
    cost: int
    error: dict[str, Any] | None
    fetched_at: datetime | None
    last_run_id: str | None


# ------------------------------------------------------------------ views


def _iso(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    return dt.astimezone(UTC).isoformat().replace("+00:00", "Z")


def cell_view(cell: CellShape, column: ColumnShape, s: Session) -> dict[str, Any]:
    """Contract CellView (contract + A4, A6, A8)."""
    sources = [
        {"url": src.url, "title": src.title}
        for src in sheets.list_cell_sources(s, cell.row_id, cell.column_id)
    ]
    return {
        "rowId": cell.row_id,
        "columnKey": column.key,
        "enrichmentId": column.enrichment_id,
        "status": cell.status,
        "value": cell.value,
        "provenance": cell.provenance,
        "source": cell.source,
        "sources": sources,
        "confidence": float(cell.confidence) if cell.confidence is not None else None,
        "confidenceLabel": cell.confidence_label,
        "userEdited": bool(cell.user_edited),
        "stale": bool(cell.stale),
        "fetchedAt": _iso(cell.fetched_at),
        "cost": cell.cost,
        "error": cell.error,
    }


def pending_cell_view(row_id: str, column: ColumnShape) -> dict[str, Any]:
    """Synthesized CellView for a (row, column) with no cell row yet."""
    return {
        "rowId": row_id,
        "columnKey": column.key,
        "enrichmentId": column.enrichment_id,
        "status": "pending",
        "value": None,
        "provenance": None,
        "source": None,
        "sources": [],
        "confidence": None,
        "confidenceLabel": None,
        "userEdited": False,
        "stale": False,
        "fetchedAt": None,
        "cost": 0,
        "error": None,
    }


def job_view(job: Job) -> dict[str, Any]:
    result = job.result or {}
    return {
        "id": job.id,
        "type": job.type,
        "status": job.status,
        "progress": job.progress,
        "steps": job.steps,
        "estimatedCredits": job.estimated_credits,
        "chargedCredits": job.charged_credits,
        "summary": result.get("summary"),
        "result": result or None,
        "error": job.error,
    }


# ------------------------------------------------------------------ create


def create_cell_job(
    s: Session,
    *,
    workspace_id: str,
    job_type: str = "enrichment",
    run_id: str | None,
    sheet_id: str | None,
    columns: Sequence[ColumnShape],
    rows: Sequence[RowShape],
    column_costs: dict[str, int],
    pairs: list[tuple[str, str]] | None = None,
    refresh: bool = False,
    reserved_records: dict[str, int] | None = None,
) -> Job:
    """Job + one ``cell`` item per queued (row, column) pair. ``pairs`` is the
    eligible set returned by ``sheets.queue_cells_for_run`` (SA-2: the
    estimate covers eligible cells only); when None the full rows x columns
    cross is queued (unit-test callers). ``column_costs`` maps column.id ->
    catalog cost resolved by the caller. ``reserved_records`` maps
    column.id -> worst-case Fair Use records (P4b MoltSets gate); it lands
    on the item payload so the claim-time reservation knows the need."""
    if job_type not in JOB_TYPES:
        raise ValueError(f"unknown job type {job_type!r}")
    if pairs is None:
        pairs = [(row.id, column.id) for column in columns for row in rows]
    per_column = Counter(cid for _, cid in pairs)
    by_id = {c.id: c for c in columns}
    job = Job(
        id=new_id("job"),
        workspace_id=workspace_id,
        type=job_type,
        status="queued",
        progress={"done": 0, "total": len(pairs), "unit": "cells"},
        steps=[
            {
                "key": c.key,
                "label": c.label,
                "status": "running",
                "meta": f"0 of {per_column.get(c.id, 0)}",
            }
            for c in columns
        ],
        estimated_credits=sum(column_costs.get(cid, 0) for _, cid in pairs),
        charged_credits=0,
        parent_ref={
            "runId": run_id,
            "sheetId": sheet_id,
            "rowIds": [r.id for r in rows],
        },
    )
    s.add(job)
    s.flush()
    for row_id, column_id in pairs:
        column = by_id[column_id]
        payload: dict[str, Any] = {
            "runId": run_id,
            "columnKey": column.key,
            "enrichmentId": column.enrichment_id,
            "cost": column_costs.get(column_id, 0),
            "refresh": refresh,
        }
        if reserved_records and reserved_records.get(column_id):
            payload["reservedRecords"] = reserved_records[column_id]
        s.add(
            JobItem(
                id=new_id("job"),
                job_id=job.id,
                kind="cell",
                row_id=row_id,
                column_id=column_id,
                status="pending",
                payload=payload,
            )
        )
    s.flush()
    return job


# ------------------------------------------------------------------ state


def get_job(s: Session, workspace_id: str, job_id: str) -> Job:
    job = s.execute(
        select(Job).where(Job.id == job_id, Job.workspace_id == workspace_id)
    ).scalar_one_or_none()
    if job is None:
        raise ApiError(404, "not_found", "Job not found.", {"jobId": job_id})
    return job


def _lock_job(s: Session, job_id: str) -> Job:
    job = s.execute(
        select(Job).where(Job.id == job_id).with_for_update()
    ).scalar_one_or_none()
    if job is None:
        raise ApiError(404, "not_found", "Job not found.", {"jobId": job_id})
    return job


def transition_job(s: Session, job: Job, target: str) -> Job:
    if target not in _TRANSITIONS.get(job.status, set()):
        raise ApiError(
            409, "invalid_state", f"Job is {job.status}.", {"status": job.status}
        )
    job.status = target
    s.flush()
    return job


def pause_job(s: Session, workspace_id: str, job_id: str) -> Job:
    job = _lock_job(s, job_id)
    if job.workspace_id != workspace_id:
        raise ApiError(404, "not_found", "Job not found.", {"jobId": job_id})
    transition_job(s, job, "paused")
    return job


def resume_job(s: Session, workspace_id: str, job_id: str) -> Job:
    job = _lock_job(s, job_id)
    if job.workspace_id != workspace_id:
        raise ApiError(404, "not_found", "Job not found.", {"jobId": job_id})
    transition_job(s, job, "running")
    events.notify(s, job.id)
    return job


# ------------------------------------------------------------------ steps


def _update_step_locked(
    s: Session, job: Job, column: ColumnShape
) -> dict[str, Any] | None:
    """Recompute one column's step from its items; emits a ``step`` event when
    it changed. Mock ``updateStep`` parity: meta "x of y"; cancelled items
    count as done; any failed -> completed_with_errors."""
    items = list(
        s.execute(
            select(JobItem).where(
                JobItem.job_id == job.id, JobItem.column_id == column.id
            )
        ).scalars()
    )
    done_items = [i for i in items if i.status in ("done", "cancelled")]
    any_failed = any(
        (i.result or {}).get("status") == "failed" for i in done_items
    )
    status = (
        "running"
        if len(done_items) < len(items)
        else ("completed_with_errors" if any_failed else "done")
    )
    new_step = {
        "key": column.key,
        "label": column.label,
        "status": status,
        "meta": f"{len(done_items)} of {len(items)}",
    }
    steps = [dict(st) for st in (job.steps or [])]
    for i, st in enumerate(steps):
        if st.get("key") == column.key:
            if st != new_step:
                steps[i] = new_step
                job.steps = steps
                s.flush()
                events.append_event(s, job.id, "step", new_step)
                return new_step
            return None
    steps.append(new_step)
    job.steps = steps
    s.flush()
    events.append_event(s, job.id, "step", new_step)
    return new_step


def _columns_for_job(s: Session, job: Job) -> list[ColumnShape]:
    column_ids = {
        i
        for (i,) in s.execute(
            select(JobItem.column_id)
            .where(JobItem.job_id == job.id)
            .distinct()
        )
        if i is not None
    }
    return [
        col
        for cid in column_ids
        if (col := sheets.get_column_by_id(s, cid)) is not None
    ]


# ------------------------------------------------------------------ settle


def _summary(s: Session, job_id: str) -> dict[str, int]:
    counts = {"succeeded": 0, "failed": 0, "noData": 0}
    results = s.execute(
        select(JobItem.result).where(
            JobItem.job_id == job_id, JobItem.status == "done"
        )
    ).scalars()
    for result in results:
        status = (result or {}).get("status")
        if status == "succeeded":
            counts["succeeded"] += 1
        elif status == "failed":
            counts["failed"] += 1
        elif status == "no_data":
            counts["noData"] += 1
    return counts


def _remaining_items(s: Session, job_id: str) -> int:
    return s.execute(
        select(func.count())
        .select_from(JobItem)
        .where(JobItem.job_id == job_id, JobItem.status.in_(("pending", "running")))
    ).scalar_one()


def settle_locked(
    s: Session, job: Job, *, force_status: str | None = None
) -> bool:
    """Finalize a drained job. Caller holds the job lock. Emits ``done``.
    Idempotent: a job already carrying ``result.summary`` is not re-settled.
    ``force_status`` overrides the summary-derived status (§8.8 job-level
    provider errors must settle failed even after partial successes).
    Returns True when it settled."""
    if (job.result or {}).get("summary") is not None:
        return False
    summary = _summary(s, job.id)
    if job.status != "cancelled":
        job.status = force_status or (
            "succeeded"
            if summary["succeeded"] + summary["noData"] > 0
            else "failed"
        )
    job.result = {"summary": summary}
    s.flush()
    run = s.execute(
        select(EnrichmentRun).where(EnrichmentRun.job_id == job.id)
    ).scalar_one_or_none()
    if run is not None:
        run.status = job.status
        s.flush()
    events.append_event(
        s,
        job.id,
        "done",
        {
            "status": job.status,
            "chargedCredits": job.charged_credits or 0,
            "summary": summary,
        },
    )
    events.notify(s, job.id)
    return True


def maybe_settle(s: Session, job: Job) -> bool:
    """Settle iff no pending/running items remain. Caller holds the lock."""
    if job.status in TERMINAL_STATUSES and job.status != "cancelled":
        return False
    if _remaining_items(s, job.id) > 0:
        return False
    return settle_locked(s, job)


# ------------------------------------------------------------------ cancel


def _release_moltsets_reservation(s: Session, item: JobItem) -> None:
    """Delete an OPEN claim-time MoltSets reservation (status_code NULL
    provider_calls row) for an item that ends without complete_item —
    deferred items carry one across return_item_to_pending, and a cancel
    or final fail must not leak its worst-case usage into the window."""
    payload = item.payload or {}
    rid = payload.get("moltsetsReservationId")
    if not rid:
        return
    reservation = s.get(ProviderCall, rid)
    if reservation is not None and reservation.status_code is None:
        s.delete(reservation)
    item.payload = {k: v for k, v in payload.items() if k != "moltsetsReservationId"}


def _cancel_pending_items_locked(s: Session, job: Job) -> None:
    """Pending items -> cancelled (cells cancelled, cost 0). Shared by
    cancel_job (C7) and the §8.8 job-level provider failure path. Caller
    holds the job lock."""
    pending = list(
        s.execute(
            select(JobItem).where(
                JobItem.job_id == job.id, JobItem.status == "pending"
            )
        ).scalars()
    )
    for item in pending:
        item.status = "cancelled"
        _release_moltsets_reservation(s, item)
        if item.row_id is None or item.column_id is None:
            continue
        column = sheets.get_column_by_id(s, item.column_id)
        if column is None:
            continue
        cell = sheets.write_enrichment_result(
            s,
            item.row_id,
            item.column_id,
            status="cancelled",
            cost=0,
            error={"code": "cancelled", "message": "Cancelled before completion."},
            set_fetched_at=False,
            run_id=(item.payload or {}).get("runId"),
        )
        if cell is not None and column is not None:
            events.append_event(s, job.id, "cell", cell_view(cell, column, s))


def cancel_job(s: Session, workspace_id: str, job_id: str) -> Job:
    """C7 (contract): pending items -> cancelled (cells cancelled, cost 0);
    running items finish and keep succeeded-cost semantics. Settles when no
    item is still running."""
    job = _lock_job(s, job_id)
    if job.workspace_id != workspace_id:
        raise ApiError(404, "not_found", "Job not found.", {"jobId": job_id})
    transition_job(s, job, "cancelled")
    _cancel_pending_items_locked(s, job)
    for col in _columns_for_job(s, job):
        _update_step_locked(s, job, col)
    if _remaining_items(s, job.id) == 0:
        settle_locked(s, job)
    events.notify(s, job.id)
    log.info("job_cancelled %s", job.id)
    return job


# ------------------------------------------------------------------ items


def _cell_source_for(result: ExecResult) -> str | None:
    if result.provider_calls:
        return result.provider_calls[0].provider
    return None


# §8.8: these provider error codes are job-level, not cell-level — the job
# fails and its remaining pending items cancel.
_JOB_LEVEL_PROVIDER_CODES = ("provider_out_of_credits", "provider_auth")


def _fail_job_provider_locked(
    s: Session, job: Job, code: str, message: str
) -> None:
    """§8.8 job-level provider error: remaining pending items cancel, the job
    settles ``failed`` carrying the provider error. Caller holds the lock."""
    _cancel_pending_items_locked(s, job)
    for col in _columns_for_job(s, job):
        _update_step_locked(s, job, col)
    job.error = {"code": code, "message": message}
    events.append_event(s, job.id, "error", {"code": code, "message": message})
    settle_locked(s, job, force_status="failed")


def complete_item(
    s: Session,
    item_id: str,
    result: ExecResult,
    *,
    settings: Settings | None = None,
    executor_version: str | None = None,
) -> str:
    """The §8.2 step-4 transaction, minus ledger work. Caller commits.

    Side effects beyond the cell write: provider_calls rows, the §8.6 cache
    store (only when a TTL is configured for the enrichment and the executor
    version is known), §8.7 signal rows, and the §8.8 job-level cascade when
    the provider error is out-of-credits or auth.

    Returns "done" when the result was recorded, "skipped" when the item is
    no longer running under this worker (lease lost / recovered elsewhere).
    """
    item = s.execute(
        select(JobItem).where(JobItem.id == item_id).with_for_update()
    ).scalar_one()
    if item.status != "running":
        return "skipped"
    job = _lock_job(s, item.job_id)
    column = sheets.get_column_by_id(s, item.column_id) if item.column_id else None
    payload = item.payload or {}
    cost = int(payload.get("cost") or 0) if result.status == "succeeded" else 0
    assert item.row_id is not None and item.column_id is not None

    cell = sheets.write_enrichment_result(
        s,
        item.row_id,
        item.column_id,
        status=result.status,
        value=result.value,
        provenance=result.provenance,
        confidence_label=result.confidence_label,
        cost=cost,
        error=asdict(result.error) if result.error else None,
        sources=[asdict(src) for src in result.sources],
        source=_cell_source_for(result),
        run_id=payload.get("runId"),
    )
    if cell is None:  # became user_edited mid-run: keep result, no charge (§8.4)
        cost = 0
    # P4b: a claim-time MoltSets reservation (status_code NULL provider_calls
    # row) is replaced by the real attempt rows — it already counted worst
    # case, so releasing it before inserting actuals keeps the window
    # accounting exact. Executor bailouts (no calls) just drop the hold.
    reservation_id = payload.get("moltsetsReservationId")
    if reservation_id:
        reservation = s.get(ProviderCall, reservation_id)
        if reservation is not None and reservation.status_code is None:
            s.delete(reservation)
    for call in result.provider_calls:
        s.add(
            ProviderCall(
                id=new_id("enr"),
                job_id=job.id,
                row_id=item.row_id,
                provider=call.provider,
                endpoint=call.endpoint,
                status_code=call.status_code,
                request_id=call.request_id,
                cost_dollars=call.cost_dollars,
                ms=call.ms,
                tokens=call.tokens,
                records_returned=call.records_returned,
            )
        )
    enrichment_id = payload.get("enrichmentId")
    if cell is not None and result.signals:
        enrichment_signals.emit(s, company_row_id=item.row_id, result=result)
    if cell is not None and result.leaders:
        enrichment_leaders.emit(s, company_row_id=item.row_id, result=result)
    if (
        settings is not None
        and executor_version is not None
        and column is not None
        and result.status == "succeeded"
    ):
        ttl = enrichment_cache.ttl_for(settings, enrichment_id)
        if ttl is not None:
            row = sheets.get_row(s, item.row_id)
            if row.normalized_domain:
                enrichment_cache.store(
                    s,
                    normalized_domain=row.normalized_domain,
                    enrichment_id=str(enrichment_id),
                    prompt_hash=ex_common.prompt_hash(
                        column.prompt, column.params
                    ),
                    executor_version=executor_version,
                    result=result,
                )
    item.status = "done"
    item.lease_until = None
    item.result = asdict(result)
    progress = dict(job.progress or {})
    progress["done"] = int(progress.get("done") or 0) + 1
    job.progress = progress
    job.charged_credits = (job.charged_credits or 0) + cost
    run_id = payload.get("runId")
    if run_id:
        run = s.get(EnrichmentRun, run_id)
        if run is not None:
            run.charged_credits = (run.charged_credits or 0) + cost
    s.flush()
    if cell is not None and column is not None:
        events.append_event(s, job.id, "cell", cell_view(cell, column, s))
    events.append_event(s, job.id, "progress", progress)
    if column is not None:
        _update_step_locked(s, job, column)
    if (
        result.status == "failed"
        and result.error is not None
        and result.error.code in _JOB_LEVEL_PROVIDER_CODES
    ):
        _fail_job_provider_locked(
            s, job, result.error.code, result.error.message
        )
    else:
        maybe_settle(s, job)
    events.notify(s, job.id)
    log.info(
        "item_done job_id=%s row_id=%s request_id=%s status=%s cost=%s",
        job.id,
        item.row_id,
        result.provider_calls[0].request_id if result.provider_calls else None,
        result.status,
        cost,
    )
    return "done"


def fail_item_final(s: Session, item: JobItem, job: Job) -> None:
    """Lease exhausted max_attempts: item done, cell failed/provider_unavailable.
    Caller holds the job lock."""
    column = (
        sheets.get_column_by_id(s, item.column_id) if item.column_id else None
    )
    error = {
        "code": "provider_unavailable",
        "message": "Provider did not respond in time.",
    }
    cell = None
    if item.row_id is not None and item.column_id is not None:
        cell = sheets.write_enrichment_result(
            s,
            item.row_id,
            item.column_id,
            status="failed",
            cost=0,
            error=error,
            run_id=(item.payload or {}).get("runId"),
        )
    _release_moltsets_reservation(s, item)
    item.status = "done"
    item.lease_until = None
    item.result = {"status": "failed", "error": error}
    progress = dict(job.progress or {})
    progress["done"] = int(progress.get("done") or 0) + 1
    job.progress = progress
    s.flush()
    if cell is not None and column is not None:
        events.append_event(s, job.id, "cell", cell_view(cell, column, s))
    events.append_event(s, job.id, "progress", progress)
    if column is not None:
        _update_step_locked(s, job, column)
    maybe_settle(s, job)


def return_item_to_pending(
    s: Session, item_id: str, *, available_at: datetime
) -> bool:
    """P4b provider-defer path (429 / gate): item back to ``pending`` WITHOUT
    ``attempts`` increment — the provider never ran, so this must not burn
    a max-attempts retry. ``available_at`` keeps it out of claim_items until
    the backoff expires; the claim-time MoltSets reservation (if any) stays
    open so the retry is guaranteed to fit the window. The cell reverts to
    ``pending`` (mock vocabulary; "waiting" is not a contract step status).
    """
    item = s.execute(
        select(JobItem).where(JobItem.id == item_id).with_for_update()
    ).scalar_one()
    if item.status != "running":
        return False
    job = _lock_job(s, item.job_id)
    item.status = "pending"
    item.lease_until = None
    item.available_at = available_at
    column = (
        sheets.get_column_by_id(s, item.column_id) if item.column_id else None
    )
    if item.row_id is not None and item.column_id is not None:
        cell = sheets.write_enrichment_result(
            s,
            item.row_id,
            item.column_id,
            status="pending",
            cost=0,
            set_fetched_at=False,
            run_id=(item.payload or {}).get("runId"),
        )
        if cell is not None and column is not None:
            events.append_event(s, job.id, "cell", cell_view(cell, column, s))
    events.notify(s, job.id)
    return True
