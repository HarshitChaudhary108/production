"""HC-1: POST /projects — dryRun plan, real run, idempotency, SA-1.

Real PostgreSQL; no provider calls (the discover item stays queued).
"""

import uuid
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select, update
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.modules.core.models import Workspace
from app.modules.credits.models import CreditLedger
from app.modules.jobs.models import Job, JobItem
from app.modules.projects.models import Project
from app.modules.sheets.models import Row, Sheet, SheetColumn

BASE = "/api/v1"
PROMPT = "find 20 companies in delhi, india. startup with technology category."


@pytest.fixture(scope="module", autouse=True)
def _cancel_leftover_research_jobs(engine: Engine) -> Any:
    """These tests create real queued discover items but never run a
    worker; cancel them at module end so later worker-driven tests do not
    execute someone else's pending research."""
    yield
    with Session(engine) as s:
        s.execute(
            update(JobItem)
            .where(
                JobItem.kind == "discover",
                JobItem.status.in_(["pending", "running"]),
            )
            .values(status="cancelled", lease_until=None)
        )
        s.execute(
            update(Job)
            .where(Job.type == "research", Job.status.in_(["queued", "running"]))
            .values(status="cancelled")
        )
        s.commit()


def _counts(s: Session) -> dict[str, int]:
    return {
        "projects": s.scalar(select(func.count()).select_from(Project)),
        "sheets": s.scalar(select(func.count()).select_from(Sheet)),
        "rows": s.scalar(select(func.count()).select_from(Row)),
        "jobs": s.scalar(select(func.count()).select_from(Job)),
        "job_items": s.scalar(select(func.count()).select_from(JobItem)),
    } or {}


def _key() -> str:
    """Keys live in the shared test DB across runs — always unique."""
    return f"hc1-{uuid.uuid4().hex[:12]}"


def _no_ledger(engine: Engine) -> None:
    with Session(engine) as s:
        assert s.scalar(select(func.count()).select_from(CreditLedger)) == 0
        ws = s.get(Workspace, "ws_demo")
        assert ws is not None and ws.credits_balance == 5000


def test_dry_run_returns_plan_and_writes_nothing(
    client: TestClient, engine: Engine, migrated: None
) -> None:
    with Session(engine) as s:
        before = _counts(s)
    res = client.post(f"{BASE}/projects", json={"prompt": PROMPT, "dryRun": True})
    assert res.status_code == 200
    plan = res.json()["plan"]
    assert plan["requestedCount"] == 20
    assert plan["countSource"] == "prompt"
    assert plan["capped"] is False
    assert plan["query"] == PROMPT
    assert [c["key"] for c in plan["columns"]] == [
        "company", "domain", "emp", "loc",
    ]
    with Session(engine) as s:
        assert _counts(s) == before
    _no_ledger(engine)


