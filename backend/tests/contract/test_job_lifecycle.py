"""Ported mock tests 2-7 (server/mock-api.test.mjs) with SA-5 rewrites.

P5: ``POST /enrichments/runs`` is now the REAL route (api/enrichments.py);
the ``client_g2`` fixture enables ``gate_g2_linkedin`` so test_b's
find_linkedin_highlights passes catalog validation.

SA-5 rewrites vs the mock assertions: credit balance checks become
chargedCredits/cell.cost checks; mock "failed" outcomes for Brightpath and
Strata become ``no_data`` (A4); ``source`` is the provider name ("fake"), not
the mock's catalog badge (C3); job summary gains ``noData`` (additive).
"""

import time
from collections.abc import Iterator
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.modules.jobs.models import Job
from tests.support.fake_executor import (
    TEST_CATALOG,
    FakeExecutor,
    WorkerHarness,
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


@pytest.fixture
def worker(engine: Engine, settings: Any) -> Iterator[Any]:
    """Factory: start a Worker thread (fake executor for all TEST_CATALOG ids)."""
    from app.worker.main import Worker

    harnesses: list[WorkerHarness] = []

    def start(cell_ms: float = 0.0) -> WorkerHarness:
        executor = FakeExecutor(cell_ms=cell_ms)
        worker = Worker(
            engine, settings, executors={eid: executor for eid in TEST_CATALOG}
        )
        harness = WorkerHarness(worker)
        harness.__enter__()
        harnesses.append(harness)
        return harness

    yield start
    for h in harnesses:
        h.__exit__(None, None, None)


def post_run(
    client: TestClient,
    row_ids: list[str],
    columns: list[dict[str, Any]],
    sheet_id: str,
    headers: dict[str, str] | None = None,
) -> Any:
    return client.post(
        f"{BASE}/enrichments/runs",
        json={"target": {"sheetId": sheet_id, "rowIds": row_ids}, "columns": columns},
        headers=headers or {},
    )


def wait_for_job(
    client: TestClient, job_id: str, done: Any = None, timeout_s: float = 15.0
) -> dict[str, Any]:
    """Poll GET /jobs/:id until ``done(body)`` (default: terminal status)."""
    deadline = time.monotonic() + timeout_s
    while time.monotonic() < deadline:
        res = client.get(f"{BASE}/jobs/{job_id}")
        assert res.status_code == 200
        body = res.json()
        if (done or (lambda j: j["status"] in TERMINAL))(body):
            return body
        time.sleep(0.02)
    raise AssertionError(f"job {job_id} did not reach the expected state")


def wait_for_cells(
    client: TestClient, run_id: str, timeout_s: float = 15.0
) -> list[dict[str, Any]]:
    """Poll GET /enrichments/runs/:id until every cell is terminal."""
    deadline = time.monotonic() + timeout_s
    while time.monotonic() < deadline:
        res = client.get(f"{BASE}/enrichments/runs/{run_id}")
        assert res.status_code == 200
        cells = res.json()["cells"]
        if cells and all(c["status"] in TERMINAL | {"no_data"} for c in cells):
            return cells
        time.sleep(0.02)
    raise AssertionError(f"run {run_id} cells did not finish")


def test_a_run_enriches_rows_and_reports_charged_credits(
    client_g2: TestClient, demo: dict[str, Any], worker: Any
) -> None:
    worker(cell_ms=0)
    res = post_run(
        client_g2,
        [demo["rows"]["Acme"], demo["rows"]["RevenueFlow"]],
        [{"key": "funding", "enrichmentId": "find_funding"}],
        demo["sheet_id"],
    )
    assert res.status_code == 202
    created = res.json()
    assert created["estimatedCredits"] == 6
    assert created["status"] == "queued"

    job = wait_for_job(client_g2, created["jobId"])
    assert job["status"] == "succeeded"
    assert job["progress"] == {"done": 2, "total": 2, "unit": "cells"}
    assert job["chargedCredits"] == 6
    assert job["estimatedCredits"] == 6
    assert job["summary"] == {"succeeded": 2, "failed": 0, "noData": 0}

    run = client_g2.get(
        f"{BASE}/enrichments/runs/{created['runId']}"
    ).json()
    assert run["status"] == "succeeded"
    assert run["chargedCredits"] == 6
    acme = next(c for c in run["cells"] if c["rowId"] == demo["rows"]["Acme"])
    assert acme["status"] == "succeeded"
    assert acme["value"] == "Series B — $28M led by Redpoint"
    assert acme["cost"] == 3
    assert acme["source"] == "fake"


def test_b_partial_no_result_does_not_fail_the_job(
    client_g2: TestClient, demo: dict[str, Any], worker: Any
) -> None:
    worker(cell_ms=0)
    res = post_run(
        client_g2,
        [demo["rows"]["Acme"], demo["rows"]["Brightpath"]],
        [{"key": "highlights", "enrichmentId": "find_linkedin_highlights"}],
        demo["sheet_id"],
    )
    assert res.status_code == 202
    job = wait_for_job(client_g2, res.json()["jobId"])
    assert job["status"] == "succeeded"
    assert job["summary"] == {"succeeded": 1, "failed": 0, "noData": 1}
    assert job["chargedCredits"] == 4

    run = client_g2.get(
        f"{BASE}/enrichments/runs/{res.json()['runId']}"
    ).json()
    brightpath = next(
        c for c in run["cells"] if c["rowId"] == demo["rows"]["Brightpath"]
    )
    assert brightpath["status"] == "no_data"
    assert brightpath["cost"] == 0
    assert brightpath["value"] is None


def test_c_all_failed_run_ends_failed(
    client_g2: TestClient, demo: dict[str, Any], worker: Any
) -> None:
    worker(cell_ms=0)
    res = post_run(
        client_g2,
        [demo["rows"]["Boom Corp"]],
        [{"key": "funding", "enrichmentId": "find_funding"}],
        demo["sheet_id"],
    )
    assert res.status_code == 202
    job = wait_for_job(client_g2, res.json()["jobId"])
    assert job["status"] == "failed"
    assert job["chargedCredits"] == 0
    assert job["summary"] == {"succeeded": 0, "failed": 1, "noData": 0}


def test_d_cancel_charges_completed_work_only(
    client_g2: TestClient, demo: dict[str, Any], worker: Any
) -> None:
    worker(cell_ms=150)
    res = post_run(
        client_g2,
        [
            demo["rows"]["Acme"],
            demo["rows"]["RevenueFlow"],
            demo["rows"]["Northwind Labs"],
            demo["rows"]["Brightpath"],
        ],
        [
            {"key": "funding", "enrichmentId": "find_funding"},
            {"key": "revenue", "enrichmentId": "find_revenue"},
        ],
        demo["sheet_id"],
    )
    created = res.json()
    assert created["estimatedCredits"] == 20

    wait_for_job(
        client_g2,
        created["jobId"],
        done=lambda j: j["progress"]["done"] >= 1,
    )
    cancelled = client_g2.post(
        f"{BASE}/jobs/{created['jobId']}/cancel"
    )
    assert cancelled.status_code == 200
    body = cancelled.json()
    assert body["status"] == "cancelled"
    assert 0 < body["chargedCredits"] < 20

    cells = wait_for_cells(client_g2, created["runId"])
    for cell in cells:
        if cell["status"] == "cancelled":
            assert cell["cost"] == 0
        elif cell["status"] == "succeeded":
            assert cell["cost"] == TEST_CATALOG[cell["enrichmentId"]]["cost"]
        else:
            raise AssertionError(f"unexpected cell status {cell['status']}")


def test_e_idempotency_key_returns_the_same_run(
    client_g2: TestClient,
    demo: dict[str, Any],
    worker: Any,
    engine: Engine,
) -> None:
    worker(cell_ms=0)
    first = post_run(
        client_g2,
        [demo["rows"]["Acme"]],
        [{"key": "news", "enrichmentId": "find_company_news"}],
        demo["sheet_id"],
        headers={"idempotency-key": "demo-key-1"},
    )
    second = post_run(
        client_g2,
        [demo["rows"]["Acme"]],
        [{"key": "news", "enrichmentId": "find_company_news"}],
        demo["sheet_id"],
        headers={"idempotency-key": "demo-key-1"},
    )
    assert first.status_code == 202
    assert second.status_code == first.status_code
    assert second.json() == first.json()

    with Session(engine) as s:
        count = s.execute(
            select(func.count())
            .select_from(Job)
            .where(Job.parent_ref["runId"].astext == first.json()["runId"])
        ).scalar_one()
    assert count == 1

    wait_for_job(client_g2, first.json()["jobId"])


def test_f_validation_errors_keep_the_error_envelope(
    client_g2: TestClient, demo: dict[str, Any]
) -> None:
    empty = post_run(
        client_g2, [], [], demo["sheet_id"]
    )
    assert empty.status_code == 422
    assert empty.json()["error"]["code"] == "validation_error"

    unknown = post_run(
        client_g2,
        ["row_does_not_exist"],
        [{"key": "x", "enrichmentId": "find_funding"}],
        demo["sheet_id"],
    )
    assert unknown.status_code == 422
    assert unknown.json()["error"]["code"] == "unknown_row_ids"
    assert unknown.json()["error"]["details"]["unknown"] == ["row_does_not_exist"]

    bad_enrichment = post_run(
        client_g2,
        [demo["rows"]["Acme"]],
        [{"key": "x", "enrichmentId": "nope"}],
        demo["sheet_id"],
    )
    assert bad_enrichment.status_code == 422
    assert bad_enrichment.json()["error"]["code"] == "unknown_enrichment"

    dup = post_run(
        client_g2,
        [demo["rows"]["Acme"]],
        [
            {"key": "same", "enrichmentId": "find_funding"},
            {"key": "same", "enrichmentId": "find_revenue"},
        ],
        demo["sheet_id"],
    )
    assert dup.status_code == 422
    assert dup.json()["error"]["code"] == "duplicate_column_key"


def test_h4_secret_never_appears_in_logs_bodies_or_provider_calls(
    engine: Engine, migrated: None, settings: Any, caplog: Any
) -> None:
    """H4: with EXA_API_KEY set in env, its value must not leak anywhere."""
    import logging

    from sqlalchemy import select as sa_select

    from app.config import Settings
    from app.main import create_app
    from app.modules.providers.models import ProviderCall

    settings_dict = settings.model_dump()
    sentinel = "EXA-SECRET-SENTINEL-9f2b"
    settings_dict["exa_api_key"] = sentinel
    test_settings = Settings.model_construct(**settings_dict)

    app = create_app(test_settings)
    with caplog.at_level(logging.DEBUG):
        with Session(engine) as s:
            sheet, rows = seed_demo_companies(s)
            s.commit()
            sheet_id = sheet.id
            row_ids = [rows["Acme"], rows["Boom Corp"]]
        with TestClient(app) as client:
            executor = FakeExecutor()
            from app.worker.main import Worker

            worker = Worker(
                engine, test_settings, {eid: executor for eid in TEST_CATALOG}
            )
            with WorkerHarness(worker):
                res = client.post(
                    f"{BASE}/enrichments/runs",
                    json={
                        "target": {"sheetId": sheet_id, "rowIds": row_ids},
                        "columns": [{"key": "news", "enrichmentId": "find_company_news"}],
                    },
                )
                assert res.status_code == 202
                job = wait_for_job(client, res.json()["jobId"])
                # Acme succeeded + Boom Corp failed -> job succeeded
                assert job["status"] == "succeeded"
                err = client.get(f"{BASE}/jobs/job_missing").json()
                assert err["error"]["code"] == "not_found"
        assert sentinel not in caplog.text
        assert sentinel not in str(err)
        with Session(engine) as s:
            calls = s.execute(sa_select(ProviderCall)).scalars().all()
        blob = " ".join(
            f"{c.provider} {c.endpoint} {c.request_id} {c.status_code}" for c in calls
        )
        assert sentinel not in blob
