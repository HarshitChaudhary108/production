"""P4b MoltSets gate integration — real PostgreSQL, real route + worker,
fixture-backed MoltSets executor (no live provider calls).

Covers: G3 flag OFF hides both enrichments from the catalog and rejects
runs; G3 ON runs find_decision_makers end-to-end — cell written, Leaders
sheet lazily created with upserted rows (dedupe across reruns), claim-time
reservation finalized to actual usage; find_work_email on leader rows
routes by linkedinUrl and writes the provider email. Also: a 429-defers
item keeps attempts at 0 and returns to pending.
"""

import json
import time
from collections import deque
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.modules.enrichment.executors.base import ProviderCallRecord
from app.modules.enrichment.executors.find_decision_makers import (
    FindDecisionMakers,
)
from app.modules.enrichment.executors.find_work_email import FindWorkEmail
from app.modules.jobs import service as jobs_service
from app.modules.jobs.models import JobItem
from app.modules.providers import models as provider_models
from app.modules.providers.moltsets import models
from app.modules.sheets.models import Row, Sheet
from tests.support.fake_executor import seed_demo_companies

BASE = "/api/v1"
TERMINAL = {"succeeded", "failed", "cancelled"}
FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "moltsets"


def body(tool: str, case: str) -> dict[str, Any]:
    path = FIXTURES / tool / f"{case}.synthetic.json"
    return json.loads(path.read_text(encoding="utf-8"))["response"]


class FakeMoltSets:
    """Sync gateway: typed fixture responses + call capture. ``provider`` is
    "moltsets" so the Worker's real gate applies."""

    provider = "moltsets"

    def __init__(self, responses: dict[str, list[Any]]) -> None:
        self.responses = {k: deque(v) for k, v in responses.items()}
        self.calls: list[tuple[str, dict[str, Any]]] = []

    def search_people(self, record: Any = None, **kw: Any) -> Any:
        self.calls.append(("search_people", kw))
        if record:
            record(
                ProviderCallRecord(
                    provider="moltsets", endpoint="search_people",
                    status_code=200, request_id="fx", ms=1,
                    tokens=3, records_returned=3,
                )
            )
        return models.parse_people_response(self.responses["search_people"].popleft())

    def linkedin_to_business_email(
        self, linkedin_url: str, record: Any = None
    ) -> Any:
        self.calls.append(
            ("linkedin_to_business_email", {"linkedin_url": linkedin_url})
        )
        if record:
            record(
                ProviderCallRecord(
                    provider="moltsets",
                    endpoint="linkedin_to_business_email",
                    status_code=200, request_id="fx", ms=1,
                    tokens=1, records_returned=1,
                )
            )
        return models.parse_email_response(
            self.responses["linkedin_to_business_email"].popleft()
        )

    def search_business_email_by_name(self, record: Any = None, **kw: Any) -> Any:
        self.calls.append(("search_business_email_by_name", kw))
        if record:
            record(
                ProviderCallRecord(
                    provider="moltsets",
                    endpoint="search_business_email_by_name",
                    status_code=200, request_id="fx", ms=1,
                    tokens=1, records_returned=1,
                )
            )
        return models.parse_email_response(
            self.responses["search_business_email_by_name"].popleft()
        )


@pytest.fixture(scope="module")
def demo(engine: Engine, migrated: None) -> dict[str, Any]:
    with Session(engine) as s:
        sheet, rows = seed_demo_companies(s)
        s.commit()
        return {"sheet_id": sheet.id, "rows": rows}


def _catalog_ids(client: TestClient) -> set[str]:
    res = client.get(f"{BASE}/enrichments/catalog")
    assert res.status_code == 200
    return {i["id"] for i in res.json()["data"]}


def _post(
    client: TestClient,
    sheet_id: str,
    row_ids: list[str],
    columns: list[dict[str, Any]],
    **extra: Any,
) -> Any:
    return client.post(
        f"{BASE}/enrichments/runs",
        json={
            "target": {"sheetId": sheet_id, "rowIds": row_ids},
            "columns": columns,
            **extra,
        },
    )


def _drive(
    engine: Engine, settings: Any, client: TestClient, job_id: str,
    executors: dict[str, Any],
) -> dict[str, Any]:
    from app.worker.main import Worker

    worker = Worker(engine, settings, executors=executors)
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        worker.run_once()
        job = client.get(f"{BASE}/jobs/{job_id}").json()
        if job["status"] in TERMINAL:
            return job
        time.sleep(0.01)
    raise AssertionError(f"job {job_id} not terminal")


