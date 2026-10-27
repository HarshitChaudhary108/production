"""Third-party search executors (plan §7.2): find_company_news,
find_leadership_changes, find_social_profiles.

News and leadership are explicitly third-party searches — the
host==domain entity check does NOT apply; keep rules are mention-based
(news) or citation-based (leadership). find_social_profiles is /contents
only — never a model call.
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
from app.modules.enrichment.executors.find_company_news import FindCompanyNews
from app.modules.enrichment.executors.find_leadership_changes import (
    LEADERSHIP_SCHEMA,
    FindLeadershipChanges,
)
from app.modules.enrichment.executors.find_social_profiles import (
    FindSocialProfiles,
)
from app.modules.providers.exa.errors import ExaUnavailable
from app.modules.providers.exa.models import ExaResponse
from app.modules.providers.exa.schema_limits import validate_output_schema

FIXTURES = Path(__file__).resolve().parents[2] / "fixtures" / "exa"


def body(enrichment_id: str, case: str) -> dict[str, Any]:
    path = FIXTURES / enrichment_id / f"{case}.synthetic.json"
    data: dict[str, Any] = json.loads(path.read_text(encoding="utf-8"))
    return data


class FakeExa:
    """Sync gateway matching the executor's client interface."""

    def __init__(self, responses: list[dict[str, Any]], fail: Exception | None = None) -> None:
        self.responses = deque(responses)
        self.calls: list[tuple[str, dict[str, Any]]] = []
        self.fail = fail
        self.records: list[ProviderCallRecord] = []

    def _emit(
        self, endpoint: str, record: Any
    ) -> None:
        if record is not None:
            record(
                ProviderCallRecord(
                    provider="exa", endpoint=endpoint, status_code=200,
                    request_id="fx", cost_dollars=0.005, ms=1,
                )
            )

    def search(
        self, req: dict[str, Any], record: Any = None
    ) -> ExaResponse:
        self.calls.append(("search", req))
        self._emit("/search", record)
        if self.fail is not None:
            raise self.fail
        return ExaResponse.model_validate(self.responses.popleft())

    def contents(self, req: dict[str, Any], record: Any = None) -> ExaResponse:
        self.calls.append(("contents", req))
        self._emit("/contents", record)
        if self.fail is not None:
            raise self.fail
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
NO_NAME = RowSnapshot(
    id="r3", data={}, normalized_domain="acme.io"
)
EMPTY_ROW = RowSnapshot(id="r4", data={}, normalized_domain=None)


# --------------------------------------------------------- find_company_news


