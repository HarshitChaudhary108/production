"""HC-1: research discover executor — Exa request shape, row mapping,
dedupe, provenance, provider failures, SSE. httpx.MockTransport, no network."""

import json
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
from app.modules.enrichment.executors.common import SyncExaClient
from app.modules.jobs.models import Job, JobItem
from app.modules.projects.models import Project
from app.modules.providers.exa.client import ExaClient
from app.modules.sheets.models import Cell, CellSource, Row, Sheet, SheetColumn
from tests.support.fake_executor import WorkerHarness

BASE = "/api/v1"
PROMPT = "find 20 companies in delhi, india. startup with technology category."
DEPRECATED_FIELDS = {
    "livecrawl", "subpages", "includeText", "excludeText",
    "context", "startCrawlDate", "endCrawlDate",
}
TERMINAL = {"succeeded", "failed", "cancelled"}


@pytest.fixture(autouse=True)
def _no_stale_discover_items(engine: Engine, migrated: None) -> Any:
    """Sibling tests leave queued discover items behind; cancel them so the
    worker only ever claims the item this test created (exact request
    counts stay assertable)."""
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
    yield


class Queue:
    """MockTransport handler replaying queued responses; a drained queue
    answers an empty result page (stale items from sibling tests may also
    be claimed by the worker — the extra calls must not explode)."""

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


def _results(
    n: int,
    *,
    dupes: dict[int, int] | None = None,
    no_host: tuple[int, ...] = (),
    no_entity: tuple[int, ...] = (),
) -> list[dict[str, Any]]:
    """``dupes``: result index -> earlier index whose domain it repeats."""
    dupes = dupes or {}
    out: list[dict[str, Any]] = []
    for i in range(n):
        domain = f"co{dupes.get(i, i)}.example.com"
        url = "" if i in no_host else f"https://{domain}/about"
        result: dict[str, Any] = {"title": f"Company {i}", "url": url}
        if i not in no_entity:
            result["entities"] = [
                _entity(f"Company {i}", 10 * (i + 1), "Delhi", "India")
            ]
        out.append(result)
    return out


def _ok_body(n: int, **kw: Any) -> dict[str, Any]:
    return {
        "requestId": "req-hc1",
        "results": _results(n, **kw),
        "costDollars": {"total": 0.01},
    }


def _post(
    client: TestClient, key: str, prompt: str = PROMPT
) -> dict[str, Any]:
    # Keys live in the shared test DB — a static key would replay the
    # previous run's stored response instead of creating a fresh job.
    res = client.post(
        f"{BASE}/projects",
        json={"prompt": prompt},
        headers={"Idempotency-Key": f"{key}-{uuid.uuid4().hex[:10]}"},
    )
    assert res.status_code == 202
    return res.json()


def _drive(
    client: TestClient,
    engine: Engine,
    settings: Settings,
    handler: Any,
    timeout_s: float = 15.0,
) -> dict[str, Any]:
    """Run a worker against the queued discover item; return the terminal job."""
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


def _sheet_and_rows(engine: Engine, project_id: str) -> tuple[Sheet, list[Row]]:
    with Session(engine) as s:
        sheet = s.execute(
            select(Sheet).where(Sheet.project_id == project_id)
        ).scalar_one()
        rows = list(
            s.execute(
                select(Row).where(Row.sheet_id == sheet.id)
            ).scalars()
        )
        for r in rows:  # detach data dicts
            r.data = dict(r.data)
        return sheet, rows


def _company_cells(engine: Engine, sheet_id: str) -> list[Cell]:
    with Session(engine) as s:
        col = s.execute(
            select(SheetColumn).where(
                SheetColumn.sheet_id == sheet_id, SheetColumn.key == "company"
            )
        ).scalar_one()
        return list(
            s.execute(
                select(Cell).where(Cell.column_id == col.id)
            ).scalars()
        )


