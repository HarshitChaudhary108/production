"""P5: POST /enrichments/runs + GET /enrichments/runs/:runId on the real
route — validation matrix (pack order), cell eligibility, SA-2 estimates,
cell semantics, run view shape, idempotency, §8.8 job-level provider errors.

Real PostgreSQL; fake/scripted executors; no live provider calls.
"""

import time
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.modules.enrichment.executors.base import (
    ColumnConfig,
    ExecContext,
    ExecError,
    ExecResult,
    ProviderCallRecord,
    RowSnapshot,
    SourceRef,
)
from app.modules.jobs.models import Job
from app.modules.projects.models import Project
from app.modules.sheets import service as sheets_service
from app.modules.sheets.models import Cell
from tests.support.fake_executor import (
    FakeExecutor,
    seed_demo_companies,
)

BASE = "/api/v1"
TERMINAL = {"succeeded", "failed", "cancelled"}
ALLOWED_CELL_STATUSES = {
    "pending", "running", "succeeded", "no_data", "failed", "cancelled",
}
CELL_VIEW_FIELDS = {
    "rowId", "columnKey", "enrichmentId", "status", "value", "provenance",
    "source", "sources", "confidence", "confidenceLabel", "userEdited",
    "stale", "fetchedAt", "cost", "error",
}


@pytest.fixture(scope="module")
def demo(engine: Engine, migrated: None) -> dict[str, Any]:
    with Session(engine) as s:
        sheet, rows = seed_demo_companies(s)
        s.commit()
        return {"sheet_id": sheet.id, "rows": rows}


def _post(
    client: TestClient,
    demo: dict[str, Any],
    row_ids: list[str],
    columns: list[dict[str, Any]],
    **extra: Any,
) -> Any:
    return client.post(
        f"{BASE}/enrichments/runs",
        json={
            "target": {"sheetId": demo["sheet_id"], "rowIds": row_ids},
            "columns": columns,
            **extra,
        },
    )


class _AnyMap(dict):  # worker map that serves one executor for any id
    def __init__(self, executor: Any) -> None:
        super().__init__()
        self._executor = executor

    def get(self, key: str, default: Any = None) -> Any:
        return self._executor


def _drive_any(
    engine: Engine, settings: Any, client: TestClient, job_id: str,
    executor: Any,
) -> dict[str, Any]:
    """Inline worker loop until the job is terminal."""
    from app.worker.main import Worker

    worker = Worker(engine, settings, executors=_AnyMap(executor))
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        worker.run_once()
        job = client.get(f"{BASE}/jobs/{job_id}").json()
        if job["status"] in TERMINAL:
            return job
        time.sleep(0.01)
    raise AssertionError(f"job {job_id} not terminal")


def _run_with(
    client: TestClient, engine: Engine, settings: Any, demo: dict[str, Any],
    row_ids: list[str], columns: list[dict[str, Any]],
    executor: Any | None = None, **extra: Any,
) -> dict[str, Any]:
    res = _post(client, demo, row_ids, columns, **extra)
    assert res.status_code == 202, res.json()
    executor = executor or FakeExecutor()
    job = _drive_any(engine, settings, client, res.json()["jobId"], executor)
    return {"job": job, "runId": res.json()["runId"], "created": res.json()}


# ------------------------------------------------------------------ validation


def test_empty_row_ids_is_validation_error(
    client: TestClient, demo: dict[str, Any]
) -> None:
    res = _post(client, demo, [], [{"key": "v1", "enrichmentId": "find_funding"}])
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "validation_error"


def test_empty_columns_is_validation_error(
    client: TestClient, demo: dict[str, Any]
) -> None:
    res = _post(client, demo, [demo["rows"]["Acme"]], [])
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "validation_error"


def test_missing_sheet_is_404(client: TestClient, demo: dict[str, Any]) -> None:
    res = client.post(
        f"{BASE}/enrichments/runs",
        json={
            "target": {"sheetId": "sh_missing", "rowIds": [demo["rows"]["Acme"]]},
            "columns": [{"key": "v2", "enrichmentId": "find_funding"}],
        },
    )
    assert res.status_code == 404
    assert res.json()["error"]["code"] == "not_found"


