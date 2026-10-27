"""P5 / plan §8.6: the enrichment cache is OFF until a per-enrichment TTL is
configured. Key = (normalized_domain, enrichment_id, sha256(prompt+params),
executor_version). refresh:true bypasses reads; only succeeded results are
stored; a cached result carries zero provider spend but still charges the
catalog cost (SA-2).

Real PostgreSQL; FakeExecutor; no live provider calls.
"""

import time
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.modules.providers.models import ProviderCall
from tests.support.fake_executor import FakeExecutor, seed_demo_companies

BASE = "/api/v1"
TERMINAL = {"succeeded", "failed", "cancelled"}
FUNDING_TTL = {"find_funding": 3600}


@pytest.fixture(scope="module")
def demo(engine: Engine, migrated: None) -> dict[str, Any]:
    with Session(engine) as s:
        sheet, rows = seed_demo_companies(s)
        s.commit()
        return {"sheet_id": sheet.id, "rows": rows}


@pytest.fixture(autouse=True)
def _clear_cache(engine: Engine) -> None:
    """Cache rows persist across tests; each case starts empty."""
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE enrichment_cache"))


def _post(
    client: TestClient, demo: dict[str, Any], column: dict[str, Any],
    row: str = "Acme", **extra: Any,
) -> Any:
    res = client.post(
        f"{BASE}/enrichments/runs",
        json={
            "target": {
                "sheetId": demo["sheet_id"],
                "rowIds": [demo["rows"][row]],
            },
            "columns": [column],
            **extra,
        },
    )
    assert res.status_code == 202, res.json()
    return res


class _All(dict):
    """Executor map serving the same executor for any enrichmentId."""

    def __init__(self, executor: Any) -> None:
        super().__init__()
        self._e = executor

    def get(self, key: str, default: Any = None) -> Any:
        return self._e


def _drive_all(
    engine: Engine, settings: Any, client: TestClient, job_id: str,
    executor: FakeExecutor,
) -> dict[str, Any]:
    from app.worker.main import Worker

    worker = Worker(engine, settings, executors=_All(executor))
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        worker.run_once()
        job = client.get(f"{BASE}/jobs/{job_id}").json()
        if job["status"] in TERMINAL:
            return job
        time.sleep(0.01)
    raise AssertionError(f"job {job_id} not terminal")


def _calls(executor: FakeExecutor) -> int:
    return sum(executor.executions.values())


def test_ttl_unset_never_caches(
    client: TestClient, demo: dict[str, Any], engine: Engine, settings: Any
) -> None:
    """Default config (no TTLs): two identical runs invoke the executor
    twice — the cache does nothing."""
    executor = FakeExecutor()
    col = {"key": f"c0_{time.time_ns()}", "enrichmentId": "find_funding"}
    r1 = _post(client, demo, col)
    _drive_all(engine, settings, client, r1.json()["jobId"], executor)
    r2 = _post(
        client, demo,
        {"key": f"c0b_{time.time_ns()}", "enrichmentId": "find_funding"},
    )
    _drive_all(engine, settings, client, r2.json()["jobId"], executor)
    assert _calls(executor) == 2


def test_ttl_set_caches_the_second_run(
    client: TestClient, demo: dict[str, Any], engine: Engine, settings: Any
) -> None:
    """With a TTL: identical second run is a cache hit — executor called once,
    cell still gets the catalog cost, provider_calls records zero spend."""
    cached = settings.model_copy(update={"cache_ttl_seconds": dict(FUNDING_TTL)})
    executor = FakeExecutor()
    r1 = _post(client, demo, {"key": f"c1_{time.time_ns()}", "enrichmentId": "find_funding"})
    _drive_all(engine, cached, client, r1.json()["jobId"], executor)
    assert _calls(executor) == 1

    r2 = _post(client, demo, {"key": f"c2_{time.time_ns()}", "enrichmentId": "find_funding"})
    job2 = _drive_all(engine, cached, client, r2.json()["jobId"], executor)
    assert _calls(executor) == 1  # cache hit: executor never invoked again
    assert job2["chargedCredits"] == 3  # catalog cost still charged

    run2 = client.get(f"{BASE}/enrichments/runs/{r2.json()['runId']}").json()
    cell = run2["cells"][0]
    assert cell["status"] == "succeeded"
    assert cell["cost"] == 3
    assert cell["provenance"] == "provider_reported"
    assert len(cell["sources"]) >= 1

    # zero provider spend for the hit
    with Session(engine) as s:
        n = s.execute(
            select(func.count())
            .select_from(ProviderCall)
            .where(ProviderCall.job_id == job2["id"])
        ).scalar_one()
    assert n == 0


def test_refresh_true_bypasses_the_cache(
    client: TestClient, demo: dict[str, Any], engine: Engine, settings: Any
) -> None:
    cached = settings.model_copy(update={"cache_ttl_seconds": dict(FUNDING_TTL)})
    executor = FakeExecutor()
    r1 = _post(client, demo, {"key": f"c3_{time.time_ns()}", "enrichmentId": "find_funding"})
    _drive_all(engine, cached, client, r1.json()["jobId"], executor)
    r2 = _post(
        client, demo,
        {"key": f"c4_{time.time_ns()}", "enrichmentId": "find_funding"},
        refresh=True,
    )
    _drive_all(engine, cached, client, r2.json()["jobId"], executor)
    assert _calls(executor) == 2  # refresh bypassed the read


def test_different_prompt_misses_the_cache(
    client: TestClient, demo: dict[str, Any], engine: Engine, settings: Any
) -> None:
    cached = settings.model_copy(update={"cache_ttl_seconds": dict(FUNDING_TTL)})
    executor = FakeExecutor()
    r1 = _post(client, demo, {"key": f"c5_{time.time_ns()}", "enrichmentId": "find_funding"})
    _drive_all(engine, cached, client, r1.json()["jobId"], executor)
    r2 = _post(
        client, demo,
        {
            "key": f"c6_{time.time_ns()}",
            "enrichmentId": "find_funding",
            "prompt": "A different question entirely.",
        },
    )
    _drive_all(engine, cached, client, r2.json()["jobId"], executor)
    assert _calls(executor) == 2  # prompt_hash differs -> miss


def test_different_executor_version_misses_the_cache(
    client: TestClient, demo: dict[str, Any], engine: Engine, settings: Any
) -> None:
    cached = settings.model_copy(update={"cache_ttl_seconds": dict(FUNDING_TTL)})
    executor = FakeExecutor()
    r1 = _post(client, demo, {"key": f"c7_{time.time_ns()}", "enrichmentId": "find_funding"})
    _drive_all(engine, cached, client, r1.json()["jobId"], executor)

    executor.EXECUTOR_VERSION = "fake-2"  # instance attr wins over class attr
    r2 = _post(client, demo, {"key": f"c8_{time.time_ns()}", "enrichmentId": "find_funding"})
    _drive_all(engine, cached, client, r2.json()["jobId"], executor)
    assert _calls(executor) == 2  # executor_version differs -> miss
