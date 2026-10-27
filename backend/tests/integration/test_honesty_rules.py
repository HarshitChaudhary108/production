"""V1 honesty rules — one full end-to-end scenario on real PostgreSQL with
fixture-backed executors for BOTH providers (no live provider calls).

Flow: seed rows via sheets.service -> POST /enrichments/runs (five Exa
enrichments, then find_decision_makers, then find_work_email on the
upserted Leaders rows) -> GET /enrichments/runs/:runId -> SSE stream for
every job. Then each invariant from the V1 honesty list is checked across
API bodies, OpenAPI, DB rows, and SSE frames:

- the literal "Guessed" never appears anywhere;
- provenance "verified" implies >= 1 cell_sources row;
- every non-empty enrichment cell has a provenance and a source; every
  empty result is no_data (value null, cost 0);
- no email-shaped value exists unless it came from a provider fixture;
- catalog sources are only exa / moltsets / user; excluded ids absent;
- SA-1/SA-2: credit_ledger stays empty, credits_balance unchanged,
  chargedCredits == sum of succeeded cell costs, each succeeded cell cost
  == its catalog cost, estimatedCredits >= chargedCredits;
- H4/H5: sentinel provider keys never leak into logs, bodies, SSE frames
  or DB columns; every response carries X-Request-Id.
"""

import json
import logging
import re
import time
from collections import deque
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr
from sqlalchemy import func, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.main import create_app
from app.modules.core.models import Workspace
from app.modules.credits.models import CreditLedger
from app.modules.enrichment.executors.base import ProviderCallRecord
from app.modules.enrichment.executors.find_company_news import FindCompanyNews
from app.modules.enrichment.executors.find_decision_makers import (
    FindDecisionMakers,
)
from app.modules.enrichment.executors.find_gtm_strategy import FindGtmStrategy
from app.modules.enrichment.executors.find_pricing import FindPricing
from app.modules.enrichment.executors.find_revenue import FindRevenue
from app.modules.enrichment.executors.find_snapshot import FindSnapshot
from app.modules.enrichment.executors.find_work_email import FindWorkEmail
from app.modules.jobs.models import Job
from app.modules.providers.exa.models import ExaResponse
from app.modules.providers.models import ProviderCall
from app.modules.providers.moltsets import models as molt_models
from app.modules.sheets.models import Cell, CellSource, Row, Sheet
from app.worker.main import Worker
from tests.support.fake_executor import seed_demo_companies
from tests.unit.test_sheets_boundary import (
    test_sheets_models_import_boundary as _boundary_scan,
)

BASE = "/api/v1"
TERMINAL = {"succeeded", "failed", "cancelled"}
FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")

SENTINEL_EXA = "exa-SECRET-SENTINEL-v1-a1b2"
SENTINEL_MOLTSETS = "ms_SECRET-SENTINEL-v1-c3d4"
ALLOWED_SOURCES = {"exa", "moltsets", "user"}
ALLOWED_PROVENANCE = {
    "provider_reported", "verified", "ai_inferred", "user_edited",
}
EXCLUDED_IDS = {"website_intent", "add_to_hubspot"}

EXA_COLUMNS = [
    {"key": "snapshot", "enrichmentId": "find_snapshot"},
    {"key": "pricing", "enrichmentId": "find_pricing"},
    {"key": "gtm", "enrichmentId": "find_gtm_strategy"},
    {"key": "news", "enrichmentId": "find_company_news"},
    {"key": "revenue", "enrichmentId": "find_revenue"},
]
MOLTSETS_FIXTURES = [
    ("search_people", "example-com"),
    ("linkedin_to_business_email", "found"),
    ("search_business_email_by_name", "found"),
]


def _exa_body(enrichment_id: str, case: str) -> dict[str, Any]:
    path = FIXTURES / "exa" / enrichment_id / f"{case}.synthetic.json"
    return json.loads(path.read_text(encoding="utf-8"))


def _molt_body(tool: str, case: str) -> dict[str, Any]:
    path = FIXTURES / "moltsets" / tool / f"{case}.synthetic.json"
    return json.loads(path.read_text(encoding="utf-8"))["response"]


