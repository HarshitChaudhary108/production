"""Deterministic fake executor + demo data for P2 tests (PG-1).

Mirrors server/mock-api.mjs (COMPANIES, sample(), shouldFail) with the SA-5 /
C9 rewrite: the mock's scripted "failures" (Brightpath linkedin, Strata
revenue) come out as ``no_data`` here, matching cell status semantics. Any
enrichment on "Boom Corp" fails with ``provider_unavailable`` so tests can
drive the all-failed path.

Only the four enrichments under test exist in TEST_CATALOG; their costs are
the SA-2 test cost map (find_funding 3, find_revenue 2, find_company_news 3,
find_linkedin_highlights 4).
"""

import threading
import time
from collections import Counter
from collections.abc import Callable
from typing import Any, ClassVar

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.enrichment.executors.base import (
    ColumnConfig,
    ExecContext,
    ExecError,
    ExecResult,
    ProviderCallRecord,
    RowSnapshot,
    SignalDraft,
    SourceRef,
)
from app.modules.sheets import service as sheets
from app.modules.sheets.models import Row, Sheet

# --- test catalog (subset of the mock CATALOG with SA-2 test costs) ---------

TEST_CATALOG: dict[str, dict[str, Any]] = {
    "find_funding": {
        "name": "Find Company Funding",
        "description": "Find the company's latest funding round.",
        "cost": 3,
        "output_type": "badge",
        "source": "crunchbase",
    },
    "find_revenue": {
        "name": "Find Company Revenue",
        "description": "Find the company's estimated revenue.",
        "cost": 2,
        "output_type": "text",
        "source": "web",
    },
    "find_company_news": {
        "name": "Find Company News",
        "description": "Find the latest relevant company news.",
        "cost": 3,
        "output_type": "text",
        "source": "web",
    },
    "find_linkedin_highlights": {
        "name": "Find LinkedIn Profile Highlights",
        "description": "Extract noteworthy details from the company profile.",
        "cost": 4,
        "output_type": "text",
        "source": "linkedin",
    },
}

# --- demo companies (mock COMPANIES + Boom Corp for the all-fail path) ------

DEMO_COMPANIES: list[dict[str, Any]] = [
    {"name": "Acme", "domain": "acme.io", "industry": "B2B SaaS", "size": 240,
     "city": "Austin, TX", "funding": "Series B — $28M led by Redpoint"},
    {"name": "RevenueFlow", "domain": "revenueflow.com", "industry": "B2B SaaS",
     "size": 410, "city": "Denver, CO", "funding": "Series B — $34M"},
    {"name": "Northwind Labs", "domain": "northwind.dev", "industry": "DevTools",
     "size": 120, "city": "Toronto, ON", "funding": "Series A — $9M"},
    {"name": "Brightpath", "domain": "brightpath.io", "industry": "MarTech",
     "size": 65, "city": "London, UK", "funding": "Seed — $4M"},
    {"name": "Strata", "domain": "strata.dev", "industry": "Data", "size": 30,
     "city": "Berlin, DE", "funding": "Pre-seed"},
    {"name": "Boom Corp", "domain": "boom.example", "industry": "Havoc",
     "size": 10, "city": "Nowhere", "funding": "None"},
]

DEMO_SHEET_KEY = "p2_demo_companies"


def seed_demo_companies(s: Session) -> tuple[Sheet, dict[str, str]]:
    """Get-or-create the demo sheet and its rows (idempotent across tests).

    Returns (sheet, {company name: row_id})."""
    sheet = s.execute(
        select(Sheet).where(Sheet.key == DEMO_SHEET_KEY)
    ).scalar_one_or_none()
    if sheet is None:
        sheet = sheets.create_sheet(
            s, key=DEMO_SHEET_KEY, name="P2 demo companies", kind="companies"
        )
    sheets.add_base_rows(s, sheet.id, DEMO_COMPANIES)
    rows = {
        r.data["name"]: r.id
        for r in s.execute(
            select(Row).where(Row.sheet_id == sheet.id)
        ).scalars()
    }
    s.flush()
    return sheet, rows


# --- scripted outcomes ------------------------------------------------------

_NO_DATA: set[tuple[str, str]] = {
    ("find_linkedin_highlights", "Brightpath"),
    ("find_revenue", "Strata"),
    ("find_company_news", "Strata"),
}