def test_row_from_another_sheet_is_unknown_row_ids(
    client: TestClient, demo: dict[str, Any], engine: Engine, migrated: None
) -> None:
    with Session(engine) as s:
        other = sheets_service.create_sheet(
            s, key=f"other_{time.time_ns()}", name="Other", kind="companies"
        )
        sheets_service.add_base_rows(s, other.id, [{"name": "X", "domain": "x.io"}])
        other_row = s.execute(
            text("SELECT id FROM rows WHERE sheet_id = :sid"),
            {"sid": other.id},
        ).scalar_one()
        s.commit()
    res = _post(
        client, demo, [other_row],
        [{"key": "v3", "enrichmentId": "find_funding"}],
    )
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "unknown_row_ids"
    assert res.json()["error"]["details"]["unknown"] == [other_row]


def test_duplicate_column_key(
    client: TestClient, demo: dict[str, Any]
) -> None:
    res = _post(
        client, demo, [demo["rows"]["Acme"]],
        [
            {"key": "same_k", "enrichmentId": "find_funding"},
            {"key": "same_k", "enrichmentId": "find_revenue"},
        ],
    )
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "duplicate_column_key"


def test_unknown_enrichment(client: TestClient, demo: dict[str, Any]) -> None:
    res = _post(
        client, demo, [demo["rows"]["Acme"]],
        [{"key": "v4", "enrichmentId": "nope"}],
    )
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "unknown_enrichment"


def test_wrong_applies_to_is_validation_error(
    client: TestClient, engine: Engine, migrated: None
) -> None:
    """find_funding appliesTo companies -> a leaders sheet rejects it."""
    with Session(engine) as s:
        # A real project keeps this scratch sheet OUT of the global (NULL)
        # leaders pool that get_or_create_leaders_sheet owns — otherwise a
        # second global leaders sheet makes its scalar_one_or_none() fail.
        s.merge(
            Project(
                id="proj_applies_to_test", workspace_id="ws_demo",
                name="AppliesTo Test",
            )
        )
        leaders = sheets_service.create_sheet(
            s, key=f"leaders_{time.time_ns()}", name="Leaders",
            kind="leaders", project_id="proj_applies_to_test",
        )
        sheets_service.add_base_rows(s, leaders.id, [{"name": "Ada"}])
        leaders_id = leaders.id
        leader_row = s.execute(
            text("SELECT id FROM rows WHERE sheet_id = :sid"),
            {"sid": leaders_id},
        ).scalar_one()
        s.commit()
    res = client.post(
        f"{BASE}/enrichments/runs",
        json={
            "target": {"sheetId": leaders_id, "rowIds": [leader_row]},
            "columns": [{"key": "v5", "enrichmentId": "find_funding"}],
        },
    )
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "validation_error"


def test_over_run_max_rows_is_validation_error(
    client: TestClient, demo: dict[str, Any], settings: Any
) -> None:
    """Q4 answered: run_max_rows = 20. 21 ids -> 422 before row checks."""
    row_ids = [f"row_{i}" for i in range(settings.run_max_rows + 1)]
    res = _post(client, demo, row_ids, [{"key": "v6", "enrichmentId": "find_funding"}])
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "validation_error"


def test_plain_value_is_not_runnable(
    client: TestClient, demo: dict[str, Any]
) -> None:
    res = _post(
        client, demo, [demo["rows"]["Acme"]],
        [{"key": "v7", "enrichmentId": "plain_value"}],
    )
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "not_runnable"


def test_gated_off_enrichment_is_unknown(
    client: TestClient, demo: dict[str, Any]
) -> None:
    """gate_g2_linkedin defaults off -> find_linkedin_highlights is unknown."""
    res = _post(
        client, demo, [demo["rows"]["Acme"]],
        [{"key": "v8", "enrichmentId": "find_linkedin_highlights"}],
    )
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "unknown_enrichment"


