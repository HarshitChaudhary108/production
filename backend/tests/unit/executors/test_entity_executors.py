"""Entity-based executors (plan §7.1 rules, §7.2 find_company_domain /
find_snapshot / find_revenue / find_funding). Fixture-driven, no network.

Shared fake gateway replays synthetic ExaResponse bodies and records the
request bodies, so tests can assert call counts and request shapes.
"""

import json
from collections import deque
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

import pytest

from app.config import Settings
from app.modules.enrichment.executors import common
from app.modules.enrichment.executors.base import (
    ColumnConfig,
    ExecContext,
    ProviderCallRecord,
    RowSnapshot,
)
from app.modules.enrichment.executors.find_company_domain import (
    FindCompanyDomain,
)
from app.modules.enrichment.executors.find_funding import (
    FUNDING_SCHEMA,
    FindFunding,
)
from app.modules.enrichment.executors.find_revenue import FindRevenue
from app.modules.enrichment.executors.find_snapshot import FindSnapshot
from app.modules.providers.exa.errors import ExaUnavailable
from app.modules.providers.exa.models import ExaResponse
from app.modules.providers.exa.schema_limits import validate_output_schema

FIXTURES = Path(__file__).resolve().parents[2] / "fixtures" / "exa"


def body(enrichment_id: str, case: str) -> dict[str, Any]:
    path = FIXTURES / enrichment_id / f"{case}.synthetic.json"
    return json.loads(path.read_text(encoding="utf-8"))


class FakeExa:
    """Sync gateway matching the executor's client interface."""

    def __init__(self, responses: list[dict[str, Any]], fail: Exception | None = None) -> None:
        self.responses = deque(responses)
        self.calls: list[tuple[str, dict[str, Any]]] = []
        self.fail = fail
        self.records: list[ProviderCallRecord] = []

    def search(
        self, req: dict[str, Any], record: Any = None
    ) -> ExaResponse:
        self.calls.append(("search", req))
        if record is not None:
            record(
                ProviderCallRecord(
                    provider="exa", endpoint="/search", status_code=200,
                    request_id="fx", cost_dollars=0.005, ms=1,
                )
            )
        if self.fail is not None:
            raise self.fail
        return ExaResponse.model_validate(self.responses.popleft())

    def contents(self, req: dict[str, Any], record: Any = None) -> ExaResponse:
        self.calls.append(("contents", req))
        return ExaResponse.model_validate(self.responses.popleft())


def ctx(settings: Settings) -> ExecContext:
    return ExecContext(
        job_id="job_t", workspace_id="ws_demo", run_id="run_t", settings=settings
    )


def col(enrichment_id: str) -> ColumnConfig:
    return ColumnConfig(
        id="c1", key="k", label="L", type="text",
        enrichment_id=enrichment_id, prompt=None, params=None,
    )


ACME = RowSnapshot(
    id="r1", data={"name": "Acme, Inc.", "loc": "London"},
    normalized_domain="acme.io",
)
NO_DOMAIN = RowSnapshot(
    id="r2", data={"name": "Acme, Inc."}, normalized_domain=None
)


# --------------------------------------------------------- common helpers


def test_host_matches_domain() -> None:
    assert common.host_matches_domain("https://www.acme.io/x", "acme.io")
    assert common.host_matches_domain("https://docs.acme.io", "acme.io")
    assert common.host_matches_domain("https://acme.io", "acme.io")
    assert not common.host_matches_domain("https://evil-acme.io", "acme.io")
    assert not common.host_matches_domain("https://acme.io.evil.com", "acme.io")


def test_format_usd_short() -> None:
    assert common.format_usd_short(28_000_000) == "$28M"
    assert common.format_usd_short(1_500_000) == "$1.5M"
    assert common.format_usd_short(4_000_000) == "$4M"
    assert common.format_usd_short(950_000) == "$950K"


# --------------------------------------------------------- find_company_domain


def test_domain_missing_name_fails_without_call(settings: Settings) -> None:
    fake = FakeExa([])
    row = RowSnapshot(id="r9", data={}, normalized_domain=None)
    res = FindCompanyDomain(fake).execute(row, col("find_company_domain"), ctx(settings))
    assert res.status == "failed"
    assert res.error is not None and res.error.code == "missing_input"
    assert fake.calls == []


def test_domain_single_match_succeeds(settings: Settings) -> None:
    fake = FakeExa([body("find_company_domain", "single-match")])
    res = FindCompanyDomain(fake).execute(ACME, col("find_company_domain"), ctx(settings))
    assert res.status == "succeeded"
    assert res.value == "www.acme.io"
    assert res.provenance == "provider_reported"
    req = fake.calls[0][1]
    assert req["category"] == "company"
    assert req["type"] == "auto"
    assert req["numResults"] == 5
    assert "Acme" in req["query"]


def test_domain_two_matches_conflicting(settings: Settings) -> None:
    fake = FakeExa([body("find_company_domain", "two-matches")])
    res = FindCompanyDomain(fake).execute(ACME, col("find_company_domain"), ctx(settings))
    assert res.status == "no_data"
    assert res.provenance == "conflicting"
    hosts = {s.url for s in res.sources}
    assert "https://www.acme.io/" in hosts
    assert "https://acme.com/" in hosts


def test_domain_zero_matches_no_data(settings: Settings) -> None:
    fake = FakeExa([body("find_company_domain", "no-matches")])
    res = FindCompanyDomain(fake).execute(ACME, col("find_company_domain"), ctx(settings))
    assert res.status == "no_data"


