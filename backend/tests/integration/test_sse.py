"""SSE (plan §8.2): progress snapshot first, seq-ordered replay with
``id: <seq>``, Last-Event-ID resume, terminal close, ``: ping`` heartbeat."""

import contextlib
import json
import time
from collections.abc import Iterator
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.config import Settings
from app.main import create_app
from app.modules.jobs import service as jobs_service
from app.modules.sheets import service as sheets_service
from tests.support.fake_executor import (
    TEST_CATALOG,
    FakeExecutor,
    WorkerHarness,
    seed_demo_companies,
)

BASE = "/api/v1"


@pytest.fixture(scope="module")
def demo(engine: Engine, migrated: None) -> dict[str, Any]:
    with Session(engine) as s:
        sheet, rows = seed_demo_companies(s)
        s.commit()
        return {"sheet_id": sheet.id, "rows": rows}


@contextlib.contextmanager
def _client(settings: Settings) -> Iterator[TestClient]:
    app = create_app(settings)
    with TestClient(app) as c:
        yield c


def _sse_events(resp: Any) -> Iterator[dict[str, Any]]:
    """Yield parsed SSE events lazily (works on open streams).

    Each event: {id: int|None, event: str, data: dict|None}.
    Comments (``: ping``) and the ``retry:`` directive surface as
    ``{"event": "comment"|"retry", ...}``.
    """
    cur: dict[str, Any] = {"id": None, "event": None, "data": []}
    for raw in resp.iter_lines():
        line = raw.rstrip("\r")
        if line == "":
            if cur["event"] is not None or cur["data"]:
                data = json.loads("".join(cur["data"])) if cur["data"] else None
                yield {"id": cur["id"], "event": cur["event"], "data": data}
            cur = {"id": None, "event": None, "data": []}
            continue
        if line.startswith(":"):
            yield {"id": None, "event": "comment", "data": line[1:].strip()}
            continue
        field, _, value = line.partition(":")
        value = value.lstrip(" ")
        if field == "id":
            cur["id"] = int(value)
        elif field == "event":
            cur["event"] = value
        elif field == "data":
            cur["data"].append(value)
        elif field == "retry":
            continue


def _finish_run(
    client: TestClient, engine: Engine, settings: Settings,
    demo: dict[str, Any], row_names: list[str], columns: list[dict[str, Any]],
    cell_ms: float = 0.0,
) -> dict[str, Any]:
    """POST a run, drive it with a worker thread, return the terminal job."""
    from app.worker.main import Worker

    executor = FakeExecutor(cell_ms=cell_ms)
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
            "columns": columns,
        },
    )
    assert res.status_code == 202
    job_id = res.json()["jobId"]
    with WorkerHarness(worker):
        deadline = time.monotonic() + 15
        while time.monotonic() < deadline:
            job = client.get(f"{BASE}/jobs/{job_id}").json()
            if job["status"] in ("succeeded", "failed", "cancelled"):
                return job
            time.sleep(0.02)
    raise AssertionError("job did not finish")


def test_terminal_job_sends_snapshot_then_replay_then_done(
    engine: Engine, migrated: None, settings: Settings, demo: dict[str, Any]
) -> None:
    with _client(settings) as client:
        job = _finish_run(
            client, engine, settings, demo, ["Acme", "RevenueFlow"],
            [{"key": "funding", "enrichmentId": "find_funding"}],
        )
        with client.stream("GET", f"{BASE}/jobs/{job['id']}/events") as resp:
            assert resp.status_code == 200
            assert resp.headers["content-type"].startswith("text/event-stream")
            events = list(_sse_events(resp))
        assert events[0]["event"] == "progress"  # snapshot first
        assert events[0]["id"] is None
        idd = [e for e in events if e["id"] is not None]
        seqs = [e["id"] for e in idd]
        assert seqs == list(range(1, max(seqs) + 1))  # seq order, no gaps
        assert events[-1]["event"] == "done"
        assert events[-1]["data"]["status"] == "succeeded"
        assert events[-1]["data"]["chargedCredits"] == 6


