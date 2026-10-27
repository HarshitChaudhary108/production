"""MoltSetsGate (P4b): rolling-window budgets over provider_calls, claim-time
reservations, exclusion sets, advisory-lock concurrency slots — real Postgres.

Covers: requests/records pools (search_people vs enrich tools) inside the
rolling window; reservation rows count as worst-case usage; reserve_in_claim
creates + reuses open reservations and refuses when a budget cannot fit the
need; gate_status blocks only the saturated enrichment ids; acquire_slot
honours moltsets_max_concurrent across separate sessions and frees on release.
"""

from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.config import Settings
from app.db import make_session_factory
from app.ids import new_id
from app.modules.jobs import service as jobs_service
from app.modules.jobs.models import Job, JobItem
from app.modules.providers.models import ProviderCall
from app.modules.providers.moltsets.rate_limit import (
    MoltSetsGate,
    reserved_records_for,
)


def _settings(settings: Settings, **over: object) -> Settings:
    return settings.model_copy(update=over)


def _call(
    *,
    endpoint: str = "search_people",
    records: int | None = 1,
    status: int | None = 200,
    created_at: datetime | None = None,
) -> ProviderCall:
    row = ProviderCall(
        id=new_id("enr"),
        provider="moltsets",
        endpoint=endpoint,
        status_code=status,
        records_returned=records,
    )
    if created_at is not None:
        row.created_at = created_at
    return row


def _job(db: Session) -> Job:
    job = Job(id=new_id("job"), workspace_id="ws_demo", type="enrichment")
    db.add(job)
    db.flush()
    return job


def _item(
    db: Session, *, eid: str = "find_decision_makers", reserved: int = 10
) -> JobItem:
    item = JobItem(
        id=new_id("job"),
        job_id=_job(db).id,
        kind="cell",
        status="pending",
        payload={"enrichmentId": eid, "reservedRecords": reserved},
    )
    db.add(item)
    db.flush()
    return item


def _open_reservations(db: Session) -> int:
    return db.execute(
        select(func.count())
        .select_from(ProviderCall)
        .where(ProviderCall.status_code.is_(None))
    ).scalar_one()


# ------------------------------------------------------------- usage window


def test_usage_counts_only_in_window(
    db: Session, engine: Engine, settings: Settings
) -> None:
    gate = MoltSetsGate(make_session_factory(engine), settings)
    now = datetime.now(UTC)
    db.add(_call(endpoint="search_people", records=3))
    db.add(_call(endpoint="linkedin_to_business_email", records=1))
    db.add(
        _call(
            endpoint="search_people",
            records=99,
            created_at=now - timedelta(hours=6),
        )
    )
    db.flush()
    usage = gate.usage(db)
    assert usage.requests == 2
    assert usage.search_records == 3  # the 6h-old search call aged out
    assert usage.enrich_records == 1


def test_reserved_records_for() -> None:
    assert reserved_records_for("find_decision_makers", None) == 10
    assert reserved_records_for("find_decision_makers", {"limit": 25}) == 25
    assert reserved_records_for("find_decision_makers", {"limit": 99}) == 25
    assert reserved_records_for("find_work_email", None) == 1
    assert reserved_records_for("find_snapshot", None) == 0


# -------------------------------------------------------------- claim gate


def test_reserve_in_claim_creates_and_reuses(
    db: Session, engine: Engine, settings: Settings
) -> None:
    gate = MoltSetsGate(make_session_factory(engine), settings)
    item = _item(db, reserved=10)
    assert gate.reserve_in_claim(db, item) is True
    rid = item.payload["moltsetsReservationId"]
    res = db.get(ProviderCall, rid)
    assert res is not None
    assert res.status_code is None  # open hold
    assert res.records_returned == 10  # worst case
    assert res.endpoint == "search_people"
    # reclaim (crash recovery): the OPEN reservation is reused, not duplicated
    assert gate.reserve_in_claim(db, item) is True
    assert _open_reservations(db) == 1


def test_reserve_in_claim_passes_non_moltsets(
    db: Session, engine: Engine, settings: Settings
) -> None:
    gate = MoltSetsGate(make_session_factory(engine), settings)
    item = _item(db, eid="find_revenue")
    assert gate.reserve_in_claim(db, item) is True
    assert "moltsetsReservationId" not in (item.payload or {})


def test_reserve_in_claim_refuses_on_search_budget(
    db: Session, engine: Engine, settings: Settings
) -> None:
    tiny = _settings(
        settings,
        moltsets_search_records_per_window=10,
        moltsets_budget_fraction=1.0,
    )
    gate = MoltSetsGate(make_session_factory(engine), tiny)
    db.add(_call(endpoint="search_people", records=8))
    db.flush()
    item = _item(db, reserved=10)  # 8 + 10 > 10
    assert gate.reserve_in_claim(db, item) is False
    assert _open_reservations(db) == 0