def test_domain_normalization_acme_inc_matches(settings: Settings) -> None:
    # entity "ACME" vs row "Acme, Inc." -> match after suffix/punctuation strip
    fake = FakeExa([body("find_company_domain", "single-match")])
    res = FindCompanyDomain(fake).execute(ACME, col("find_company_domain"), ctx(settings))
    assert res.status == "succeeded"


# --------------------------------------------------------- find_snapshot


def test_snapshot_missing_domain_fails(settings: Settings) -> None:
    fake = FakeExa([])
    res = FindSnapshot(fake).execute(NO_DOMAIN, col("find_snapshot"), ctx(settings))
    assert res.status == "failed"
    assert res.error is not None and res.error.code == "missing_input"
    assert fake.calls == []


def test_snapshot_full_template(settings: Settings) -> None:
    fake = FakeExa([body("find_snapshot", "full")])
    res = FindSnapshot(fake).execute(ACME, col("find_snapshot"), ctx(settings))
    assert res.status == "succeeded"
    assert res.value == "B2B SaaS company · 42 employees · London, UK"
    assert res.provenance == "provider_reported"
    req = fake.calls[0][1]
    assert req["includeDomains"] == ["acme.io"]
    assert req["category"] == "company"
    assert req["numResults"] == 3


def test_snapshot_drops_missing_parts_cleanly(settings: Settings) -> None:
    fake = FakeExa([body("find_snapshot", "missing-workforce")])
    res = FindSnapshot(fake).execute(ACME, col("find_snapshot"), ctx(settings))
    assert res.value == "B2B SaaS company · London, UK"
    assert "··" not in res.value and "employees" not in res.value


def test_snapshot_all_missing_no_data(settings: Settings) -> None:
    fake = FakeExa([body("find_snapshot", "all-missing")])
    res = FindSnapshot(fake).execute(ACME, col("find_snapshot"), ctx(settings))
    assert res.status == "no_data"


def test_snapshot_wrong_host_entity_ignored(settings: Settings) -> None:
    fake = FakeExa([body("find_snapshot", "wrong-host")])
    res = FindSnapshot(fake).execute(ACME, col("find_snapshot"), ctx(settings))
    assert res.status == "no_data"


# --------------------------------------------------------- find_revenue


def test_revenue_formats_estimate(settings: Settings) -> None:
    fake = FakeExa([body("find_revenue", "has-revenue")])
    res = FindRevenue(fake).execute(ACME, col("find_revenue"), ctx(settings))
    assert res.status == "succeeded"
    assert res.value == "$28M (estimated)"
    assert res.provenance == "estimated"
    for _, req in fake.calls:
        assert "outputSchema" not in req  # no model fallback, ever


def test_revenue_null_is_no_data(settings: Settings) -> None:
    fake = FakeExa([body("find_revenue", "null-revenue")])
    res = FindRevenue(fake).execute(ACME, col("find_revenue"), ctx(settings))
    assert res.status == "no_data"


# --------------------------------------------------------- find_funding


def test_funding_step1_hit_skips_step2(settings: Settings) -> None:
    fake = FakeExa([body("find_funding", "has-round")])
    res = FindFunding(fake).execute(ACME, col("find_funding"), ctx(settings))
    assert res.status == "succeeded"
    assert res.value == "Series B — $28M (2025-03-01)"
    assert res.provenance == "provider_reported"
    assert len(fake.calls) == 1
    assert res.signals == []


def test_funding_step2_grounded(settings: Settings, monkeypatch: Any) -> None:
    frozen = datetime(2026, 1, 15, tzinfo=UTC)
    monkeypatch.setattr(common, "now_utc", lambda: frozen)
    fake = FakeExa([
        body("find_funding", "no-round"),
        body("find_funding", "news-grounded"),
    ])
    res = FindFunding(fake).execute(ACME, col("find_funding"), ctx(settings))
    assert res.status == "succeeded"
    assert res.provenance == "verified"
    assert len(res.sources) >= 1
    assert len(res.signals) == 1
    assert res.signals[0].type == "Funding"
    req = fake.calls[1][1]
    assert req["category"] == "news"
    assert req["outputSchema"] == FUNDING_SCHEMA
    assert req["systemPrompt"] == settings.exa_system_prompt
    expected_start = (frozen - timedelta(days=730)).date().isoformat()
    assert req["startPublishedDate"].startswith(expected_start[:4])
    got = datetime.fromisoformat(req["startPublishedDate"].replace("Z", "+00:00"))
    assert (frozen - got).days == 730


def test_funding_step2_ungrounded_no_data(settings: Settings) -> None:
    fake = FakeExa([
        body("find_funding", "no-round"),
        body("find_funding", "news-ungrounded"),
    ])
    res = FindFunding(fake).execute(ACME, col("find_funding"), ctx(settings))
    assert res.status == "no_data"
    assert res.signals == []


def test_funding_schema_within_limits() -> None:
    validate_output_schema(FUNDING_SCHEMA)


# --------------------------------------------------------- failure path


@pytest.mark.parametrize(
    "executor",
    [FindCompanyDomain, FindSnapshot, FindRevenue, FindFunding],
)
def test_exa_503_maps_to_failed(executor: Any, settings: Settings) -> None:
    fake = FakeExa([], fail=ExaUnavailable("/search", 503, "upstream"))
    res = executor(fake).execute(ACME, col("x"), ctx(settings))
    assert res.status == "failed"
    assert res.error is not None and res.error.code == "provider_unavailable"


def test_verified_provenance_has_source(settings: Settings) -> None:
    # every succeeded result provenance=verified carries >=1 source
    fake = FakeExa([
        body("find_funding", "no-round"),
        body("find_funding", "news-grounded"),
    ])
    res = FindFunding(fake).execute(ACME, col("find_funding"), ctx(settings))
    assert res.provenance != "verified" or len(res.sources) >= 1
