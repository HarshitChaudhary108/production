"""Worker loop (plan §8.2, minus credit-ledger steps).

Each tick: recover expired leases -> promote queued jobs -> claim a batch of
pending items (``FOR UPDATE … SKIP LOCKED``) -> execute each item through its
executor -> one completion transaction per item (cell write + provider_calls +
cost/charged_credits + item done + progress/steps + events + NOTIFY).

Executors are looked up by the item's ``enrichmentId``; the worker only knows
the ``Executor`` protocol. Items execute inline per worker — concurrency comes
from multiple workers; ``max_concurrency`` caps the claim batch.
"""

import threading
import time
from collections.abc import Mapping
from datetime import UTC, datetime, timedelta

from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.config import Settings
from app.db import make_engine, make_session_factory
from app.logging import get_logger
from app.modules.catalog import registry
from app.modules.enrichment import cache as enrichment_cache
from app.modules.enrichment.executors import common
from app.modules.enrichment.executors.base import (
    ColumnConfig,
    ExecContext,
    ExecError,
    ExecResult,
    Executor,
    RowSnapshot,
)
from app.modules.jobs import queue, service
from app.modules.jobs.models import Job, JobItem
from app.modules.providers.exa.client import ExaClient
from app.modules.providers.exa.errors import ExaError
from app.modules.providers.moltsets.client import (
    MoltSetsClient,
    SyncMoltSetsClient,
)
from app.modules.providers.moltsets.errors import (
    MoltSetsError,
    MoltSetsRateLimited,
)
from app.modules.providers.moltsets.rate_limit import (
    MoltSetsGate,
    SlotToken,
)
from app.modules.sheets import service as sheets

log = get_logger("worker")


def build_executor_map(settings: Settings) -> dict[str, Executor]:
    """Resolve every visible catalog entry's executor through the registry
    and instantiate it with the matching provider client (provider comes
    from the executor class's ``provider`` attr — "exa" or "moltsets").
    Entries with no executor yet are skipped — the run route rejects them
    as ``not_runnable`` anyway."""
    exa = common.SyncExaClient(
        ExaClient(settings.exa_api_key.get_secret_value())
    )
    moltsets: SyncMoltSetsClient | None = None
    executors: dict[str, Executor] = {}
    for entry in registry.visible_catalog(settings):
        try:
            executor_cls = registry.resolve_executor(entry)
        except LookupError:
            continue
        if getattr(executor_cls, "provider", "exa") == "moltsets":
            if moltsets is None:
                moltsets = SyncMoltSetsClient(
                    MoltSetsClient(
                        settings.moltsets_api_key.get_secret_value(),
                        base_url=settings.moltsets_base_url,
                        user_agent=settings.moltsets_user_agent,
                    )
                )
            executors[entry.id] = executor_cls(moltsets)
        else:
            executors[entry.id] = executor_cls(exa)
    return executors


class _ProviderPacer:
    """Per-provider minimum-interval gate (§8.2 "per-provider rate limiter").

    ``provider_min_interval_ms`` in config; absent provider = unlimited."""

    def __init__(self, min_interval_ms: Mapping[str, float]) -> None:
        self._min = {k: v / 1000.0 for k, v in min_interval_ms.items()}
        self._last: dict[str, float] = {}
        self._lock = threading.Lock()

    def wait(self, provider: str) -> None:
        interval = self._min.get(provider)
        if not interval:
            return
        with self._lock:
            last = self._last.get(provider, 0.0)
            delay = interval - (time.monotonic() - last)
            if delay > 0:
                time.sleep(delay)
            self._last[provider] = time.monotonic()