def _leaders_sheet(db: Session) -> Sheet | None:
    return db.execute(
        select(Sheet).where(Sheet.kind == "leaders")
    ).scalar_one_or_none()


def _leader_rows(db: Session, sheet_id: str) -> list[Row]:
    return list(
        db.execute(select(Row).where(Row.sheet_id == sheet_id)).scalars()
    )


# ----------------------------------------------------------------- G3 flag


def test_g3_off_hides_and_rejects(client: TestClient, demo: dict[str, Any]) -> None:
    ids = _catalog_ids(client)
    assert "find_decision_makers" not in ids
    assert "find_work_email" not in ids
    res = _post(
        client,
        demo["sheet_id"],
        [demo["rows"]["Acme"]],
        [{"enrichmentId": "find_decision_makers", "key": "decisionMakers"}],
    )
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "unknown_enrichment"


def test_g3_on_shows_both(client_g3: TestClient) -> None:
    ids = _catalog_ids(client_g3)
    assert "find_decision_makers" in ids
    assert "find_work_email" in ids


# --------------------------------------------------------- decision makers


def _people_executor() -> tuple[FindDecisionMakers, FakeMoltSets]:
    fake = FakeMoltSets({
        "search_people": [body("search_people", "example-com")],
    })
    return FindDecisionMakers(fake), fake


def test_decision_makers_run_leaders_and_reservation(
    client_g3: TestClient, engine: Engine, settings: Any, demo: dict[str, Any]
) -> None:
    executor, _fake = _people_executor()
    g3 = settings.model_copy(update={"gate_g3_moltsets": True})
    res = _post(
        client_g3,
        demo["sheet_id"],
        [demo["rows"]["Acme"]],
        [{"enrichmentId": "find_decision_makers", "key": "decisionMakers"}],
    )
    assert res.status_code == 202, res.json()
    job = _drive(
        engine, g3, client_g3, res.json()["jobId"],
        {"find_decision_makers": executor},
    )
    assert job["status"] == "succeeded"
    cells = client_g3.get(
        f"{BASE}/enrichments/runs/{res.json()['runId']}"
    ).json()["cells"]
    cell = next(c for c in cells if c["enrichmentId"] == "find_decision_makers")
    assert cell["status"] == "succeeded"
    assert cell["provenance"] == "provider_reported"
    assert cell["cost"] == 20
    assert isinstance(cell["value"], list) and len(cell["value"]) == 3
    assert cell["value"][0]["name"] == "Ada Lovelace"

    with Session(engine) as s:
        leaders = _leaders_sheet(s)
        assert leaders is not None
        rows = _leader_rows(s, leaders.id)
        acme_rows = [r for r in rows if r.company_row_id == demo["rows"]["Acme"]]
        assert len(acme_rows) == 3
        by_name = {r.data["name"]: r.data for r in acme_rows}
        assert by_name["Ada Lovelace"]["email"] == "ada.lovelace@example.com"
        assert by_name["Ada Lovelace"]["status"] == "Verified"
        assert by_name["Grace Hopper"]["email"] is None
        assert by_name["Ada Lovelace"]["linkedinUrl"].endswith(
            "ada-lovelace-example"
        )
        assert by_name["Ada Lovelace"]["companyDomain"] == "example.com"
        # reservation finalized: no open holds, actual usage persisted
        open_holds = s.execute(
            select(func.count())
            .select_from(provider_models.ProviderCall)
            .where(provider_models.ProviderCall.status_code.is_(None))
        ).scalar_one()
        assert open_holds == 0
        calls = list(
            s.execute(
                select(provider_models.ProviderCall).where(
                    provider_models.ProviderCall.provider == "moltsets",
                    provider_models.ProviderCall.job_id == res.json()["jobId"],
                )
            ).scalars()
        )
        assert len(calls) == 1
        assert calls[0].endpoint == "search_people"
        assert calls[0].records_returned == 3
        assert calls[0].tokens == 3

        # second identical run: leaders dedupe — still exactly 3 rows
        res2 = _post(
            client_g3,
            demo["sheet_id"],
            [demo["rows"]["Acme"]],
            [{"enrichmentId": "find_decision_makers", "key": "decisionMakers"}],
        )
        assert res2.status_code == 202
    executor2, _ = _people_executor()
    job2 = _drive(
        engine, g3, client_g3, res2.json()["jobId"],
        {"find_decision_makers": executor2},
    )
    assert job2["status"] == "succeeded"
    with Session(engine) as s:
        leaders = _leaders_sheet(s)
        rows = [
            r for r in _leader_rows(s, leaders.id)
            if r.company_row_id == demo["rows"]["Acme"]
        ]
        assert len(rows) == 3  # dedupe by linkedinUrl — no duplicates


