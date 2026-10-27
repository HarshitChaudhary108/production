"""MoltSets plan gate (P4b human design, docs rate-limits page).

MoltSets publishes NO requests/minute — limits are ROLLING 5-hour/1-week
Fair Use windows (records + requests) per plan plus concurrent-search
caps. The window rolls from the first request, not a fixed reset. All
limits are per-ACCOUNT: every key and consumer shares the pool, so a
budget_fraction holds headroom for other users of the same account.

Design (per the human):

- **Usage source of truth = ``provider_calls``** (durable, shared by all
  workers/processes). Requests = row count in the window; records =
  ``SUM(records_returned)``. Pools: ``search_people`` draws from the
  SEARCH record window, every other tool from the ENRICH record window.
- **Reserve before calling** in the claim transaction: a call needs
  ``1 request + limit records`` (search) or the batch size (email
  lookups). The reservation is a ``provider_calls`` row with
  ``status_code NULL`` + worst-case ``records_returned`` — so the usage
  query already counts it. ``complete_item`` replaces it with the real
  attempt rows (no request → row deleted).
- **Claim-time gating**: when a budget is exhausted the claim query
  skips items of the affected enrichments; Exa items keep flowing.
- **Concurrency across processes**: ``pg_try_advisory_lock`` slots
  (``moltsets:slot:1..N``) — none free → don't claim MoltSets items.
- The budget check inside the claim tx runs under a transaction-scoped
  advisory lock (``moltsets:budget``) so check+reserve is atomic across
  workers — no TOCTOU overshoot.
"""

from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from app.config import Settings
from app.ids import new_id
from app.modules.jobs.models import JobItem
from app.modules.providers.models import ProviderCall

PROVIDER = "moltsets"
_SEARCH_ENDPOINT = "search_people"
_BUDGET_LOCK_KEY = "moltsets:budget"
_SLOT_KEY_PREFIX = "moltsets:slot:"

# enrichment_id -> the MoltSets tool pool it draws from ("search" /
# "enrich"); find_work_email's concrete tool is picked per row but both
# tools draw from the enrich pool.
ENRICHMENT_ENDPOINT: dict[str, str] = {
    "find_decision_makers": "search_people",
    "find_work_email": "work_email",
}


def reserved_records_for(
    enrichment_id: str | None, params: dict[str, Any] | None
) -> int:
    """Worst-case Fair Use records this item's call will consume — the
    claim-time reservation amount (design point 3)."""
    if enrichment_id == "find_decision_makers":
        try:
            return min(max(1, int((params or {}).get("limit", 10))), 25)
        except (TypeError, ValueError):
            return 10
    if enrichment_id == "find_work_email":
        return 1
    return 0


@dataclass(frozen=True)
class Usage:
    requests: int
    search_records: int
    enrich_records: int
    oldest_at: datetime | None


@dataclass(frozen=True)
class GateStatus:
    blocked_ids: frozenset[str]
    resume_at: datetime | None


class SlotToken:
    """One held advisory-lock slot. The lock is SESSION-level so it must be
    released explicitly — session.close() would return the pooled connection
    with the lock still held and leak it to the next borrower."""

    def __init__(self, session: Session, index: int, key: str) -> None:
        self._session = session
        self.index = index
        self._key = key

    def release(self) -> None:
        try:
            self._session.execute(
                select(func.pg_advisory_unlock(func.hashtext(self._key)))
            )
        finally:
            self._session.close()