def test_existing_key_with_different_enrichment_id(
    client: TestClient, demo: dict[str, Any], engine: Engine, migrated: None
) -> None:
    key = f"bound_{time.time_ns()}"
    with Session(engine) as s:
        sheets_service.add_column(
            s, demo["sheet_id"], label="Bound", type="badge",
            enrichment_id="find_funding", key=key,
        )
        s.commit()
    res = _post(
        client, demo, [demo["rows"]["Acme"]],
        [{"key": key, "enrichmentId": "find_revenue"}],
    )
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "validation_error"


def test_zero_eligible_cells_is_validation_error(
    client: TestClient, demo: dict[str, Any], engine: Engine,
    settings: Any, migrated: None,
) -> None:
    """D2: when every cell is ineligible -> 422 with skipped details."""
    key = f"elig0_{time.time_ns()}"
    with Session(engine) as s:
        col = sheets_service.add_column(
            s, demo["sheet_id"], label="Elig0", type="badge",
            enrichment_id="find_funding", key=key,
        )
        # a user-edited cell already blocks the only row in the request
        cell = Cell(row_id=demo["rows"]["Strata"], column_id=col.id,
                    status="succeeded", value="keep me", user_edited=True)
        s.add(cell)
        s.commit()
    res = _post(
        client, demo, [demo["rows"]["Strata"]],
        [{"key": key, "enrichmentId": "find_funding"}],
    )
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "validation_error"
    details = res.json()["error"]["details"]
    assert details["reason"] == "no_eligible_cells"
    assert details["skipped"]["userEdited"] == 1


# ------------------------------------------------------------------ eligibility


def test_user_edited_cell_is_skipped_and_unchanged(
    client: TestClient, demo: dict[str, Any], engine: Engine,
    settings: Any,
) -> None:
    key = f"elig1_{time.time_ns()}"
    col_spec = {"key": key, "enrichmentId": "find_funding"}
    with Session(engine) as s:
        col = sheets_service.add_column(
            s, demo["sheet_id"], label="Elig1", type="badge",
            enrichment_id="find_funding", key=key,
        )
        col_id = col.id
        acme_cell = Cell(
            row_id=demo["rows"]["Acme"], column_id=col_id,
            status="succeeded", value="user value", user_edited=True,
        )
        s.add(acme_cell)
        s.commit()
    # Acme is user-edited (skipped); RevenueFlow has no cell (eligible)
    res = _post(
        client, demo,
        [demo["rows"]["Acme"], demo["rows"]["RevenueFlow"]],
        [col_spec],
    )
    assert res.status_code == 202
    # SA-2: the estimate covers eligible cells only -> 1 cell x 3
    assert res.json()["estimatedCredits"] == 3
    job = _drive_any(engine, settings, client, res.json()["jobId"], FakeExecutor())
    assert job["status"] == "succeeded"
    assert job["chargedCredits"] == 3

    run = client.get(f"{BASE}/enrichments/runs/{res.json()['runId']}").json()
    assert [c["rowId"] for c in run["cells"]] == [demo["rows"]["RevenueFlow"]]
    with Session(engine) as s:
        acme = s.execute(
            select(Cell).where(
                Cell.row_id == demo["rows"]["Acme"], Cell.column_id == col_id
            )
        ).scalar_one()
        assert acme.value == "user value"
        assert acme.user_edited is True
        assert acme.status == "succeeded"


