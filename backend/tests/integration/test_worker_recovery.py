"""Worker recovery (plan §8.2.6): crash mid-run -> restart completes exactly
once; lease expiry -> pending with attempts+1 -> failed/provider_unavailable
after max_attempts; paused jobs are skipped; two workers never double-process."""

import threading
import time
from datetime import UTC, datetime, timedelta
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.modules.jobs import queue
from app.modules.jobs import service as jobs_service
from app.modules.jobs.models import JobItem
from app.modules.sheets import service as sheets_service
from app.modules.sheets.models import Cell
from tests.support.fake_executor import (
    TEST_CATALOG,
    FakeExecutor,
    seed_demo_companies,
)

BASE = "/api/v1"
TERMINAL = {"succeeded", "failed", "cancelled"}


@pytest.fixture(scope="module")
def demo(engine: Engine, migrated: None) -> dict[str, Any]:
    with Session(engine) as s:
        sheet, rows = seed_demo_companies(s)
        s.commit()
        return {"sheet_id": sheet.id, "rows": rows}


@pytest.fixture(autouse=True)
def _clean_job_tables(engine: Engine) -> None:
    """claim_items claims across every running job; other tests leave running
    jobs/items behind on the shared demo sheet. Start each test job-clean."""
    with engine.begin() as conn:
        conn.execute(
            text(
                "TRUNCATE job_events, job_items, provider_calls, "
                "enrichment_runs, jobs CASCADE"
            )
        )


def _post_run(
    client: TestClient, demo: dict[str, Any], row_names: list[str],
    columns: list[dict[str, Any]],
) -> dict[str, Any]:
    res = client.post(
        f"{BASE}/enrichments/runs",
        json={
            "target": {
                "sheetId": demo["sheet_id"],
                "rowIds": [demo["rows"][n] for n in row_names],
            },
            "columns": columns,
        },
    )
    assert res.status_code == 202
    return res.json()


def _wait_job(client: TestClient, job_id: str, timeout_s: float = 15.0) -> dict:
    deadline = time.monotonic() + timeout_s
    while time.monotonic() < deadline:
        job = client.get(f"{BASE}/jobs/{job_id}").json()
        if job["status"] in TERMINAL:
            return job
        time.sleep(0.02)
    raise AssertionError(f"job {job_id} not terminal")


def _items(engine: Engine, job_id: str) -> list[JobItem]:
    with Session(engine) as s:
        return list(
            s.execute(
                select(JobItem).where(JobItem.job_id == job_id)
            ).scalars()
        )


def test_killed_worker_restart_completes_exactly_once(
    client: TestClient, demo: dict[str, Any],
    engine: Engine, settings: Any,
) -> None:
    """Simulate a crash: claim items (lease set) then abandon them. A new
    worker's recovery pass re-queues them; the run completes with each cell
    written exactly once and chargedCredits counted once."""
    created = _post_run(
        client, demo,
        ["Acme", "RevenueFlow"],
        [{"key": "funding", "enrichmentId": "find_funding"}],
    )
    job_id = created["jobId"]

    # worker A "dies": promote the job, claim all items, never complete them.
    with Session(engine) as s:
        queue.promote_queued(s)
        claimed = queue.claim_items(s, now=datetime.now(UTC), lease_seconds=0.05, limit=10)
        assert len(claimed) == 2
        s.commit()
    # process nothing; let the lease lapse, then a fresh worker takes over.
    time.sleep(0.08)

    from app.worker.main import Worker

    executor = FakeExecutor()
    worker = Worker(engine, settings, {eid: executor for eid in TEST_CATALOG})
    job = None
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        worker.run_once()
        job = _wait_or_none(client, job_id)
        if job and job["status"] in TERMINAL:
            break
        time.sleep(0.01)
    assert job and job["status"] == "succeeded"
    assert job["chargedCredits"] == 6

    with Session(engine) as s:
        cells = list(s.execute(select(Cell)).scalars())
        target = [
            c for c in cells
            if c.row_id in (demo["rows"]["Acme"], demo["rows"]["RevenueFlow"])
            and c.last_run_id == created["runId"]
        ]
        assert len(target) == 2
        assert all(c.status == "succeeded" and c.cost == 3 for c in target)
    # each cell executed exactly once despite the crash + recovery
    assert all(v == 1 for v in executor.executions.values())


def _wait_or_none(client: TestClient, job_id: str) -> dict | None:
    res = client.get(f"{BASE}/jobs/{job_id}")
    return res.json() if res.status_code == 200 else None