def test_reserve_in_claim_refuses_on_request_budget(
    db: Session, engine: Engine, settings: Settings
) -> None:
    tiny = _settings(
        settings,
        moltsets_requests_per_window=2,
        moltsets_budget_fraction=1.0,
    )
    gate = MoltSetsGate(make_session_factory(engine), tiny)
    db.add(_call(endpoint="search_people", records=1))
    db.add(_call(endpoint="search_people", records=1))
    db.flush()
    item = _item(db, eid="find_work_email", reserved=1)
    assert gate.reserve_in_claim(db, item) is False


def test_reservations_count_as_usage(
    db: Session, engine: Engine, settings: Settings
) -> None:
    """An open reservation's worst-case records count toward the pool —
    parallel claims stay conservative (design point 3)."""
    tiny = _settings(
        settings,
        moltsets_search_records_per_window=15,
        moltsets_budget_fraction=1.0,
    )
    gate = MoltSetsGate(make_session_factory(engine), tiny)
    first = _item(db, reserved=10)
    assert gate.reserve_in_claim(db, first) is True
    usage = gate.usage(db)
    assert usage.search_records == 10  # the open reservation's worst case
    second = _item(db, reserved=10)  # 10 + 10 > 15
    assert gate.reserve_in_claim(db, second) is False


# ------------------------------------------------------ reservation release


def test_cancel_releases_open_reservation(
    db: Session, engine: Engine, settings: Settings
) -> None:
    """A deferred item (pending with an open hold) that gets cancelled
    must release its reservation — else the worst-case records leak into
    the window budget for up to 5 h."""
    gate = MoltSetsGate(make_session_factory(engine), settings)
    item = _item(db, reserved=10)
    assert gate.reserve_in_claim(db, item) is True
    item.status = "pending"  # the defer path (return_item_to_pending)
    db.flush()
    assert _open_reservations(db) == 1
    jobs_service._cancel_pending_items_locked(db, db.get(Job, item.job_id))
    assert _open_reservations(db) == 0
    assert "moltsetsReservationId" not in (item.payload or {})
    assert item.status == "cancelled"


def test_fail_item_final_releases_reservation(
    db: Session, engine: Engine, settings: Settings
) -> None:
    """Lease-exhausted final fail (crash mid-execute) also drops the
    hold — no real calls replaced it."""
    gate = MoltSetsGate(make_session_factory(engine), settings)
    item = _item(db, reserved=10)
    assert gate.reserve_in_claim(db, item) is True
    db.flush()
    job = db.get(Job, item.job_id)
    jobs_service.fail_item_final(db, item, job)
    assert _open_reservations(db) == 0
    assert "moltsetsReservationId" not in (item.payload or {})


# ------------------------------------------------------------ gate_status


def test_gate_status_blocks_only_saturated_pool(
    db: Session, engine: Engine, settings: Settings
) -> None:
    tiny = _settings(
        settings,
        moltsets_search_records_per_window=10,
        moltsets_budget_fraction=1.0,
    )
    gate = MoltSetsGate(make_session_factory(engine), tiny)
    db.add(_call(endpoint="search_people", records=9))
    _item(db, reserved=10)  # pending, needs 10 — can't fit in remaining 1
    status = gate.gate_status(db, {"find_decision_makers", "find_work_email"})
    assert "find_decision_makers" in status.blocked_ids
    assert "find_work_email" not in status.blocked_ids
    assert status.resume_at is not None


# -------------------------------------------------------------- slots


def test_slots_cap_and_release(engine: Engine, settings: Settings) -> None:
    tiny = _settings(settings, moltsets_max_concurrent=2)
    gate = MoltSetsGate(make_session_factory(engine), tiny)
    t1 = gate.acquire_slot()
    t2 = gate.acquire_slot()
    assert t1 is not None and t2 is not None
    assert gate.acquire_slot() is None  # cap reached
    t1.release()
    t3 = gate.acquire_slot()
    assert t3 is not None
    t2.release()
    t3.release()


def test_slots_released_with_session(engine: Engine, settings: Settings) -> None:
    """A slot's lock dies with its session — a crashed worker's slot is
    reclaimed by Postgres, not leaked."""
    gate = MoltSetsGate(
        make_session_factory(engine),
        _settings(settings, moltsets_max_concurrent=1),
    )
    t1 = gate.acquire_slot()
    assert t1 is not None
    assert gate.acquire_slot() is None
    t1.release()  # session close = lock release
    t3 = gate.acquire_slot()
    assert t3 is not None
    t3.release()