def test_overwrite_edited_reruns_the_cell(
    client: TestClient, demo: dict[str, Any], engine: Engine,
    settings: Any,
) -> None:
    key = f"elig2_{time.time_ns()}"
    with Session(engine) as s:
        col = sheets_service.add_column(
            s, demo["sheet_id"], label="Elig2", type="badge",
            enrichment_id="find_funding", key=key,
        )
        col_id = col.id
        s.add(
            Cell(row_id=demo["rows"]["Acme"], column_id=col_id,
                 status="succeeded", value="user value", user_edited=True)
        )
        s.commit()
    res = _post(
        client, demo, [demo["rows"]["Acme"]],
        [{"key": key, "enrichmentId": "find_funding"}],
        overwriteEdited=True,
    )
    assert res.status_code == 202
    job = _drive_any(engine, settings, client, res.json()["jobId"], FakeExecutor())
    assert job["status"] == "succeeded"
    with Session(engine) as s:
        acme = s.execute(
            select(Cell).where(
                Cell.row_id == demo["rows"]["Acme"], Cell.column_id == col_id
            )
        ).scalar_one()
        assert acme.value == "Series B — $28M led by Redpoint"
        assert acme.user_edited is False
        assert acme.cost == 3


def test_running_cell_is_skipped(
    client: TestClient, demo: dict[str, Any], engine: Engine,
    settings: Any,
) -> None:
    key = f"elig3_{time.time_ns()}"
    with Session(engine) as s:
        col = sheets_service.add_column(
            s, demo["sheet_id"], label="Elig3", type="badge",
            enrichment_id="find_funding", key=key,
        )
        col_id = col.id
        s.add(
            Cell(row_id=demo["rows"]["Acme"], column_id=col_id,
                 status="running")
        )
        s.commit()
    res = _post(
        client, demo,
        [demo["rows"]["Acme"], demo["rows"]["RevenueFlow"]],
        [{"key": key, "enrichmentId": "find_funding"}],
    )
    assert res.status_code == 202
    assert res.json()["estimatedCredits"] == 3  # only RevenueFlow eligible
    job = _drive_any(engine, settings, client, res.json()["jobId"], FakeExecutor())
    assert job["status"] == "succeeded"
    with Session(engine) as s:
        acme = s.execute(
            select(Cell).where(
                Cell.row_id == demo["rows"]["Acme"], Cell.column_id == col_id
            )
        ).scalar_one()
        assert acme.status == "running"  # untouched


# ------------------------------------------------------------------ estimates / semantics


def test_estimates_and_cell_semantics(
    client: TestClient, demo: dict[str, Any], engine: Engine,
    settings: Any,
) -> None:
    """estimatedCredits = sum of catalog costs over eligible cells; succeeded
    cells charge catalog cost with non-null provenance; no_data/failed cost 0;
    chargedCredits = sum of succeeded costs; credit_ledger stays empty."""
    key = f"sem_{time.time_ns()}"
    result = _run_with(
        client, engine, settings, demo,
        [demo["rows"]["Acme"], demo["rows"]["Strata"], demo["rows"]["Boom Corp"]],
        [{"key": key, "enrichmentId": "find_revenue"}],
    )
    job = result["job"]
    assert job["estimatedCredits"] == 6  # 3 cells x 2
    assert job["chargedCredits"] == 2   # only Acme succeeded
    assert job["summary"] == {"succeeded": 1, "failed": 1, "noData": 1}

    run = client.get(f"{BASE}/enrichments/runs/{result['runId']}").json()
    by_row = {c["rowId"]: c for c in run["cells"]}
    acme = by_row[demo["rows"]["Acme"]]
    assert acme["status"] == "succeeded"
    assert acme["cost"] == 2
    assert acme["provenance"] is not None
    strata = by_row[demo["rows"]["Strata"]]
    assert strata["status"] == "no_data"
    assert strata["cost"] == 0
    boom = by_row[demo["rows"]["Boom Corp"]]
    assert boom["status"] == "failed"
    assert boom["cost"] == 0
    for cell in run["cells"]:
        assert set(cell.keys()) == CELL_VIEW_FIELDS
        assert cell["status"] in ALLOWED_CELL_STATUSES

    with engine.connect() as conn:
        n = conn.execute(text("SELECT count(*) FROM credit_ledger")).scalar_one()
    assert n == 0