class Worker:
    def __init__(
        self,
        engine: Engine,
        settings: Settings,
        executors: Mapping[str, Executor],
    ) -> None:
        self._factory = make_session_factory(engine)
        self._settings = settings
        self._executors = executors
        self._pacer = _ProviderPacer(settings.provider_min_interval_ms)
        self._gate = (
            MoltSetsGate(self._factory, settings)
            if any(getattr(e, "provider", "") == "moltsets" for e in executors.values())
            else None
        )
        self._last_recovery = 0.0

    # -- one tick -----------------------------------------------------------

    def run_once(self) -> int:
        """One worker iteration; returns the number of items completed."""
        now = datetime.now(UTC)
        with self._factory() as s:
            queue.recover_expired_leases(
                s, now=now, max_attempts=self._settings.max_attempts
            )
            queue.promote_queued(s)
            # P4b MoltSets gate: tick-level exclusion of budget-blocked
            # enrichment ids + the in-claim reservation recheck (atomic
            # under the gate's advisory lock). Exa items always flow.
            excluded: set[str] = set()
            if self._gate is not None:
                moltsets_ids = {
                    eid
                    for eid, ex in self._executors.items()
                    if getattr(ex, "provider", "") == "moltsets"
                }
                excluded = set(self._gate.gate_status(s, moltsets_ids).blocked_ids)
            items = queue.claim_items(
                s,
                now=now,
                lease_seconds=self._settings.job_lease_seconds,
                limit=self._settings.worker_batch_size,
                exclude_enrichment_ids=excluded,
                claim_gate=(
                    self._gate.reserve_in_claim if self._gate is not None else None
                ),
            )
            claimed = [
                (item.id, item.job_id) for item in items
            ]
            s.commit()

        for item_id, job_id in claimed:
            self._process(item_id, job_id)
        return len(claimed)

    def run_forever(
        self, stop: threading.Event, poll_interval: float | None = None
    ) -> None:
        interval = (
            poll_interval
            if poll_interval is not None
            else self._settings.worker_poll_interval_seconds
        )
        while not stop.is_set():
            try:
                self.run_once()
            except Exception:
                log.exception("worker tick failed")
            time.sleep(interval)

    # -- one item -----------------------------------------------------------

    def _snapshot(
        self, s: Session, item: JobItem
    ) -> tuple[Job, service.RowShape, service.ColumnShape]:
        from app.errors import ApiError

        job = s.get(Job, item.job_id)
        try:
            row = sheets.get_row(s, item.row_id) if item.row_id else None
        except ApiError:
            row = None
        column = (
            sheets.get_column_by_id(s, item.column_id) if item.column_id else None
        )
        if job is None or row is None or column is None:
            raise LookupError(f"item {item.id} lost its job/row/column")
        return job, row, column

    def _process(self, item_id: str, job_id: str) -> None:
        with self._factory() as s:
            item = s.get(JobItem, item_id)
            if item is None:
                return
            try:
                job, row, column = self._snapshot(s, item)
            except LookupError:
                log.warning("item_missing_refs", extra={"job_id": job_id})
                return
            payload = item.payload or {}
            enrichment_id = payload.get("enrichmentId")
            executor = self._executors.get(enrichment_id or "")
            if executor is None:
                missing = ExecResult(
                    status="failed",
                    error=ExecError(
                        code="executor_missing",
                        message=f"No executor for {enrichment_id!r}.",
                    ),
                )
                service.complete_item(
                    s, item.id, missing, settings=self._settings
                )
                s.commit()
                return
            ctx = ExecContext(
                job_id=job.id,
                workspace_id=job.workspace_id,
                run_id=payload.get("runId"),
                settings=self._settings,
            )
            row_snap = RowSnapshot(
                id=row.id, data=dict(row.data or {}), normalized_domain=row.normalized_domain
            )
            col_cfg = ColumnConfig(
                id=column.id,
                key=column.key,
                label=column.label,
                type=column.type,
                enrichment_id=column.enrichment_id,
                prompt=column.prompt,
                params=column.params,
            )
            provider = getattr(executor, "provider", "unknown")
            executor_version = getattr(executor, "EXECUTOR_VERSION", "0")
            # §8.6: cache read — only when a TTL exists for this enrichment
            # and the run did not ask for a refresh.
            ttl = enrichment_cache.ttl_for(self._settings, enrichment_id)
            result: ExecResult | None = None
            if (
                ttl is not None
                and not payload.get("refresh")
                and row_snap.normalized_domain
                and isinstance(enrichment_id, str)
            ):
                result = enrichment_cache.lookup(
                    s,
                    normalized_domain=row_snap.normalized_domain,
                    enrichment_id=enrichment_id,
                    prompt_hash=common.prompt_hash(
                        col_cfg.prompt, col_cfg.params
                    ),
                    executor_version=executor_version,
                    ttl_seconds=ttl,
                )
        # executor runs outside any transaction (provider latency must not
        # hold DB locks); the completion below is the single write txn.
        slot: SlotToken | None = None
        if result is None:
            # P4b: a MoltSets call needs one of the per-account advisory-lock
            # concurrency slots. None free -> defer (pending + available_at),
            # never a cell outcome, attempts untouched.
            if provider == "moltsets" and self._gate is not None:
                slot = self._gate.acquire_slot()
                if slot is None:
                    defer = datetime.now(UTC) + timedelta(
                        seconds=self._gate.slot_backoff_s
                    )
                    with self._factory() as s:
                        service.return_item_to_pending(
                            s, item_id, available_at=defer
                        )
                        s.commit()
                    return
            self._pacer.wait(provider)
            try:
                result = executor.execute(row_snap, col_cfg, ctx)
            except MoltSetsRateLimited as exc:
                # 429 after client retries: defer, do NOT fail the cell and
                # do NOT consume an attempt. Retry-After is authoritative.
                backoff = (
                    exc.retry_after
                    if exc.retry_after is not None
                    else (self._gate.slot_backoff_s if self._gate else 30.0)
                )
                defer = datetime.now(UTC) + timedelta(seconds=backoff)
                with self._factory() as s:
                    service.return_item_to_pending(
                        s, item_id, available_at=defer
                    )
                    s.commit()
                return
            except MoltSetsError as exc:  # escaped executor's own mapping
                result = ExecResult(
                    status="failed",
                    error=ExecError(code=exc.code, message=exc.message),
                )
            except ExaError as exc:  # escaped executor's own mapping (§8.8)
                result = common.exa_error_result(exc, [])
            except Exception as exc:
                log.exception(
                    "executor crashed",
                    extra={"job_id": job_id, "row_id": row_snap.id},
                )
                result = ExecResult(
                    status="failed",
                    error=ExecError(code="internal_error", message=str(exc)),
                )
            finally:
                if slot is not None:
                    slot.release()
        with self._factory() as s:
            outcome = service.complete_item(
                s,
                item_id,
                result,
                settings=self._settings,
                executor_version=executor_version,
            )
            s.commit()
        if outcome == "skipped":
            log.info(
                "item_skipped lease lost or recovered elsewhere",
                extra={"job_id": job_id},
            )


def main() -> None:
    settings = Settings()  # type: ignore[call-arg]
    engine = make_engine(settings)
    worker = Worker(engine, settings, executors=build_executor_map(settings))
    stop = threading.Event()
    try:
        worker.run_forever(stop)
    except KeyboardInterrupt:
        stop.set()


if __name__ == "__main__":
    main()