_SAMPLES: dict[str, Callable[[dict[str, Any]], Any]] = {
    "find_funding": lambda c: c["funding"],
    "find_revenue": lambda c: f"{c['size'] * 0.08}M ARR (estimated)",
    "find_company_news": lambda c: (
        f"{c['name']} announced a new GTM initiative this week"
    ),
    "find_linkedin_highlights": lambda c: (
        f"{c['name']} is expanding its GTM leadership team"
    ),
}

# Mock catalog sources map to real providers in C3; the fake executor's
# provider name is "fake" so tests can assert the cell.source field honestly.
_PROVIDER = "fake"


class FakeExecutor:
    """Executor (app.modules.enrichment.executors.base.Executor) with
    deterministic scripted outcomes. ``cell_ms`` simulates provider latency so
    cancel/pause tests can land mid-run. Executed (row_id, column_id) pairs are
    recorded so tests can assert exactly-once processing."""

    provider = _PROVIDER
    EXECUTOR_VERSION = "fake-1"

    # P5 (§8.7): news success emits a "News" draft, funding success a
    # "Funding" draft (mimics the real find_funding step-2 emission).
    _SIGNAL_TYPES: ClassVar[dict[str, str]] = {
        "find_company_news": "News",
        "find_funding": "Funding",
    }

    def __init__(self, cell_ms: float = 0.0) -> None:
        self.cell_ms = cell_ms
        self.executions: Counter[tuple[str | None, str]] = Counter()
        self._lock = threading.Lock()

    def execute(
        self, row: RowSnapshot, column: ColumnConfig, ctx: ExecContext
    ) -> ExecResult:
        if self.cell_ms:
            time.sleep(self.cell_ms / 1000)
        with self._lock:
            self.executions[(row.id, column.key)] += 1
        name = str(row.data.get("name") or "")
        domain = row.data.get("domain")
        call = ProviderCallRecord(
            provider=_PROVIDER,
            endpoint="fake.execute",
            status_code=200,
            request_id=f"req-{ctx.job_id}-{row.id}-{column.key}",
            cost_dollars=0.0,
            ms=int(self.cell_ms),
        )
        if name == "Boom Corp":
            return ExecResult(
                status="failed",
                error=ExecError(
                    code="provider_unavailable", message="Provider unavailable."
                ),
                provider_calls=[
                    ProviderCallRecord(
                        provider=call.provider,
                        endpoint=call.endpoint,
                        status_code=503,
                        request_id=call.request_id,
                        cost_dollars=None,
                        ms=call.ms,
                    )
                ],
            )
        if (column.enrichment_id, name) in _NO_DATA:
            return ExecResult(
                status="no_data", provenance="not_found", provider_calls=[call]
            )
        signal_type = self._SIGNAL_TYPES.get(column.enrichment_id or "")
        signals = (
            [
                SignalDraft(
                    type=signal_type,
                    detail=str(_SAMPLES[column.enrichment_id or ""](row.data)),
                    source_host=domain if isinstance(domain, str) else None,
                    detected_at="2026-10-20",
                    confidence_label="high",
                )
            ]
            if signal_type
            else []
        )
        return ExecResult(
            status="succeeded",
            value=_SAMPLES[column.enrichment_id or ""](row.data),
            provenance=(
                "estimated" if column.enrichment_id == "find_revenue"
                else "provider_reported"
            ),
            confidence_label="high",
            sources=[SourceRef(url=f"https://{domain}/", title=name)],
            provider_calls=[call],
            signals=signals,
        )


class WorkerHarness:
    """Run a Worker in a daemon thread for tests."""

    def __init__(self, worker: Any, poll_interval: float = 0.02) -> None:
        import threading as _t

        self._worker = worker
        self._poll = poll_interval
        self._stop = _t.Event()
        self._thread = _t.Thread(
            target=worker.run_forever,
            args=(self._stop,),
            kwargs={"poll_interval": poll_interval},
            daemon=True,
        )

    def __enter__(self) -> "WorkerHarness":
        self._thread.start()
        return self

    def __exit__(self, *exc: Any) -> None:
        self._stop.set()
        self._thread.join(timeout=10)