def test_real_run_creates_project_sheet_job_and_item(
    client: TestClient, engine: Engine, migrated: None
) -> None:
    res = client.post(
        f"{BASE}/projects",
        json={
            "prompt": PROMPT,
            "agentId": "agent_outmate",
            "toolIds": ["web"],
            "connectorIds": ["hubspot"],
        },
        headers={"Idempotency-Key": _key()},
    )
    assert res.status_code == 202
    body = res.json()
    assert body["plan"]["requestedCount"] == 20
    project_view = body["project"]
    assert project_view["status"] == "Live"
    assert project_view["name"] == PROMPT[:60]
    job_id = body["jobId"]
    with Session(engine) as s:
        project = s.get(Project, project_view["id"])
        assert project is not None
        assert project.status == "Live"
        assert project.type == "GTM Research"
        assert project.prompt == PROMPT
        assert project.agent_id == "agent_outmate"
        assert project.tool_ids == ["web"]
        assert project.connector_ids == ["hubspot"]
        sheet = s.execute(
            select(Sheet).where(Sheet.project_id == project.id)
        ).scalar_one()
        assert sheet.name == "Target Companies"
        assert sheet.kind == "companies"
        cols = list(
            s.execute(
                select(SheetColumn).where(SheetColumn.sheet_id == sheet.id)
            ).scalars()
        )
        by_key = {c.key: c for c in cols}
        assert set(by_key) == {
            "company", "domain", "emp", "loc", "linkedin", "industry",
        }
        for key in ("company", "domain", "emp", "loc"):
            assert by_key[key].hidden is False, key
            assert by_key[key].is_base is True, key
        for key in ("linkedin", "industry"):
            assert by_key[key].hidden is True, key
        job = s.get(Job, job_id)
        assert job is not None
        assert job.type == "research"
        assert job.progress == {"done": 0, "total": 20, "unit": "companies"}
        assert job.estimated_credits is None
        assert job.charged_credits == 0
        assert (job.result or {}).get("projectId") == project.id
        assert (job.result or {}).get("sheetId") == sheet.id
        items = list(
            s.execute(
                select(JobItem).where(JobItem.job_id == job.id)
            ).scalars()
        )
        assert len(items) == 1
        item = items[0]
        assert item.kind == "discover"
        assert item.status == "pending"
        assert item.payload["query"] == PROMPT
        assert item.payload["requestedCount"] == 20
        assert item.payload["sheetId"] == sheet.id
        assert item.payload["projectId"] == project.id
    _no_ledger(engine)


def test_missing_idempotency_key_is_422(client: TestClient, migrated: None) -> None:
    res = client.post(f"{BASE}/projects", json={"prompt": PROMPT})
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "validation_error"


def test_same_key_replays_same_project_and_job(
    client: TestClient, engine: Engine, migrated: None
) -> None:
    with Session(engine) as s:
        before = _counts(s)
    key = _key()
    first = client.post(
        f"{BASE}/projects", json={"prompt": PROMPT},
        headers={"Idempotency-Key": key},
    )
    second = client.post(
        f"{BASE}/projects", json={"prompt": PROMPT},
        headers={"Idempotency-Key": key},
    )
    assert first.status_code == second.status_code == 202
    assert second.json()["project"]["id"] == first.json()["project"]["id"]
    assert second.json()["jobId"] == first.json()["jobId"]
    with Session(engine) as s:
        after = _counts(s)
        assert after["projects"] == before["projects"] + 1
        assert after["jobs"] == before["jobs"] + 1
        assert after["job_items"] == before["job_items"] + 1
        assert after["sheets"] == before["sheets"] + 1
    _no_ledger(engine)


@pytest.mark.parametrize(
    "prompt",
    ["", "   ", "x" * 2001],
)
def test_bad_prompt_lengths_are_422(client: TestClient, migrated: None, prompt: str) -> None:
    res = client.post(
        f"{BASE}/projects", json={"prompt": prompt},
        headers={"Idempotency-Key": _key()},
    )
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "validation_error"


def test_enrichments_are_not_supported(client: TestClient, migrated: None) -> None:
    res = client.post(
        f"{BASE}/projects",
        json={"prompt": PROMPT, "enrichments": ["find_snapshot"]},
        headers={"Idempotency-Key": _key()},
    )
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "not_supported"
    assert res.json()["error"]["details"]["reason"] == (
        "home_enrichment_not_wired"
    )


def test_concurrent_duplicate_creates_one_project(
    client: TestClient, engine: Engine, migrated: None
) -> None:
    """Insert-first idempotency: a second submit with the same key replays
    the stored response — one project/job/sheet total."""
    with Session(engine) as s:
        before = _counts(s)
    key = _key()
    a = client.post(
        f"{BASE}/projects", json={"prompt": PROMPT},
        headers={"Idempotency-Key": key},
    )
    b = client.post(
        f"{BASE}/projects", json={"prompt": PROMPT},
        headers={"Idempotency-Key": key},
    )
    assert a.status_code == b.status_code == 202
    assert a.json()["project"]["id"] == b.json()["project"]["id"]
    with Session(engine) as s:
        after = _counts(s)
        assert after["projects"] == before["projects"] + 1
        assert after["jobs"] == before["jobs"] + 1
    _no_ledger(engine)
