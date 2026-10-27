"""HC-3: end-to-end count proof — the number the card shows before the
run (plan.requestedCount) equals what the run requests, and the number
shown after the run (done.summary.companies) equals the rows persisted
in the project's sheet. Fixture-backed Exa, real PostgreSQL."""

import time
import uuid
from typing import Any

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select, update
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.config import Settings
from app.modules.core.models import Workspace
from app.modules.credits.models import CreditLedger
from app.modules.enrichment.executors.common import SyncExaClient
from app.modules.jobs.models import Job, JobItem
from app.modules.projects.models import Project
from app.modules.providers.exa.client import ExaClient
from app.modules.sheets.models import Row, Sheet
from tests.support.fake_executor import WorkerHarness

BASE = "/api/v1"
SCREENSHOT = "find 20 companies in delhi, india. startup with technology category."
TERMINAL = {"succeeded", "failed", "cancelled"}

# Every prompt in the HC-1 parser table (test_research_parser.py).
PARSER_PROMPTS = [
    SCREENSHOT,
    "Find 30 B2B SaaS companies in India",
    "find 20 tech companies in Pune",
    "find 15 b2b saas fintech startups",
    "Find 1,200 startups",
    "companies with 100-250 employees in Delhi",
    "companies with 100 to 250 employees",
    "find 50 employee companies",
    "find twenty companies",
    "find some companies",
]


@pytest.fixture(autouse=True)
def _no_stale_discover_items(engine: Engine, migrated: None) -> Any:
    """Shared-DB hygiene: cancel queued discover items from sibling tests
    before each test, and this file's own items afterwards, so only the
    item under test is ever claimed by a worker."""
    _cancel_research(engine)
    yield
    _cancel_research(engine)


def _cancel_research(engine: Engine) -> None:
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


def _key() -> str:
    return f"hc3-{uuid.uuid4().hex[:12]}"


class Queue:
    """MockTransport handler replaying queued responses."""

    def __init__(self, *steps: Any) -> None:
        self.steps = list(steps)
        self.requests: list[httpx.Request] = []

    def __call__(self, request: httpx.Request) -> httpx.Response:
        self.requests.append(request)
        if not self.steps:
            return httpx.Response(200, json={"requestId": "x", "results": []})
        return self.steps.pop(0)


def _client(handler: Any) -> SyncExaClient:
    async def _sleep(_: float) -> None:
        return None

    return SyncExaClient(
        ExaClient(
            "EXA-KEY-SENTINEL-4d9f2b",
            transport=httpx.MockTransport(handler),
            sleep=_sleep,
        )
    )


def _entity(name: str, total: int, city: str, country: str) -> dict[str, Any]:
    return {
        "type": "company",
        "name": name,
        "workforce": {"total": total},
        "headquarters": {"city": city, "country": country},
    }


def _ok_body(n: int, *, dupes: dict[int, int] | None = None) -> dict[str, Any]:
    dupes = dupes or {}
    results = []
    for i in range(n):
        domain = f"co{dupes.get(i, i)}.example.com"
        results.append(
            {
                "title": f"Company {i}",
                "url": f"https://{domain}/about",
                "entities": [_entity(f"Company {i}", 50, "Delhi", "India")],
            }
        )
    return {
        "requestId": "req-hc3",
        "results": results,
        "costDollars": {"total": 0.01},
    }


def _drive(
    client: TestClient,
    engine: Engine,
    settings: Settings,
    handler: Any,
    timeout_s: float = 15.0,
) -> dict[str, Any]:
    from app.worker.main import Worker

    worker = Worker(
        engine, settings, executors={}, research_client=_client(handler)
    )
    job_id = _last_job_id(engine)
    with WorkerHarness(worker):
        deadline = time.monotonic() + timeout_s
        while time.monotonic() < deadline:
            job = client.get(f"{BASE}/jobs/{job_id}").json()
            if job["status"] in TERMINAL:
                return job
            time.sleep(0.02)
    raise AssertionError("research job did not finish")


def _last_job_id(engine: Engine) -> str:
    with Session(engine) as s:
        return s.execute(
            select(Job.id).order_by(Job.created_at.desc()).limit(1)
        ).scalar_one()


def _sheet_rows(engine: Engine, project_id: str) -> int:
    with Session(engine) as s:
        sheet = s.execute(
            select(Sheet).where(Sheet.project_id == project_id)
        ).scalar_one()
        return s.scalar(
            select(func.count()).select_from(Row).where(Row.sheet_id == sheet.id)
        ) or 0


def _no_ledger(engine: Engine) -> None:
    with Session(engine) as s:
        assert s.scalar(select(func.count()).select_from(CreditLedger)) == 0
        ws = s.get(Workspace, "ws_demo")
        assert ws is not None and ws.credits_balance == 5000


def _counts(s: Session) -> dict[str, int]:
    return {
        "projects": s.scalar(select(func.count()).select_from(Project)) or 0,
        "sheets": s.scalar(select(func.count()).select_from(Sheet)) or 0,
        "jobs": s.scalar(select(func.count()).select_from(Job)) or 0,
    }


