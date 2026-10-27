"""Job state machine: legal transitions pass, illegal ones raise
invalid_state; terminal status follows the mock rule extended for no_data
(succeeded if >=1 item succeeded or no_data; failed iff every item failed)."""

import time
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.errors import ApiError
from app.modules.jobs import service as jobs_service
from app.modules.sheets import service as sheets
from tests.support.fake_executor import TEST_CATALOG, seed_demo_companies

BASE = "/api/v1"


@pytest.fixture(scope="module")
def demo(engine: Engine, migrated: None) -> dict[str, Any]:
    with Session(engine) as s:
        sheet, rows = seed_demo_companies(s)
        s.commit()
        return {"sheet_id": sheet.id, "rows": rows}


def _make_job(
    s: Session, demo: dict[str, Any], row_names: list[str], n_columns: int = 1
) -> Any:
    """A real enrichment job (queued) over the demo sheet."""
    columns = [
        sheets.add_column(
            s,
            demo["sheet_id"],
            label=f"Funding {i} {time.time_ns()}",
            type="badge",
            enrichment_id="find_funding",
        )
        for i in range(n_columns)
    ]
    rows = [sheets.get_row(s, demo["rows"][name]) for name in row_names]
    job = jobs_service.create_cell_job(
        s,
        workspace_id="ws_demo",
        job_type="enrichment",
        run_id=None,
        sheet_id=demo["sheet_id"],
        columns=columns,
        rows=rows,
        column_costs={c.id: TEST_CATALOG["find_funding"]["cost"] for c in columns},
    )
    s.flush()
    return job


def test_legal_transitions(db: Session, demo: dict[str, Any]) -> None:
    job = _make_job(db, demo, ["Acme"])
    assert job.status == "queued"

    jobs_service.transition_job(db, job, "running")
    assert job.status == "running"

    jobs_service.pause_job(db, "ws_demo", job.id)
    assert job.status == "paused"

    jobs_service.resume_job(db, "ws_demo", job.id)
    assert job.status == "running"

    jobs_service.transition_job(db, job, "succeeded")
    assert job.status == "succeeded"


def test_cancel_from_queued(db: Session, demo: dict[str, Any]) -> None:
    job = _make_job(db, demo, ["Acme"])
    jobs_service.cancel_job(db, "ws_demo", job.id)
    assert job.status == "cancelled"


def test_pause_then_cancel(db: Session, demo: dict[str, Any]) -> None:
    job = _make_job(db, demo, ["Acme"])
    jobs_service.transition_job(db, job, "running")
    jobs_service.pause_job(db, "ws_demo", job.id)
    jobs_service.cancel_job(db, "ws_demo", job.id)
    assert job.status == "cancelled"


@pytest.mark.parametrize("terminal", ["succeeded", "failed", "cancelled"])
def test_terminal_jobs_reject_everything(
    db: Session, demo: dict[str, Any], terminal: str
) -> None:
    job = _make_job(db, demo, ["Acme"])
    jobs_service.transition_job(db, job, "running")
    jobs_service.transition_job(db, job, terminal)
    for action in (
        jobs_service.pause_job,
        jobs_service.resume_job,
        jobs_service.cancel_job,
    ):
        with pytest.raises(ApiError) as exc:
            action(db, "ws_demo", job.id)
        assert exc.value.status == 409
        assert exc.value.code == "invalid_state"


def test_pause_queued_and_resume_running_are_invalid(
    db: Session, demo: dict[str, Any]
) -> None:
    job = _make_job(db, demo, ["Acme"])
    with pytest.raises(ApiError) as exc:
        jobs_service.pause_job(db, "ws_demo", job.id)
    assert exc.value.code == "invalid_state"

    jobs_service.transition_job(db, job, "running")
    with pytest.raises(ApiError) as exc:
        jobs_service.resume_job(db, "ws_demo", job.id)
    assert exc.value.code == "invalid_state"


def test_illegal_direct_transition(db: Session, demo: dict[str, Any]) -> None:
    job = _make_job(db, demo, ["Acme"])
    with pytest.raises(ApiError) as exc:
        jobs_service.transition_job(db, job, "paused")
    assert exc.value.code == "invalid_state"
    with pytest.raises(ApiError) as exc:
        jobs_service.transition_job(db, job, "succeeded")
    assert exc.value.code == "invalid_state"


def _drive_run(
    client: TestClient, engine: Engine, settings: Any,
    demo: dict[str, Any], row_names: list[str],
) -> dict[str, Any]:
    from app.worker.main import Worker
    from tests.support.fake_executor import FakeExecutor

    executor = FakeExecutor()
    worker = Worker(
        engine, settings, executors={eid: executor for eid in TEST_CATALOG}
    )
    res = client.post(
        f"{BASE}/enrichments/runs",
        json={
            "target": {
                "sheetId": demo["sheet_id"],
                "rowIds": [demo["rows"][n] for n in row_names],
            },
            "columns": [{"key": "news", "enrichmentId": "find_company_news"}],
        },
    )
    assert res.status_code == 202
    job_id = res.json()["jobId"]
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        worker.run_once()
        job = client.get(f"{BASE}/jobs/{job_id}").json()
        if job["status"] in ("succeeded", "failed", "cancelled"):
            return job
        time.sleep(0.01)
    raise AssertionError("job did not finish")


def test_mixed_succeeded_and_failed_items_end_succeeded(
    client: TestClient, demo: dict[str, Any], engine: Engine,
    settings: Any,
) -> None:
    job = _drive_run(
        client, engine, settings, demo, ["Acme", "Boom Corp"]
    )
    assert job["status"] == "succeeded"
    assert job["summary"] == {"succeeded": 1, "failed": 1, "noData": 0}


def test_all_failed_items_end_failed(
    client: TestClient, demo: dict[str, Any], engine: Engine,
    settings: Any,
) -> None:
    job = _drive_run(
        client, engine, settings, demo, ["Boom Corp"]
    )
    assert job["status"] == "failed"