def test_lease_expiry_requeues_then_fails_after_max_attempts(
    db: Session, demo: dict[str, Any]
) -> None:
    """A stuck running item returns to pending with attempts+1; once attempts
    reach max_attempts the cell ends failed / provider_unavailable."""
    col = sheets_service.add_column(
        db, demo["sheet_id"], label=f"retry {time.time_ns()}",
        type="badge", enrichment_id="find_funding",
    )
    row = sheets_service.get_row(db, demo["rows"]["Acme"])
    job = jobs_service.create_cell_job(
        db, workspace_id="ws_demo", job_type="enrichment", run_id=None,
        sheet_id=demo["sheet_id"], columns=[col], rows=[row],
        column_costs={col.id: 3},
    )
    jobs_service.transition_job(db, job, "running")
    item = db.execute(
        select(JobItem).where(JobItem.job_id == job.id)
    ).scalar_one()
    db.flush()

    now = datetime.now(UTC)
    # 1) expired lease -> pending with attempts+1
    item.status = "running"
    item.lease_until = now - timedelta(seconds=1)
    item.attempts = 1
    db.flush()
    queue.recover_expired_leases(db, now=now, max_attempts=5)
    assert item.status == "pending"
    assert item.attempts == 2
    assert item.lease_until is None

    # 2) expiry at the last allowed attempt -> item done, cell failed
    item.status = "running"
    item.lease_until = now - timedelta(seconds=1)
    item.attempts = 4  # next expiry pushes attempts to 5 == max_attempts
    db.flush()
    queue.recover_expired_leases(db, now=now, max_attempts=5)
    assert item.status == "done"
    assert item.result is not None and item.result["status"] == "failed"
    cell = db.get(Cell, (row.id, col.id))
    assert cell is not None
    assert cell.status == "failed"
    assert cell.error == {
        "code": "provider_unavailable",
        "message": "Provider did not respond in time.",
    }
    assert cell.cost == 0
    # job settled as failed (every item failed)
    db.refresh(job)
    assert job.status == "failed"
    assert job.result == {"summary": {"succeeded": 0, "failed": 1, "noData": 0}}


def test_paused_job_items_are_not_claimed_and_resume_continues(
    client: TestClient, demo: dict[str, Any],
    engine: Engine, settings: Any,
) -> None:
    created = _post_run(
        client, demo, ["Acme"],
        [{"key": "funding", "enrichmentId": "find_funding"}],
    )
    job_id = created["jobId"]

    from app.worker.main import Worker

    executor = FakeExecutor()
    worker = Worker(engine, settings, {eid: executor for eid in TEST_CATALOG})

    # promote to running, then pause before the worker claims anything
    with Session(engine) as s:
        queue.promote_queued(s)
        job = jobs_service.get_job(s, "ws_demo", job_id)
        jobs_service.pause_job(s, "ws_demo", job.id)
        s.commit()
        items = queue.claim_items(
            s, now=datetime.now(UTC), lease_seconds=30, limit=10
        )
        s.commit()
    assert items == []

    resume = client.post(f"{BASE}/jobs/{job_id}/resume")
    assert resume.status_code == 200
    job = None
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        worker.run_once()
        job = _wait_or_none(client, job_id)
        if job and job["status"] in TERMINAL:
            break
        time.sleep(0.01)
    assert job and job["status"] == "succeeded"


def test_two_workers_never_process_the_same_item_twice(
    client: TestClient, demo: dict[str, Any],
    engine: Engine, settings: Any,
) -> None:
    created = _post_run(
        client, demo,
        ["Acme", "RevenueFlow", "Northwind Labs"],
        [{"key": "funding", "enrichmentId": "find_funding"},
         {"key": "news", "enrichmentId": "find_company_news"}],
    )
    job_id = created["jobId"]

    from app.worker.main import Worker

    executor = FakeExecutor(cell_ms=30)
    executors = {eid: executor for eid in TEST_CATALOG}
    w1 = Worker(engine, settings, executors)
    w2 = Worker(engine, settings, executors)

    def loop(w: Any, stop: threading.Event) -> None:
        while not stop.is_set():
            w.run_once()
            time.sleep(0.005)

    stop = threading.Event()
    t1 = threading.Thread(target=loop, args=(w1, stop))
    t2 = threading.Thread(target=loop, args=(w2, stop))
    t1.start()
    t2.start()
    try:
        job = _wait_job(client, job_id, timeout_s=30)
    finally:
        stop.set()
        t1.join(10)
        t2.join(10)

    assert job["status"] == "succeeded"
    assert job["chargedCredits"] == 3 * (3 + 3)  # 3 rows x (3+3)
    # 6 cells, each executed exactly once (SKIP LOCKED)
    assert sum(executor.executions.values()) == 6
    assert all(v == 1 for v in executor.executions.values())
    with Session(engine) as s:
        cells = list(
            s.execute(select(Cell).where(Cell.last_run_id == created["runId"]))
            .scalars()
        )
    assert len(cells) == 6
    assert all(c.status == "succeeded" for c in cells)