# ------------------------------------------------------------- work email


def test_work_email_routes_and_writes(
    client_g3: TestClient, engine: Engine, settings: Any, demo: dict[str, Any]
) -> None:
    g3 = settings.model_copy(update={"gate_g3_moltsets": True})
    # first fill the Leaders sheet
    dm_executor, _ = _people_executor()
    res = _post(
        client_g3,
        demo["sheet_id"],
        [demo["rows"]["Acme"]],
        [{"enrichmentId": "find_decision_makers", "key": "decisionMakers"}],
    )
    assert res.status_code == 202
    _drive(engine, g3, client_g3, res.json()["jobId"], {"find_decision_makers": dm_executor})

    with Session(engine) as s:
        leaders = _leaders_sheet(s)
        assert leaders is not None
        leaders_id = leaders.id
        leader_ids = [r.id for r in _leader_rows(s, leaders_id)]

    fake = FakeMoltSets({
        "linkedin_to_business_email": [
            body("linkedin_to_business_email", "found")
        ] * len(leader_ids),
        "search_business_email_by_name": [
            body("search_business_email_by_name", "found")
        ] * len(leader_ids),
    })
    executor = FindWorkEmail(fake)
    res2 = _post(
        client_g3,
        leaders_id,
        leader_ids,
        [{"enrichmentId": "find_work_email", "key": "workEmail"}],
    )
    assert res2.status_code == 202, res2.json()
    job = _drive(
        engine, g3, client_g3, res2.json()["jobId"],
        {"find_work_email": executor},
    )
    assert job["status"] == "succeeded"
    cells = client_g3.get(
        f"{BASE}/enrichments/runs/{res2.json()['runId']}"
    ).json()["cells"]
    email_cells = [c for c in cells if c["enrichmentId"] == "find_work_email"]
    assert len(email_cells) == len(leader_ids)
    for c in email_cells:
        assert c["status"] == "succeeded"
        assert c["value"] == "ada.lovelace@example.com"
        assert c["provenance"] == "provider_reported"
        assert c["cost"] == 3
    # every leader had linkedinUrl -> only that tool was called
    assert all(t == "linkedin_to_business_email" for t, _ in fake.calls)


# --------------------------------------------------------------- defer path


def test_429_defer_no_attempt_consumed(
    client_g3: TestClient, engine: Engine, settings: Any, demo: dict[str, Any]
) -> None:
    """return_item_to_pending: running -> pending with available_at, cell
    back to pending, attempts NOT incremented (the provider never ran)."""
    g3 = settings.model_copy(update={"gate_g3_moltsets": True})
    executor, _ = _people_executor()
    res = _post(
        client_g3,
        demo["sheet_id"],
        [demo["rows"]["Acme"]],
        [{"enrichmentId": "find_decision_makers", "key": "decisionMakers"}],
    )
    assert res.status_code == 202
    with Session(engine) as s:
        item = s.execute(
            select(JobItem).where(JobItem.job_id == res.json()["jobId"])
        ).scalar_one()
        item.status = "running"  # simulate the claim having happened
        s.commit()
        item_id = item.id
        defer = datetime.now(UTC) + timedelta(seconds=0.2)
        assert jobs_service.return_item_to_pending(s, item_id, available_at=defer)
        s.commit()
    with Session(engine) as s:
        item = s.get(JobItem, item_id)
        assert item.status == "pending"
        assert item.attempts == 0
        assert item.available_at is not None
        assert item.available_at > datetime.now(UTC)
    time.sleep(0.25)  # let available_at elapse so the next tick reclaims it
    # job still completes once the item is reclaimed and run
    job = _drive(
        engine, g3, client_g3, res.json()["jobId"],
        {"find_decision_makers": executor},
    )
    assert job["status"] == "succeeded"