def _cell_sources(engine: Engine, row_id: str, column_id: str) -> list[CellSource]:
    with Session(engine) as s:
        return list(
            s.execute(
                select(CellSource).where(
                    CellSource.row_id == row_id,
                    CellSource.column_id == column_id,
                )
            ).scalars()
        )


def _sse(client: TestClient, job_id: str) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    cur: dict[str, Any] = {"event": None, "data": []}
    with client.stream("GET", f"{BASE}/jobs/{job_id}/events") as resp:
        for raw in resp.iter_lines():
            line = raw.rstrip("\r")
            if line == "":
                if cur["event"]:
                    events.append(
                        {
                            "event": cur["event"],
                            "data": json.loads("".join(cur["data"]))
                            if cur["data"]
                            else None,
                        }
                    )
                cur = {"event": None, "data": []}
                continue
            if line.startswith(":"):
                continue
            field, _, value = line.partition(":")
            value = value.lstrip(" ")
            if field == "event":
                cur["event"] = value
            elif field == "data":
                cur["data"].append(value)
    return events


def test_exa_request_body_and_17_inserted_rows(
    client: TestClient, engine: Engine, settings: Settings, migrated: None
) -> None:
    created = _post(client, "hc1-disc-1")
    handler = Queue(
        httpx.Response(
            200,
            json=_ok_body(20, dupes={17: 0, 18: 1}, no_host=(19,), no_entity=(16,)),
        )
    )
    job = _drive(client, engine, settings, handler)
    # --- the request the provider saw (HC-D3: exact count, clean body) ---
    assert len(handler.requests) == 1
    body = json.loads(handler.requests[0].content)
    assert body["query"] == PROMPT
    assert body["category"] == "company"
    assert body["type"] == "auto"
    assert body["numResults"] == 20
    assert body["contents"] == {"highlights": True}
    assert not (set(body) & DEPRECATED_FIELDS)
    # --- job settled ---
    assert job["status"] == "succeeded"
    assert job["type"] == "research"
    assert job["progress"] == {"done": 17, "total": 17, "unit": "companies"}
    assert job["summary"] == {
        "requested": 20,
        "returnedByProvider": 20,
        "companies": 17,
        "duplicatesRemoved": 2,
        "skippedNoHost": 1,
        "capped": False,
    }
    # --- sheet rows ---
    sheet, rows = _sheet_and_rows(engine, created["project"]["id"])
    assert len(rows) == 17
    domains = {r.normalized_domain for r in rows}
    assert "co17.example.com" not in domains  # first of the dupes kept…
    # rows hold the mapped values
    sample = next(r for r in rows if r.data["domain"] == "co0.example.com")
    assert sample.data["company"] == "Company 0"
    assert sample.data["emp"] == 10
    assert sample.data["loc"] == "Delhi, India"
    assert sample.data["linkedin"] == ""
    assert sample.data["industry"] == ""
    # every row has provenance/source + a source URL on the company column
    cells = _company_cells(engine, sheet.id)
    assert len(cells) == 17
    for cell in cells:
        assert cell.status == "succeeded"
        assert cell.provenance == "provider_reported"
        assert cell.source == "exa"
        assert cell.cost == 0
        sources = _cell_sources(engine, cell.row_id, cell.column_id)
        assert len(sources) == 1
        assert sources[0].url.startswith("https://")
    # project went Complete
    with Session(engine) as s:
        project = s.get(Project, created["project"]["id"])
        assert project is not None
        assert project.status == "Complete"
        assert project.last_run_at is not None
        item = s.execute(
            select(JobItem).where(JobItem.job_id == job["id"])
        ).scalar_one()
        assert item.status == "done"
        assert item.result["status"] == "succeeded"