def test_verified_cell_has_at_least_one_source(
    client: TestClient, demo: dict[str, Any], engine: Engine,
    settings: Any,
) -> None:
    class VerifiedExecutor:
        provider = "fake"
        EXECUTOR_VERSION = "v1"

        def execute(
            self, row: RowSnapshot, column: ColumnConfig, ctx: ExecContext
        ) -> ExecResult:
            return ExecResult(
                status="succeeded",
                value="verified value",
                provenance="verified",
                confidence_label="high",
                sources=[SourceRef(url="https://acme.io/x", title="cited")],
                provider_calls=[
                    ProviderCallRecord(provider="fake", endpoint="t", ms=1)
                ],
            )

    result = _run_with(
        client, engine, settings, demo,
        [demo["rows"]["Acme"]],
        [{"key": f"ver_{time.time_ns()}", "enrichmentId": "find_funding"}],
        executor=VerifiedExecutor(),
    )
    run = client.get(f"{BASE}/enrichments/runs/{result['runId']}").json()
    cell = run["cells"][0]
    assert cell["provenance"] == "verified"
    assert len(cell["sources"]) >= 1
    assert cell["sources"][0]["url"] == "https://acme.io/x"


# ------------------------------------------------------------------ run view / idempotency


def test_unknown_run_is_404(client: TestClient) -> None:
    res = client.get(f"{BASE}/enrichments/runs/enr_missing")
    assert res.status_code == 404
    assert res.json()["error"]["code"] == "not_found"


def test_idempotent_replay_creates_no_new_job(
    client: TestClient, demo: dict[str, Any], engine: Engine,
    settings: Any,
) -> None:
    body = {
        "target": {"sheetId": demo["sheet_id"], "rowIds": [demo["rows"]["Acme"]]},
        "columns": [{"key": f"idem_{time.time_ns()}", "enrichmentId": "find_revenue"}],
    }
    headers = {"idempotency-key": f"idem-{time.time_ns()}"}
    with Session(engine) as s:
        jobs_before = s.execute(select(func.count()).select_from(Job)).scalar_one()
    r1 = client.post(f"{BASE}/enrichments/runs", json=body, headers=headers)
    r2 = client.post(f"{BASE}/enrichments/runs", json=body, headers=headers)
    assert r1.status_code == 202 and r2.status_code == 202
    assert r1.json() == r2.json()
    with Session(engine) as s:
        jobs_after = s.execute(select(func.count()).select_from(Job)).scalar_one()
    assert jobs_after == jobs_before + 1


# ------------------------------------------------------------------ §8.8 job-level provider errors


def test_provider_out_of_credits_fails_the_job(
    client: TestClient, demo: dict[str, Any], engine: Engine,
    settings: Any,
) -> None:
    """§8.8: provider_out_of_credits is job-level — the cell fails, remaining
    pending items cancel, the job settles failed with the provider error."""
    class OutOfCreditsExecutor:
        provider = "fake"
        EXECUTOR_VERSION = "v1"

        def execute(
            self, row: RowSnapshot, column: ColumnConfig, ctx: ExecContext
        ) -> ExecResult:
            return ExecResult(
                status="failed",
                error=ExecError(
                    code="provider_out_of_credits", message="Exa 402."
                ),
            )

    key = f"pooc_{time.time_ns()}"
    res = _post(
        client, demo,
        [demo["rows"]["Acme"], demo["rows"]["RevenueFlow"],
         demo["rows"]["Northwind Labs"]],
        [{"key": key, "enrichmentId": "find_funding"}],
    )
    assert res.status_code == 202
    job = _drive_any(engine, settings, client, res.json()["jobId"], OutOfCreditsExecutor())
    assert job["status"] == "failed"
    assert job["error"]["code"] == "provider_out_of_credits"
    run = client.get(f"{BASE}/enrichments/runs/{res.json()['runId']}").json()
    assert run["status"] == "failed"
    statuses = {c["status"] for c in run["cells"]}
    assert statuses <= {"failed", "cancelled"}
    assert "failed" in statuses
    assert all(c["cost"] == 0 for c in run["cells"])