class MoltSetsGate:
    """Worker-side gate: claim exclusion, in-claim reservation, slot
    leasing. ``session_factory`` is the app's sync factory; ``now_fn`` is
    injectable for tests (fake clock)."""

    def __init__(
        self,
        session_factory: sessionmaker[Session],
        settings: Settings,
        *,
        now_fn: Callable[[], datetime] | None = None,
        slot_backoff_s: float = 2.0,
    ) -> None:
        self._factory = session_factory
        self._settings = settings
        self._now = now_fn or (lambda: datetime.now(UTC))
        self.slot_backoff_s = slot_backoff_s
        fraction = min(1.0, settings.moltsets_budget_fraction)
        self._req_budget = int(settings.moltsets_requests_per_window * fraction)
        self._search_budget = int(
            settings.moltsets_search_records_per_window * fraction
        )
        self._enrich_budget = int(
            settings.moltsets_enrich_records_per_window * fraction
        )
        self._window = timedelta(hours=settings.moltsets_window_hours)

    # ------------------------------------------------------------ usage

    def usage(self, s: Session) -> Usage:
        """Rolling-window usage from provider_calls (design point 2).
        Reservation rows count too — their worst-case records make
        parallel claims conservative."""
        cutoff = self._now() - self._window
        row = s.execute(
            select(
                func.count(),
                func.coalesce(
                    func.sum(ProviderCall.records_returned).filter(
                        ProviderCall.endpoint == _SEARCH_ENDPOINT
                    ),
                    0,
                ),
                func.coalesce(
                    func.sum(ProviderCall.records_returned).filter(
                        ProviderCall.endpoint != _SEARCH_ENDPOINT
                    ),
                    0,
                ),
                func.min(ProviderCall.created_at),
            ).where(
                ProviderCall.provider == PROVIDER,
                ProviderCall.created_at > cutoff,
            )
        ).one()
        return Usage(
            requests=int(row[0] or 0),
            search_records=int(row[1] or 0),
            enrich_records=int(row[2] or 0),
            oldest_at=row[3],
        )

    def resume_hint(self, s: Session) -> datetime | None:
        """Earliest moment any windowed usage expires — the oldest call
        in the window + ``window_hours`` (rolling windows)."""
        oldest = self.usage(s).oldest_at
        return oldest + self._window if oldest is not None else None

    # ------------------------------------------------------- claim gating

    def lock_budget(self, s: Session) -> None:
        """Serialize check+reserve across workers inside the claim tx."""
        s.execute(
            select(func.pg_advisory_xact_lock(func.hashtext(_BUDGET_LOCK_KEY)))
        )

    def gate_status(
        self, s: Session, moltsets_ids: set[str]
    ) -> GateStatus:
        """Tick-level exclusion set (design point 4): which enrichment
        ids cannot fit right now. The in-claim recheck is authoritative;
        this just skips the obviously-blocked before cells go running."""
        if not moltsets_ids:
            return GateStatus(frozenset(), None)
        usage = self.usage(s)
        if usage.requests + 1 > self._req_budget:
            return GateStatus(frozenset(moltsets_ids), self.resume_hint(s))
        blocked: set[str] = set()
        needs = self._pending_needs(s, moltsets_ids)
        for eid in moltsets_ids:
            endpoint = ENRICHMENT_ENDPOINT.get(eid, "work_email")
            pool_used, pool_budget = (
                (usage.search_records, self._search_budget)
                if endpoint == _SEARCH_ENDPOINT
                else (usage.enrich_records, self._enrich_budget)
            )
            if pool_used + needs.get(eid, 1) > pool_budget:
                blocked.add(eid)
        return GateStatus(frozenset(blocked), self.resume_hint(s) if blocked else None)

    def _pending_needs(self, s: Session, moltsets_ids: set[str]) -> dict[str, int]:
        """Max ``reservedRecords`` among pending items per enrichment —
        the exclusion check uses the real per-column needs."""
        rows = s.execute(
            select(
                JobItem.payload["enrichmentId"].astext,
                JobItem.payload["reservedRecords"].astext,
            )
            .where(JobItem.status == "pending")
            .where(JobItem.payload["enrichmentId"].astext.in_(moltsets_ids))
        ).all()
        needs: dict[str, int] = {}
        for eid, reserved in rows:
            if eid is None:
                continue
            try:
                need = max(1, int(reserved or 1))
            except (TypeError, ValueError):
                need = 1
            needs[eid] = max(needs.get(eid, 0), need)
        return needs

    # --------------------------------------------------- in-claim reserve

    def reserve_in_claim(self, s: Session, item: JobItem) -> bool:
        """``claim_gate`` callback, runs inside the claim transaction
        (design points 3+5): re-check the window under the advisory lock
        and, when it fits, insert the reservation row and stamp its id
        on the item payload. An existing OPEN reservation (re-claim
        after a crash/lease) is reused — it is already counted."""
        payload = item.payload or {}
        eid = payload.get("enrichmentId")
        if eid not in ENRICHMENT_ENDPOINT:
            return True  # not a MoltSets item — no budget, no lock
        self.lock_budget(s)
        rid = payload.get("moltsetsReservationId")
        if rid:
            existing = s.get(ProviderCall, rid)
            if existing is not None and existing.status_code is None:
                return True  # still open — already counted, nothing to do
        try:
            need = max(1, int(payload.get("reservedRecords") or 1))
        except (TypeError, ValueError):
            need = 1
        endpoint = ENRICHMENT_ENDPOINT[eid]
        usage = self.usage(s)
        if usage.requests + 1 > self._req_budget:
            return False
        pool_used, pool_budget = (
            (usage.search_records, self._search_budget)
            if endpoint == _SEARCH_ENDPOINT
            else (usage.enrich_records, self._enrich_budget)
        )
        if pool_used + need > pool_budget:
            return False
        row = ProviderCall(
            id=new_id("enr"),
            job_id=item.job_id,
            row_id=item.row_id,
            provider=PROVIDER,
            endpoint=endpoint,
            status_code=None,
            records_returned=need,
        )
        s.add(row)
        s.flush()
        item.payload = {**payload, "moltsetsReservationId": row.id}
        return True

    # ------------------------------------------------------- concurrency

    def acquire_slot(self) -> SlotToken | None:
        """``pg_try_advisory_lock`` on slots 1..moltsets_max_concurrent —
        the per-ACCOUNT search concurrency cap, correct across worker
        processes (design point 5). Each slot is a dedicated session;
        closing it releases the lock."""
        for i in range(self._settings.moltsets_max_concurrent):
            session = self._factory()
            key = f"{_SLOT_KEY_PREFIX}{i}"
            held = session.execute(
                select(func.pg_try_advisory_lock(func.hashtext(key)))
            ).scalar()
            if held:
                return SlotToken(session, i, key)
            session.close()
        return None