def test_news_mention_succeeds_with_signal(
    settings: Settings, monkeypatch: Any
) -> None:
    frozen = datetime(2026, 10, 27, tzinfo=UTC)
    monkeypatch.setattr(common, "now_utc", lambda: frozen)
    fake = FakeExa([body("find_company_news", "mention")])
    res = FindCompanyNews(fake).execute(
        ACME, col("find_company_news"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.value == "Acme raises Series B (2026-09-15T00:00:00Z)"
    assert res.provenance == "verified"
    assert [s.url for s in res.sources] == [
        "https://news.example/acme-series-b"
    ]
    assert len(res.signals) == 1
    sig = res.signals[0]
    assert sig.type == "News"
    assert sig.source_host == "news.example"
    assert sig.detected_at == "2026-09-15T00:00:00Z"
    assert sig.detail == res.value
    # request shape: third-party news search, highlights requested
    ep, req = fake.calls[0]
    assert ep == "search"
    assert req["category"] == "news"
    assert req["query"] == "Acme, Inc."
    assert req["numResults"] == 10
    assert req["contents"] == {"highlights": True}
    start = datetime.fromisoformat(
        req["startPublishedDate"].replace("Z", "+00:00")
    )
    assert (frozen - start) == timedelta(days=settings.news_lookback_days)


def test_news_result_not_mentioning_company_discarded(
    settings: Settings,
) -> None:
    fake = FakeExa([body("find_company_news", "mention")])
    res = FindCompanyNews(fake).execute(
        ACME, col("find_company_news"), ctx(settings)
    )
    # the newer widget story is discarded; only the Acme story is kept
    assert res.value == "Acme raises Series B (2026-09-15T00:00:00Z)"
    assert all("widget" not in (s.url or "") for s in res.sources)


def test_news_all_discarded_no_data(settings: Settings) -> None:
    # "Tacme" must not keep a result for "Acme" (word-boundary match)
    fake = FakeExa([body("find_company_news", "none-mention")])
    res = FindCompanyNews(fake).execute(
        ACME, col("find_company_news"), ctx(settings)
    )
    assert res.status == "no_data"
    assert res.value is None
    assert res.signals == []
    assert res.sources == []


@pytest.mark.parametrize("row", [NO_DOMAIN, NO_NAME, EMPTY_ROW])
def test_news_missing_input_fails_without_call(
    row: RowSnapshot, settings: Settings
) -> None:
    fake = FakeExa([])
    res = FindCompanyNews(fake).execute(
        row, col("find_company_news"), ctx(settings)
    )
    assert res.status == "failed"
    assert res.error is not None and res.error.code == "missing_input"
    assert fake.calls == []


# --------------------------------------------------------- find_leadership_changes


def test_leadership_one_grounded_hire(
    settings: Settings, monkeypatch: Any
) -> None:
    frozen = datetime(2026, 10, 27, tzinfo=UTC)
    monkeypatch.setattr(common, "now_utc", lambda: frozen)
    fake = FakeExa([body("find_leadership_changes", "one-hire")])
    res = FindLeadershipChanges(fake).execute(
        ACME, col("find_leadership_changes"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.value == "New VP Sales: Jane Doe (2026-09-01)"
    assert res.provenance == "verified"
    assert [s.url for s in res.sources] == [
        "https://news.example/acme-jane"
    ]
    ep, req = fake.calls[0]
    assert ep == "search"
    assert req["category"] == "news"
    assert req["query"] == (
        "Acme, Inc. appoints OR hires OR joins as chief OR VP OR head"
    )
    assert req["outputSchema"] == LEADERSHIP_SCHEMA
    assert req["systemPrompt"] == settings.exa_system_prompt
    start = datetime.fromisoformat(
        req["startPublishedDate"].replace("Z", "+00:00")
    )
    assert (frozen - start) == timedelta(days=settings.leadership_lookback_days)


def test_leadership_two_changes_joined(settings: Settings) -> None:
    fake = FakeExa([body("find_leadership_changes", "two-changes")])
    res = FindLeadershipChanges(fake).execute(
        ACME, col("find_leadership_changes"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.value == (
        "New VP Sales: Jane Doe (2026-09-01); "
        "Departed CTO: Bob Smith (2026-08-12)"
    )


def test_leadership_empty_changes_no_data(settings: Settings) -> None:
    fake = FakeExa([body("find_leadership_changes", "empty-changes")])
    res = FindLeadershipChanges(fake).execute(
        ACME, col("find_leadership_changes"), ctx(settings)
    )
    assert res.status == "no_data"
    assert res.value is None


def test_leadership_null_content_no_data(settings: Settings) -> None:
    fake = FakeExa([{"requestId": "fx-null", "results": [], "output": None}])
    res = FindLeadershipChanges(fake).execute(
        ACME, col("find_leadership_changes"), ctx(settings)
    )
    assert res.status == "no_data"


def test_leadership_uncited_change_dropped(settings: Settings) -> None:
    fake = FakeExa([body("find_leadership_changes", "uncited-change")])
    res = FindLeadershipChanges(fake).execute(
        ACME, col("find_leadership_changes"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.value == "New VP Sales: Jane Doe (2026-09-01)"
    assert "Eve Roe" not in res.value


def test_leadership_schema_within_limits() -> None:
    validate_output_schema(LEADERSHIP_SCHEMA)


@pytest.mark.parametrize("row", [NO_DOMAIN, NO_NAME, EMPTY_ROW])
def test_leadership_missing_input_fails_without_call(
    row: RowSnapshot, settings: Settings
) -> None:
    fake = FakeExa([])
    res = FindLeadershipChanges(fake).execute(
        row, col("find_leadership_changes"), ctx(settings)
    )
    assert res.status == "failed"
    assert res.error is not None and res.error.code == "missing_input"
    assert fake.calls == []


# --------------------------------------------------------- find_social_profiles


def test_social_filters_links_to_social_urls(settings: Settings) -> None:
    fake = FakeExa([body("find_social_profiles", "has-social")])
    res = FindSocialProfiles(fake).execute(
        ACME, col("find_social_profiles"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.value == [
        "https://www.linkedin.com/company/acme",
        "https://x.com/acme",
    ]
    assert res.provenance == "verified"
    assert [s.url for s in res.sources] == ["https://acme.io"]


def test_social_request_is_contents_with_links_no_model(
    settings: Settings,
) -> None:
    fake = FakeExa([body("find_social_profiles", "has-social")])
    FindSocialProfiles(fake).execute(
        ACME, col("find_social_profiles"), ctx(settings)
    )
    assert len(fake.calls) == 1
    ep, req = fake.calls[0]
    assert ep == "contents"  # never /search
    assert req["urls"] == ["https://acme.io"]
    assert req["extras"] == {"links": 100}
    for forbidden in ("outputSchema", "systemPrompt", "query", "objective"):
        assert forbidden not in req


def test_social_no_links_no_data(settings: Settings) -> None:
    fake = FakeExa([body("find_social_profiles", "no-social")])
    res = FindSocialProfiles(fake).execute(
        ACME, col("find_social_profiles"), ctx(settings)
    )
    assert res.status == "no_data"
    assert res.value is None


@pytest.mark.parametrize("row", [NO_DOMAIN, EMPTY_ROW])
def test_social_missing_domain_fails_without_call(
    row: RowSnapshot, settings: Settings
) -> None:
    fake = FakeExa([])
    res = FindSocialProfiles(fake).execute(
        row, col("find_social_profiles"), ctx(settings)
    )
    assert res.status == "failed"
    assert res.error is not None and res.error.code == "missing_input"
    assert fake.calls == []


# --------------------------------------------------------- failure path


@pytest.mark.parametrize(
    "executor",
    [FindCompanyNews, FindLeadershipChanges, FindSocialProfiles],
)
def test_exa_503_maps_to_failed(executor: Any, settings: Settings) -> None:
    fake = FakeExa([], fail=ExaUnavailable("/search", 503, "upstream"))
    res = executor(fake).execute(ACME, col("x"), ctx(settings))
    assert res.status == "failed"
    assert res.error is not None and res.error.code == "provider_unavailable"