class _FakeExa:
    """Sync gateway matching the executor's client interface (fixtures)."""

    def __init__(self, responses: list[dict[str, Any]]) -> None:
        self.responses = deque(responses)
        self.calls: list[dict[str, Any]] = []

    def search(self, req: dict[str, Any], record: Any = None) -> ExaResponse:
        self.calls.append(req)
        if record is not None:
            record(
                ProviderCallRecord(
                    provider="exa", endpoint="/search", status_code=200,
                    request_id="fx", cost_dollars=0.005, ms=1,
                )
            )
        return ExaResponse.model_validate(self.responses.popleft())

    def contents(self, req: dict[str, Any], record: Any = None) -> ExaResponse:
        raise AssertionError("unexpected contents call")


class _FakeMoltSets:
    """Fixture-backed MoltSets gateway; ``provider`` makes the real
    Worker-side Fair Use gate engage."""

    provider = "moltsets"

    def __init__(self, responses: dict[str, list[Any]]) -> None:
        self.responses = {k: deque(v) for k, v in responses.items()}

    def _record(self, record: Any, endpoint: str) -> None:
        if record is not None:
            record(
                ProviderCallRecord(
                    provider="moltsets", endpoint=endpoint, status_code=200,
                    request_id="fx", ms=1, tokens=1, records_returned=1,
                )
            )

    def search_people(self, record: Any = None, **kw: Any) -> Any:
        self._record(record, "search_people")
        return molt_models.parse_people_response(
            self.responses["search_people"].popleft()
        )

    def linkedin_to_business_email(
        self, linkedin_url: str, record: Any = None
    ) -> Any:
        self._record(record, "linkedin_to_business_email")
        return molt_models.parse_email_response(
            self.responses["linkedin_to_business_email"].popleft()
        )

    def search_business_email_by_name(self, record: Any = None, **kw: Any) -> Any:
        self._record(record, "search_business_email_by_name")
        return molt_models.parse_email_response(
            self.responses["search_business_email_by_name"].popleft()
        )


def _executors() -> dict[str, Any]:
    """Real executor classes over fixture-backed fake provider clients."""
    moltsets = _FakeMoltSets({
        "search_people": [_molt_body("search_people", "example-com")],
        "linkedin_to_business_email": [
            _molt_body("linkedin_to_business_email", "found")
        ] * 3,
        "search_business_email_by_name": [
            _molt_body("search_business_email_by_name", "found")
        ] * 3,
    })
    return {
        "find_snapshot": FindSnapshot(
            _FakeExa([_exa_body("find_snapshot", "full")])
        ),
        "find_pricing": FindPricing(
            _FakeExa([_exa_body("find_pricing", "has-pricing")])
        ),
        "find_gtm_strategy": FindGtmStrategy(
            _FakeExa([_exa_body("find_gtm_strategy", "has-text")])
        ),
        "find_company_news": FindCompanyNews(
            _FakeExa([_exa_body("find_company_news", "mention")])
        ),
        "find_revenue": FindRevenue(
            _FakeExa([_exa_body("find_revenue", "null-revenue")])
        ),
        "find_decision_makers": FindDecisionMakers(moltsets),
        "find_work_email": FindWorkEmail(moltsets),
    }


def _post_run(
    client: TestClient, sheet_id: str, row_ids: list[str],
    columns: list[dict[str, Any]],
) -> Any:
    res = client.post(
        f"{BASE}/enrichments/runs",
        json={
            "target": {"sheetId": sheet_id, "rowIds": row_ids},
            "columns": columns,
        },
    )
    assert res.status_code == 202, res.json()
    return res


def _drive(worker: Worker, client: TestClient, job_id: str) -> dict[str, Any]:
    deadline = time.monotonic() + 20
    while time.monotonic() < deadline:
        worker.run_once()
        res = client.get(f"{BASE}/jobs/{job_id}")
        if res.json()["status"] in TERMINAL:
            return res.json()
        time.sleep(0.01)
    raise AssertionError(f"job {job_id} not terminal")


def _sse_raw(client: TestClient, job_id: str) -> tuple[str, Any]:
    with client.stream("GET", f"{BASE}/jobs/{job_id}/events") as resp:
        return resp.read().decode("utf-8"), resp


def _fixture_emails() -> set[str]:
    emails: set[str] = set()
    for tool, case in MOLTSETS_FIXTURES:
        emails.update(EMAIL_RE.findall(json.dumps(_molt_body(tool, case))))
    return emails