def test_done_event_summary_matches_db_counts(
    client: TestClient, engine: Engine, settings: Settings, migrated: None
) -> None:
    _post(client, "hc1-disc-2")
    job = _drive(
        client, engine, settings,
        Queue(
            httpx.Response(
                200, json=_ok_body(20, dupes={17: 0, 18: 1}, no_host=(19,))
            )
        ),
    )
    events = _sse(client, job["id"])
    kinds = [e["event"] for e in events]
    assert kinds[0] == "progress"  # snapshot
    assert "step" in kinds
    assert kinds[-1] == "done"
    done = events[-1]["data"]
    assert done["status"] == "succeeded"
    assert done["summary"]["companies"] == 17
    with Session(engine) as s:
        sheet_id = (s.get(Job, job["id"]).result or {})["sheetId"]
        db_rows = s.scalar(
            select(func.count()).select_from(Row).where(
                Row.sheet_id == sheet_id
            )
        )
    assert done["summary"]["companies"] == db_rows == 17


def test_defensive_slice_caps_rows_at_requested(
    client: TestClient, engine: Engine, settings: Settings, migrated: None
) -> None:
    created = _post(client, "hc1-disc-3")  # asks for 20
    job = _drive(
        client, engine, settings,
        Queue(httpx.Response(200, json=_ok_body(25))),
    )
    assert job["summary"]["companies"] == 20
    assert job["summary"]["returnedByProvider"] == 25
    _, rows = _sheet_and_rows(engine, created["project"]["id"])
    assert len(rows) == 20


@pytest.mark.parametrize("n", [1, 7, 21, 33])
def test_inserted_never_exceeds_requested(
    client: TestClient, engine: Engine, settings: Settings, migrated: None,
    n: int,
) -> None:
    created = _post(client, f"hc1-prop-{n}")
    job = _drive(
        client, engine, settings,
        Queue(httpx.Response(200, json=_ok_body(n))),
    )
    expected = min(n, 20)
    assert job["summary"]["companies"] == expected
    _, rows = _sheet_and_rows(engine, created["project"]["id"])
    assert len(rows) == expected <= 20


def test_zero_usable_results_is_no_data_but_job_succeeds(
    client: TestClient, engine: Engine, settings: Settings, migrated: None
) -> None:
    created = _post(client, "hc1-disc-zero")
    job = _drive(
        client, engine, settings,
        Queue(httpx.Response(200, json=_ok_body(5, no_host=(0, 1, 2, 3, 4)))),
    )
    assert job["status"] == "succeeded"  # P2 no-data finalize rule
    assert job["summary"]["companies"] == 0
    assert job["summary"]["skippedNoHost"] == 5
    with Session(engine) as s:
        item = s.execute(
            select(JobItem).where(JobItem.job_id == job["id"])
        ).scalar_one()
        assert item.result["status"] == "no_data"
        project = s.get(Project, created["project"]["id"])
        assert project is not None and project.status == "Complete"


@pytest.mark.parametrize(
    ("status", "attempts", "code"),
    [
        (402, 1, "provider_out_of_credits"),
        (401, 1, "provider_auth"),
        (503, 3, "provider_unavailable"),
    ],
)
def test_provider_failures_fail_job_and_draft_project(
    client: TestClient,
    engine: Engine,
    settings: Settings,
    migrated: None,
    status: int,
    attempts: int,
    code: str,
) -> None:
    created = _post(client, f"hc1-fail-{status}")
    handler = Queue(*[httpx.Response(status)] * attempts)
    job = _drive(client, engine, settings, handler)
    assert job["status"] == "failed"
    assert (job["error"] or {})["code"] == code
    with Session(engine) as s:
        project = s.get(Project, created["project"]["id"])
        assert project is not None and project.status == "Draft"  # HC-D4
        sheet = s.execute(
            select(Sheet).where(Sheet.project_id == project.id)
        ).scalar_one()
        assert s.scalar(
            select(func.count()).select_from(Row).where(
                Row.sheet_id == sheet.id
            )
        ) == 0  # no partial rows on provider failure
