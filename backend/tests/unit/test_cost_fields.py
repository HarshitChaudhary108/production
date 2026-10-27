"""SA-2 cost semantics: cell.cost, charged_credits, and the no-ledger proof."""

import time
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.modules.core.models import Workspace
from tests.support.fake_executor import TEST_CATALOG, seed_demo_companies

BASE = "/api/v1"
TERMINAL = {"succeeded", "failed", "cancelled"}


@pytest.fixture(scope="module")
def demo(engine: Engine, migrated: None) -> dict[str, Any]:
    with Session(engine) as s:
        sheet, rows = seed_demo_companies(s)
        s.commit()
        return {"sheet_id": sheet.id, "rows": rows}


def _wait_terminal(client: TestClient, job_id: str, timeout_s: float = 15.0) -> dict:
    deadline = time.monotonic() + timeout_s
    while time.monotonic() < deadline:
        job = client.get(f"{BASE}/jobs/{job_id}").json()
        if job["status"] in TERMINAL:
            return job
        time.sleep(0.02)
    raise AssertionError(f"job {job_id} not terminal")


def _run(
    client: TestClient,
    engine: Engine,
    settings: Any,
    demo: dict[str, Any],
    row_ids: list[str],
    columns: list[dict[str, Any]],
) -> dict[str, Any]:
    """Create a run and drive it synchronously with an inline worker."""
    from app.worker.main import Worker
    from tests.support.fake_executor import FakeExecutor

    executor = FakeExecutor()
    worker = Worker(
        engine, settings, executors={eid: executor for eid in TEST_CATALOG}
    )
    res = client.post(
        f"{BASE}/enrichments/runs",
        json={
            "target": {"sheetId": demo["sheet_id"], "rowIds": row_ids},
            "columns": columns,
        },
    )
    assert res.status_code == 202
    job_id = res.json()["jobId"]
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        worker.run_once()
        job = client.get(f"{BASE}/jobs/{job_id}").json()
        if job["status"] in TERMINAL:
            return {"job": job, "run_id": res.json()["runId"], "executor": executor}
        time.sleep(0.01)
    raise AssertionError("run did not finish")


def test_cell_cost_by_status(
    client_g2: TestClient, demo: dict[str, Any], engine: Engine,
    settings: Any,
) -> None:
    # Acme succeeds (4), Brightpath -> no_data (0), Boom Corp -> failed (0)
    result = _run(
        client_g2, engine, settings, demo,
        [demo["rows"]["Acme"], demo["rows"]["Brightpath"], demo["rows"]["Boom Corp"]],
        [{"key": "highlights", "enrichmentId": "find_linkedin_highlights"}],
    )
    run = client_g2.get(
        f"{BASE}/enrichments/runs/{result['run_id']}"
    ).json()
    by_row = {c["rowId"]: c for c in run["cells"]}
    assert by_row[demo["rows"]["Acme"]]["cost"] == 4
    assert by_row[demo["rows"]["Brightpath"]]["status"] == "no_data"
    assert by_row[demo["rows"]["Brightpath"]]["cost"] == 0
    assert by_row[demo["rows"]["Boom Corp"]]["status"] == "failed"
    assert by_row[demo["rows"]["Boom Corp"]]["cost"] == 0


def test_cancelled_cells_have_cost_zero(
    client_g2: TestClient, demo: dict[str, Any]
) -> None:
    res = client_g2.post(
        f"{BASE}/enrichments/runs",
        json={
            "target": {
                "sheetId": demo["sheet_id"],
                "rowIds": [demo["rows"]["Acme"], demo["rows"]["Strata"]],
            },
            "columns": [{"key": "funding", "enrichmentId": "find_funding"}],
        },
    )
    assert res.status_code == 202
    job_id = res.json()["jobId"]
    cancelled = client_g2.post(f"{BASE}/jobs/{job_id}/cancel")
    assert cancelled.status_code == 200
    run = client_g2.get(
        f"{BASE}/enrichments/runs/{res.json()['runId']}"
    ).json()
    assert {c["status"] for c in run["cells"]} == {"cancelled"}
    assert all(c["cost"] == 0 for c in run["cells"])
    assert cancelled.json()["chargedCredits"] == 0


def test_charged_credits_is_sum_of_succeeded_cell_costs(
    client_g2: TestClient, demo: dict[str, Any], engine: Engine,
    settings: Any,
) -> None:
    result = _run(
        client_g2, engine, settings, demo,
        [demo["rows"]["Acme"], demo["rows"]["RevenueFlow"]],
        [{"key": "funding", "enrichmentId": "find_funding"},
         {"key": "revenue", "enrichmentId": "find_revenue"}],
    )
    job = result["job"]
    assert job["estimatedCredits"] == 2 * (3 + 2)
    assert job["chargedCredits"] == 10  # 2 succeeded x (3+2)
    assert job["estimatedCredits"] == 10  # unchanged after settle


def test_credit_ledger_has_zero_rows_after_a_full_run(
    client_g2: TestClient, demo: dict[str, Any], engine: Engine,
    settings: Any,
) -> None:
    _run(
        client_g2, engine, settings, demo,
        [demo["rows"]["Acme"]],
        [{"key": "funding", "enrichmentId": "find_funding"}],
    )
    with engine.connect() as conn:
        count = conn.execute(text("SELECT count(*) FROM credit_ledger")).scalar_one()
    assert count == 0


def test_workspace_credits_balance_unchanged_after_run(
    client_g2: TestClient, demo: dict[str, Any], engine: Engine,
    settings: Any,
) -> None:
    with Session(engine) as s:
        before = s.execute(
            select(Workspace.credits_balance).where(Workspace.id == "ws_demo")
        ).scalar_one()
    _run(
        client_g2, engine, settings, demo,
        [demo["rows"]["Acme"], demo["rows"]["Strata"]],
        [{"key": "revenue", "enrichmentId": "find_revenue"}],
    )
    with Session(engine) as s:
        after = s.execute(
            select(Workspace.credits_balance).where(Workspace.id == "ws_demo")
        ).scalar_one()
    assert after == before == 5000
