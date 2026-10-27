"""P5 / plan §8.7: successful find_company_news and find_funding step-2 emit
one signal row per draft into the lazily-created Signals sheet (kind
"signals"), linked to the company row. N4 answer (human): the sheet's base
columns are the contract Signal fields — companyName, type, detail, source,
detectedAt, confidence, freshness, relevance.

D4 dedupe: (company_row_id, type, source, detail) — a rerun inserts nothing.

Real PostgreSQL; FakeExecutor emits deterministic drafts; no live calls.
"""

import time
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.modules.sheets import service as sheets_service
from app.modules.sheets.models import Row, Sheet
from tests.support.fake_executor import FakeExecutor, seed_demo_companies

BASE = "/api/v1"
TERMINAL = {"succeeded", "failed", "cancelled"}
N4_BASE_COLUMN_KEYS = {
    "companyName", "type", "detail", "source", "detectedAt",
    "confidence", "freshness", "relevance",
}


@pytest.fixture(scope="module")
def demo(engine: Engine, migrated: None) -> dict[str, Any]:
    with Session(engine) as s:
        sheet, rows = seed_demo_companies(s)
        s.commit()
        return {"sheet_id": sheet.id, "rows": rows}


class _All(dict):
    def __init__(self, executor: Any) -> None:
        super().__init__()
        self._e = executor

    def get(self, key: str, default: Any = None) -> Any:
        return self._e


def _run(
    client: TestClient, demo: dict[str, Any], engine: Engine, settings: Any,
    row: str, enrichment_id: str,
) -> dict[str, Any]:
    res = client.post(
        f"{BASE}/enrichments/runs",
        json={
            "target": {
                "sheetId": demo["sheet_id"],
                "rowIds": [demo["rows"][row]],
            },
            "columns": [
                {"key": f"sig_{time.time_ns()}", "enrichmentId": enrichment_id}
            ],
        },
    )
    assert res.status_code == 202, res.json()
    from app.worker.main import Worker

    executor = FakeExecutor()
    worker = Worker(engine, settings, executors=_All(executor))
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        worker.run_once()
        job = client.get(f"{BASE}/jobs/{res.json()['jobId']}").json()
        if job["status"] in TERMINAL:
            return job
        time.sleep(0.01)
    raise AssertionError("job not terminal")


def _signals_sheet(s: Session) -> Sheet | None:
    return s.execute(
        select(Sheet).where(Sheet.kind == "signals")
    ).scalar_one_or_none()


def _signal_rows(
    s: Session, sheet_id: str, company_row_id: str, type: str | None = None
) -> list[Row]:
    q = select(Row).where(
        Row.sheet_id == sheet_id, Row.company_row_id == company_row_id
    )
    rows = list(s.execute(q).scalars())
    if type is not None:
        rows = [r for r in rows if r.data.get("type") == type]
    return rows


def test_news_success_creates_one_linked_signal_row(
    client: TestClient, demo: dict[str, Any], engine: Engine, settings: Any
) -> None:
    acme = demo["rows"]["Acme"]
    job = _run(client, demo, engine, settings, "Acme", "find_company_news")
    assert job["status"] == "succeeded"

    with Session(engine) as s:
        sheet = _signals_sheet(s)
        assert sheet is not None, "signals sheet must be created lazily"
        cols = sheets_service.list_columns(s, sheet.id)
        assert {c.key for c in cols} == N4_BASE_COLUMN_KEYS  # N4 answer
        assert all(c.is_base for c in cols)

        rows = _signal_rows(s, sheet.id, acme, type="News")
        assert len(rows) == 1
        data = rows[0].data
        assert data["companyName"] == "Acme"
        assert data["type"] == "News"
        assert data["detail"] == "Acme announced a new GTM initiative this week"
        assert data["source"] == "acme.io"  # host of the cited URL
        assert data["detectedAt"] == "2026-10-20"  # publishedDate
        assert data["confidence"] == "high"  # confidenceLabel
        assert data["freshness"] is None  # A5: no scorer exists yet
        assert data["relevance"] is None


def test_news_no_data_creates_no_signal(
    client: TestClient, demo: dict[str, Any], engine: Engine, settings: Any
) -> None:
    strata = demo["rows"]["Strata"]
    job = _run(client, demo, engine, settings, "Strata", "find_company_news")
    # a no_data-only cell leaves the job succeeded (additive noData, A4)
    assert job["status"] == "succeeded"
    assert job["summary"] == {"succeeded": 0, "failed": 0, "noData": 1}
    with Session(engine) as s:
        sheet = _signals_sheet(s)
        if sheet is None:
            return  # nothing was ever derived — acceptable
        rows = _signal_rows(s, sheet.id, strata)
        assert rows == []


def test_funding_success_creates_funding_signal(
    client: TestClient, demo: dict[str, Any], engine: Engine, settings: Any
) -> None:
    nw = demo["rows"]["Northwind Labs"]
    job = _run(client, demo, engine, settings, "Northwind Labs", "find_funding")
    assert job["status"] == "succeeded"
    with Session(engine) as s:
        sheet = _signals_sheet(s)
        assert sheet is not None
        rows = _signal_rows(s, sheet.id, nw, type="Funding")
        assert len(rows) == 1
        assert rows[0].data["source"] == "northwind.dev"


def test_rerun_dedupes_signal_rows(
    client: TestClient, demo: dict[str, Any], engine: Engine, settings: Any
) -> None:
    acme = demo["rows"]["Acme"]
    _run(client, demo, engine, settings, "Acme", "find_company_news")
    _run(client, demo, engine, settings, "Acme", "find_company_news")
    with Session(engine) as s:
        sheet = _signals_sheet(s)
        assert sheet is not None
        rows = _signal_rows(s, sheet.id, acme, type="News")
        assert len(rows) == 1  # D4: identical draft dedupes