# ------------------------------------------------------------- scenario


def test_honesty_rules_end_to_end(
    engine: Engine, migrated: None, settings: Any, caplog: Any
) -> None:
    gated = settings.model_copy(
        update={
            "gate_g3_moltsets": True,
            "exa_api_key": SecretStr(SENTINEL_EXA),
            "moltsets_api_key": SecretStr(SENTINEL_MOLTSETS),
        }
    )
    app = create_app(gated)
    bodies: list[str] = []       # every API/SSE body, for the scans
    responses: list[Any] = []    # every response, for X-Request-Id

    def keep(res: Any) -> Any:
        responses.append(res)
        bodies.append(res.text)
        return res

    with caplog.at_level(logging.DEBUG):
        with TestClient(app) as client:
            with Session(engine) as s:
                sheet, rows = seed_demo_companies(s)
                s.commit()
                sheet_id, acme_id = sheet.id, rows["Acme"]

            # ---- catalog -------------------------------------------------
            catalog_res = keep(client.get(f"{BASE}/enrichments/catalog"))
            assert catalog_res.status_code == 200
            catalog = catalog_res.json()["data"]
            catalog_ids = {i["id"] for i in catalog}
            assert {i["source"] for i in catalog} <= ALLOWED_SOURCES
            assert EXCLUDED_IDS.isdisjoint(catalog_ids)
            assert {"find_decision_makers", "find_work_email"} <= catalog_ids
            cost_of = {i["id"]: i["cost"] for i in catalog}

            worker = Worker(engine, gated, _executors())

            # ---- run 1: five Exa enrichments on Acme ----------------------
            r1 = keep(_post_run(client, sheet_id, [acme_id], EXA_COLUMNS)).json()
            job1 = _drive(worker, client, r1["jobId"])
            assert job1["status"] == "succeeded"

            # ---- run 2: find_decision_makers -> Leaders upsert ------------
            r2 = keep(
                _post_run(
                    client, sheet_id, [acme_id],
                    [{"key": "dms", "enrichmentId": "find_decision_makers"}],
                )
            ).json()
            job2 = _drive(worker, client, r2["jobId"])
            assert job2["status"] == "succeeded"

            with Session(engine) as s:
                leaders = s.execute(
                    select(Sheet).where(
                        Sheet.kind == "leaders",
                        Sheet.project_id.is_(None),
                    )
                ).scalar_one()
                leader_ids = [
                    r.id
                    for r in s.execute(
                        select(Row).where(
                            Row.sheet_id == leaders.id,
                            Row.company_row_id == acme_id,
                        )
                    ).scalars()
                ]
            assert len(leader_ids) == 3

            # ---- run 3: find_work_email on the Leaders rows ---------------
            r3 = keep(
                _post_run(
                    client, leaders.id, leader_ids,
                    [{"key": "workEmail", "enrichmentId": "find_work_email"}],
                )
            ).json()
            job3 = _drive(worker, client, r3["jobId"])
            assert job3["status"] == "succeeded"

            # ---- run views + SSE ------------------------------------------
            run_views = [
                keep(client.get(f"{BASE}/enrichments/runs/{r['runId']}")).json()
                for r in (r1, r2, r3)
            ]
            sse_frames = ""
            for job in (job1, job2, job3):
                raw, resp = _sse_raw(client, job["id"])
                responses.append(resp)
                bodies.append(raw)
                sse_frames += raw
                assert "event: done" in raw

            # ---- every response carries X-Request-Id (H5) -----------------
            for res in responses:
                assert res.headers.get("x-request-id"), res

        # ---- DB-level invariants ------------------------------------------
        with Session(engine) as s:
            my_run_ids = {r["runId"] for r in (r1, r2, r3)}
            cells = list(
                s.execute(
                    select(Cell).where(Cell.last_run_id.in_(my_run_ids))
                ).scalars()
            )
            assert len(cells) == len(EXA_COLUMNS) + 1 + len(leader_ids)
            source_rows = list(s.execute(select(CellSource)).scalars())
            sources_for = {
                (c.row_id, c.column_id): 0 for c in cells
            }
            for src in source_rows:
                key = (src.row_id, src.column_id)
                if key in sources_for:
                    sources_for[key] += 1

            for cell in cells:
                if cell.status == "succeeded":
                    assert cell.value is not None
                    assert cell.provenance in ALLOWED_PROVENANCE
                    assert cell.source in {"exa", "moltsets"}
                    if cell.provenance == "verified":
                        assert sources_for[(cell.row_id, cell.column_id)] >= 1
                elif cell.status == "no_data":
                    assert cell.value is None
                    assert cell.cost == 0
                else:
                    pytest.fail(
                        f"unexpected cell status {cell.status} "
                        f"(column {cell.column_id})"
                    )

            # per-run SA-2 invariants on the API views
            for view in run_views:
                succ_cost = sum(
                    c["cost"] for c in view["cells"] if c["status"] == "succeeded"
                )
                assert view["chargedCredits"] == succ_cost
                assert view["estimatedCredits"] >= view["chargedCredits"]
                for c in view["cells"]:
                    if c["status"] == "succeeded":
                        assert c["cost"] == cost_of[c["enrichmentId"]]
                    elif c["status"] == "no_data":
                        assert c["value"] is None and c["cost"] == 0
                    assert "Guessed" not in json.dumps(c)

            # per-job chargedCredits (DB view)
            jobs = {
                j.id: j
                for j in s.execute(select(Job)).scalars()
                if j.id in {job1["id"], job2["id"], job3["id"]}
            }
            assert len(jobs) == 3
            assert jobs[job1["id"]].charged_credits == sum(
                c.cost for c in cells
                if c.last_run_id == r1["runId"] and c.status == "succeeded"
            )
            assert jobs[job2["id"]].charged_credits == sum(
                c.cost for c in cells
                if c.last_run_id == r2["runId"] and c.status == "succeeded"
            )
            assert jobs[job3["id"]].charged_credits == sum(
                c.cost for c in cells
                if c.last_run_id == r3["runId"] and c.status == "succeeded"
            )

            # SA-1: the ledger stays untouched; balance stays seeded
            assert (
                s.execute(select(func.count()).select_from(CreditLedger))
                .scalar_one()
            ) == 0
            assert (
                s.execute(
                    select(Workspace.credits_balance).where(
                        Workspace.id == "ws_demo"
                    )
                ).scalar_one()
            ) == 5000

            # email-shaped values only from provider fixtures
            cell_blobs = [json.dumps(c.value) for c in cells]
            leader_datas = [
                json.dumps(r.data)
                for r in s.execute(
                    select(Row).where(
                        Row.sheet_id == leaders.id,
                        Row.company_row_id == acme_id,
                    )
                ).scalars()
            ]
            found_emails: set[str] = set()
            for blob in cell_blobs + leader_datas:
                found_emails.update(EMAIL_RE.findall(blob))
            assert found_emails  # the scenario did produce provider emails
            assert found_emails <= _fixture_emails()

            # "Guessed" never in any DB cell value — global, not just ours
            for c in s.execute(select(Cell)).scalars():
                assert "Guessed" not in json.dumps(c.value)

            # sentinels must not sit in any DB column either
            db_blob = " ".join(
                cell_blobs + leader_datas
                + [json.dumps(j.error) + json.dumps(j.result) for j in jobs.values()]
                + [
                    f"{pc.provider} {pc.endpoint} {pc.request_id} "
                    f"{pc.status_code} {pc.tokens}"
                    for pc in s.execute(select(ProviderCall)).scalars()
                ]
            )

        # ---- the literal "Guessed" never appears ---------------------------
        assert "Guessed" not in json.dumps(app.openapi())
        for body in bodies:
            assert "Guessed" not in body
        assert "Guessed" not in db_blob

        # ---- H4 secret redaction -------------------------------------------
        for sentinel in (SENTINEL_EXA, SENTINEL_MOLTSETS):
            assert sentinel not in caplog.text
            for body in bodies:
                assert sentinel not in body
            assert sentinel not in db_blob
            assert sentinel not in sse_frames


# ------------------------------------------------------ boundary re-run


def test_only_sheets_module_writes_sheet_tables() -> None:
    """Re-run the §8.4 boundary scan as part of the honesty gate: only
    app/modules/sheets (and alembic) may import sheets.models."""
    _boundary_scan()