def test_screenshot_prompt_shown_equals_requested_and_db(
    client: TestClient, engine: Engine, settings: Settings, migrated: None
) -> None:
    # 1. dry run — what the card would show before anything runs
    res = client.post(f"{BASE}/projects", json={"prompt": SCREENSHOT, "dryRun": True})
    assert res.status_code == 200
    plan = res.json()["plan"]
    assert plan["requestedCount"] == 20
    assert plan["countSource"] == "prompt"

    with Session(engine) as s:
        before = _counts(s)

    # 2. real run, same prompt
    res = client.post(
        f"{BASE}/projects",
        json={"prompt": SCREENSHOT},
        headers={"Idempotency-Key": _key()},
    )
    assert res.status_code == 202
    body = res.json()
    assert body["plan"]["requestedCount"] == 20  # shown before run

    # 3. worker executes against a clean 20-result fixture
    job = _drive(client, engine, settings, Queue(httpx.Response(200, json=_ok_body(20))))
    assert job["status"] == "succeeded"

    # 4. the number the card shows after the run == DB row count
    summary = job["summary"]
    assert summary["requested"] == 20
    db_rows = _sheet_rows(engine, body["project"]["id"])
    assert summary["companies"] == db_rows == 20
    assert summary["companies"] <= plan["requestedCount"]

    # 5. exactly one of each was created by the real run
    with Session(engine) as s:
        after = _counts(s)
    assert after["projects"] == before["projects"] + 1
    assert after["sheets"] == before["sheets"] + 1
    assert after["jobs"] == before["jobs"] + 1

    _no_ledger(engine)


def test_partial_result_shown_equals_db_rows(
    client: TestClient, engine: Engine, settings: Settings, migrated: None
) -> None:
    """Deduped/skipped results: the card shows 17 — which must equal the
    persisted rows, not the requested 20."""
    res = client.post(
        f"{BASE}/projects",
        json={"prompt": SCREENSHOT},
        headers={"Idempotency-Key": _key()},
    )
    assert res.status_code == 202
    project_id = res.json()["project"]["id"]
    job = _drive(
        client,
        engine,
        settings,
        Queue(httpx.Response(200, json=_ok_body(20, dupes={17: 0, 18: 1}))),
    )
    assert job["status"] == "succeeded"
    assert job["summary"]["requested"] == 20
    db_rows = _sheet_rows(engine, project_id)
    assert job["summary"]["companies"] == db_rows == 18
    assert job["summary"]["duplicatesRemoved"] == 2
    _no_ledger(engine)


@pytest.mark.parametrize(
    ("prompt", "fixture_n"),
    [
        ("Find 30 B2B SaaS companies in India", 30),
        ("Find 1,200 startups", 20),  # capped at 100; provider returns 20
        ("find twenty companies", 25),  # no number found -> default 25
    ],
)
def test_fixture_run_counts_for_report(
    client: TestClient,
    engine: Engine,
    settings: Settings,
    migrated: None,
    prompt: str,
    fixture_n: int,
) -> None:
    """Full loop per prompt; prints REPORT JSON consumed by the phase
    report table (prompt | requested | preview | db rows | done)."""
    import json as _json

    dry = client.post(f"{BASE}/projects", json={"prompt": prompt, "dryRun": True})
    assert dry.status_code == 200
    plan = dry.json()["plan"]

    res = client.post(
        f"{BASE}/projects",
        json={"prompt": prompt},
        headers={"Idempotency-Key": _key()},
    )
    assert res.status_code == 202
    assert res.json()["plan"]["requestedCount"] == plan["requestedCount"]
    project_id = res.json()["project"]["id"]

    job = _drive(
        client,
        engine,
        settings,
        Queue(httpx.Response(200, json=_ok_body(fixture_n))),
    )
    assert job["status"] == "succeeded"
    db_rows = _sheet_rows(engine, project_id)
    assert job["summary"]["companies"] == db_rows
    assert job["summary"]["companies"] <= plan["requestedCount"]
    print(
        "\nREPORT "
        + _json.dumps(
            {
                "prompt": prompt,
                "requested": plan["requestedCount"],
                "plan": plan,
                "summary": job["summary"],
                "dbRows": db_rows,
            }
        )
    )
    _no_ledger(engine)


@pytest.mark.parametrize("prompt", PARSER_PROMPTS)
def test_dry_run_plan_equals_real_run_plan(
    client: TestClient, engine: Engine, migrated: None, prompt: str
) -> None:
    """Parity: the plan the card previewed is the plan the run executes
    with — no drift between dry-run and real-run parsing."""
    dry = client.post(f"{BASE}/projects", json={"prompt": prompt, "dryRun": True})
    assert dry.status_code == 200
    real = client.post(
        f"{BASE}/projects",
        json={"prompt": prompt},
        headers={"Idempotency-Key": _key()},
    )
    assert real.status_code == 202
    for field in ("requestedCount", "countSource", "requestedRaw", "capped", "query"):
        assert real.json()["plan"][field] == dry.json()["plan"][field], (
            f"{field} drifted for prompt {prompt!r}"
        )
    _no_ledger(engine)