def test_reconnect_with_last_event_id_replays_exactly_seq_gt_k(
    engine: Engine, migrated: None, settings: Settings, demo: dict[str, Any]
) -> None:
    with _client(settings) as client:
        job = _finish_run(
            client, engine, settings, demo, ["Acme"],
            [{"key": "news", "enrichmentId": "find_company_news"}],
        )
        with client.stream("GET", f"{BASE}/jobs/{job['id']}/events") as resp:
            all_events = list(_sse_events(resp))
        max_seq = max(e["id"] for e in all_events if e["id"] is not None)
        k = max_seq - 2  # replay should skip everything <= k
        with client.stream(
            "GET",
            f"{BASE}/jobs/{job['id']}/events",
            headers={"Last-Event-ID": str(k)},
        ) as resp:
            events = list(_sse_events(resp))
        replayed = [e["id"] for e in events if e["id"] is not None]
        assert replayed == list(range(k + 1, max_seq + 1))

        # same via the query param form
        with client.stream(
            "GET", f"{BASE}/jobs/{job['id']}/events?lastEventId={k}"
        ) as resp:
            events = list(_sse_events(resp))
        replayed = [e["id"] for e in events if e["id"] is not None]
        assert replayed == list(range(k + 1, max_seq + 1))


def test_live_stream_delivers_events_then_done_and_closes(
    engine: Engine, migrated: None, settings: Settings, demo: dict[str, Any]
) -> None:
    from app.worker.main import Worker

    with _client(settings) as client:
        executor = FakeExecutor(cell_ms=50)
        worker = Worker(
            engine, settings, executors={eid: executor for eid in TEST_CATALOG}
        )
        res = client.post(
            f"{BASE}/enrichments/runs",
            json={
                "target": {
                    "sheetId": demo["sheet_id"],
                    "rowIds": [demo["rows"]["Acme"], demo["rows"]["Strata"]],
                },
                "columns": [{"key": "news", "enrichmentId": "find_company_news"}],
            },
        )
        job_id = res.json()["jobId"]
        with WorkerHarness(worker):
            with client.stream("GET", f"{BASE}/jobs/{job_id}/events") as resp:
                events = list(_sse_events(resp))
        assert events[0]["event"] == "progress"
        names = [e["event"] for e in events]
        assert "cell" in names and "progress" in names
        assert events[-1]["event"] == "done"
        assert events[-1]["data"]["status"] in ("succeeded", "failed")
        idd = [e["id"] for e in events if e["id"] is not None]
        assert idd == sorted(idd)


def test_heartbeat_ping_when_idle(
    engine: Engine, migrated: None, settings: Settings, demo: dict[str, Any]
) -> None:
    """A running job with no new events emits ``: ping`` every heartbeat."""
    fast = settings.model_copy(update={"sse_heartbeat_seconds": 0.05})
    with _client(fast) as client:
        with Session(engine) as s:
            columns = [
                sheets_service.add_column(
                    s, demo["sheet_id"], label=f"ping {time.time_ns()}",
                    type="badge", enrichment_id="find_funding",
                )
            ]
            row = sheets_service.get_row(s, demo["rows"]["Acme"])
            job = jobs_service.create_cell_job(
                s, workspace_id="ws_demo", job_type="enrichment", run_id=None,
                sheet_id=demo["sheet_id"], columns=columns, rows=[row],
                column_costs={columns[0].id: 3},
            )
            jobs_service.transition_job(s, job, "running")
            s.commit()
            job_id = job.id
        # no worker: nothing is emitted, so heartbeats arrive
        with client.stream("GET", f"{BASE}/jobs/{job_id}/events") as resp:
            events = []
            deadline = time.monotonic() + 3
            for e in _sse_events(resp):
                events.append(e)
                if any(x["event"] == "comment" and x["data"] == "ping" for x in events):
                    break
                if time.monotonic() > deadline:
                    break
        assert events[0]["event"] == "progress"
        assert any(e["event"] == "comment" and e["data"] == "ping" for e in events)


def test_events_404_for_unknown_job(client: TestClient) -> None:
    resp = client.get(f"{BASE}/jobs/job_missing/events")
    assert resp.status_code == 404
    assert resp.json()["error"]["code"] == "not_found"
