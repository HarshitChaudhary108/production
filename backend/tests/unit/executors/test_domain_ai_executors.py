"""Domain-scoped (verified) and AI-inferred executors (plan §7.1/§7.2,
prompt pack P4a.4).

- Domain-scoped: ``includeDomains: [domain]``, entity check on citation
  URLs, citations REQUIRED (verified).
- AI-inferred (deep-lite): value kept without citations, citations stored
  when present, provenance ALWAYS ``ai_inferred``.
"""

import json
from collections import deque
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
from app.modules.enrichment.executors.classify_b2b_b2c import (
    B2B_B2C_SCHEMA,
    ClassifyB2bB2c,
)
from app.modules.enrichment.executors.custom_prompt import CustomPrompt
from app.modules.enrichment.executors.find_competitors import (
    COMPETITORS_SCHEMA,
    FindCompetitors,
)
from app.modules.enrichment.executors.find_core_values import (
    CORE_VALUES_SCHEMA,
    FindCoreValues,
)
from app.modules.enrichment.executors.find_free_trial import (
    FREE_TRIAL_SCHEMA,
    FindFreeTrial,
)
from app.modules.enrichment.executors.find_gtm_strategy import FindGtmStrategy
from app.modules.enrichment.executors.find_job_openings import (
    JOB_OPENINGS_SCHEMA,
    FindJobOpenings,
)
from app.modules.enrichment.executors.find_linkedin_highlights import (
    FindLinkedinHighlights,
)
from app.modules.enrichment.executors.find_pricing import (
    PRICING_SCHEMA,
    FindPricing,
)
from app.modules.enrichment.executors.find_product_categories import (
    CATEGORIES_SCHEMA,
    FindProductCategories,
)
from app.modules.enrichment.executors.find_revenue_model import FindRevenueModel
from app.modules.enrichment.executors.find_tech_stack import (
    TECH_STACK_SCHEMA,
    FindTechStack,
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

    def _emit(self, endpoint: str, record: Any) -> None:
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


def col(enrichment_id: str, prompt: str | None = None) -> ColumnConfig:
    return ColumnConfig(
        id="c1", key="k", label="L", type="text",
        enrichment_id=enrichment_id, prompt=prompt, params=None,
    )


ACME = RowSnapshot(
    id="r1", data={"name": "Acme, Inc.", "loc": "London"},
    normalized_domain="acme.io",
)
NO_DOMAIN = RowSnapshot(
    id="r2", data={"name": "Acme, Inc."}, normalized_domain=None
)
NO_NAME = RowSnapshot(id="r3", data={}, normalized_domain="acme.io")
EMPTY_ROW = RowSnapshot(id="r4", data={}, normalized_domain=None)


def empty_output() -> dict[str, Any]:
    return {"requestId": "fx-e", "results": [], "output": None}


# --------------------------------------------------------- find_core_values


def test_core_values_succeeds_on_domain_citation(settings: Settings) -> None:
    fake = FakeExa([body("find_core_values", "has-values")])
    res = FindCoreValues(fake).execute(
        ACME, col("find_core_values"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.value == "Customer-first, Transparency, Speed"
    assert res.provenance == "verified"
    assert [s.url for s in res.sources] == ["https://acme.io/about"]
    ep, req = fake.calls[0]
    assert ep == "search"
    assert req["includeDomains"] == ["acme.io"]
    assert req["type"] == "auto"
    assert req["numResults"] == 5
    assert req["outputSchema"] == CORE_VALUES_SCHEMA
    assert req["systemPrompt"] == settings.exa_system_prompt


def test_core_values_uses_column_prompt_then_catalog_description(
    settings: Settings,
) -> None:
    fake = FakeExa([
        body("find_core_values", "has-values"),
        body("find_core_values", "has-values"),
    ])
    FindCoreValues(fake).execute(
        ACME, col("find_core_values", prompt="What values does Acme state?"),
        ctx(settings),
    )
    FindCoreValues(fake).execute(
        ACME, col("find_core_values"), ctx(settings)
    )
    assert fake.calls[0][1]["query"] == "What values does Acme state?"
    # falls back to the catalog description, not the label
    assert fake.calls[1][1]["query"] == (
        "Find the company's stated core values."
    )


def test_core_values_off_domain_citation_no_data(settings: Settings) -> None:
    fake = FakeExa([body("find_core_values", "off-domain-citation")])
    res = FindCoreValues(fake).execute(
        ACME, col("find_core_values"), ctx(settings)
    )
    assert res.status == "no_data"
    assert res.sources == []


def test_core_values_uncited_no_data(settings: Settings) -> None:
    fake = FakeExa([body("find_core_values", "uncited")])
    res = FindCoreValues(fake).execute(
        ACME, col("find_core_values"), ctx(settings)
    )
    assert res.status == "no_data"


# --------------------------------------------------------- find_free_trial


def test_free_trial_true_with_citation(settings: Settings) -> None:
    fake = FakeExa([body("find_free_trial", "trial-14")])
    res = FindFreeTrial(fake).execute(
        ACME, col("find_free_trial"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.value == "Free trial available (14 days)"
    assert res.provenance == "verified"


def test_free_trial_false_cited(settings: Settings) -> None:
    fake = FakeExa([body("find_free_trial", "no-trial-cited")])
    res = FindFreeTrial(fake).execute(
        ACME, col("find_free_trial"), ctx(settings)
    )
    assert res.value == "No free trial found"


def test_free_trial_false_uncited_is_no_data(settings: Settings) -> None:
    fake = FakeExa([body("find_free_trial", "false-uncited")])
    res = FindFreeTrial(fake).execute(
        ACME, col("find_free_trial"), ctx(settings)
    )
    assert res.status == "no_data"
    assert res.value != "No free trial found"


def test_free_trial_null_no_data(settings: Settings) -> None:
    fake = FakeExa([body("find_free_trial", "null-trial")])
    res = FindFreeTrial(fake).execute(
        ACME, col("find_free_trial"), ctx(settings)
    )
    assert res.status == "no_data"


# --------------------------------------------------------- find_pricing


def test_pricing_succeeds(settings: Settings) -> None:
    fake = FakeExa([body("find_pricing", "has-pricing")])
    res = FindPricing(fake).execute(ACME, col("find_pricing"), ctx(settings))
    assert res.status == "succeeded"
    assert res.value == "$49/seat · per-seat subscription"
    assert res.provenance == "verified"


def test_pricing_not_published_cited(settings: Settings) -> None:
    fake = FakeExa([body("find_pricing", "not-published")])
    res = FindPricing(fake).execute(ACME, col("find_pricing"), ctx(settings))
    assert res.value == "Pricing not published"


def test_pricing_off_domain_citation_no_data(settings: Settings) -> None:
    fake = FakeExa([body("find_pricing", "off-domain-citation")])
    res = FindPricing(fake).execute(ACME, col("find_pricing"), ctx(settings))
    assert res.status == "no_data"


# --------------------------------------------------------- find_job_openings


def test_job_openings_succeeds(settings: Settings) -> None:
    fake = FakeExa([body("find_job_openings", "has-roles")])
    res = FindJobOpenings(fake).execute(
        ACME, col("find_job_openings"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.value == (
        "12 open roles; GTM: Account Executive, SDR, Growth Marketing Manager"
    )
    req = fake.calls[0][1]
    assert req["query"] == "careers open positions"
    assert req["includeDomains"] == ["acme.io"]


def test_job_openings_uncited_no_data(settings: Settings) -> None:
    fake = FakeExa([body("find_job_openings", "uncited")])
    res = FindJobOpenings(fake).execute(
        ACME, col("find_job_openings"), ctx(settings)
    )
    assert res.status == "no_data"


# --------------------------------------------------------- ai_inferred group


def test_gtm_strategy_ai_inferred_with_citations(settings: Settings) -> None:
    fake = FakeExa([body("find_gtm_strategy", "has-text")])
    res = FindGtmStrategy(fake).execute(
        ACME, col("find_gtm_strategy"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.provenance == "ai_inferred"
    assert "product-led" in res.value
    assert len(res.sources) == 1
    req = fake.calls[0][1]
    assert req["type"] == "deep-lite"
    assert req["outputSchema"] == {"type": "text"}
    assert req["query"].startswith("Analyze the company's go-to-market motion")
    assert "Company: Acme, Inc. (acme.io)" in req["query"]


def test_gtm_strategy_uncited_still_succeeds(settings: Settings) -> None:
    fake = FakeExa([body("find_gtm_strategy", "uncited-text")])
    res = FindGtmStrategy(fake).execute(
        ACME, col("find_gtm_strategy"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.provenance == "ai_inferred"
    assert res.sources == []


def test_revenue_model_uncited_still_succeeds(settings: Settings) -> None:
    fake = FakeExa([body("find_revenue_model", "uncited-text")])
    res = FindRevenueModel(fake).execute(
        ACME, col("find_revenue_model"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.provenance == "ai_inferred"
    assert res.value == "Subscription — seat-based SaaS pricing."
    assert res.sources == []


def test_product_categories_chips(settings: Settings) -> None:
    fake = FakeExa([body("find_product_categories", "has-categories")])
    res = FindProductCategories(fake).execute(
        ACME, col("find_product_categories"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.value == ["Sales Tech", "RevOps"]
    assert res.provenance == "ai_inferred"


def test_b2b_b2c_accepts_both(settings: Settings) -> None:
    fake = FakeExa([body("classify_b2b_b2c", "both")])
    res = ClassifyB2bB2c(fake).execute(
        ACME, col("classify_b2b_b2c"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.value == "Both"


@pytest.mark.parametrize(
    "model", ["Marketplace", "b2b", "", None],
    ids=["other", "lowercase", "empty", "null"],
)
def test_b2b_b2c_rejects_non_enum(
    model: str | None, settings: Settings
) -> None:
    fake = FakeExa([
        {"requestId": "fx", "results": [],
         "output": {"content": {"model": model}, "grounding": []}}
    ])
    res = ClassifyB2bB2c(fake).execute(
        ACME, col("classify_b2b_b2c"), ctx(settings)
    )
    assert res.status == "no_data"


@pytest.mark.parametrize(
    "executor,eid,prompt",
    [
        (FindGtmStrategy, "find_gtm_strategy", None),
        (FindRevenueModel, "find_revenue_model", None),
        (FindProductCategories, "find_product_categories", None),
        (FindCompetitors, "find_competitors", None),
        (FindTechStack, "find_tech_stack", None),
        (CustomPrompt, "custom_prompt", "p"),
    ],
)
def test_ai_inferred_empty_output_no_data(
    executor: Any, eid: str, prompt: str | None, settings: Settings
) -> None:
    fake = FakeExa([empty_output()])
    res = executor(fake).execute(ACME, col(eid, prompt=prompt), ctx(settings))
    assert res.status == "no_data"
    assert res.provenance == "ai_inferred"


def test_competitors_capped_at_three(settings: Settings) -> None:
    fake = FakeExa([body("find_competitors", "five")])
    res = FindCompetitors(fake).execute(
        ACME, col("find_competitors"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.value == ["Clay", "Apollo", "ZoomInfo"]
    assert res.provenance == "ai_inferred"
    # ai_inferred keeps off-domain citations as stored evidence
    assert [s.url for s in res.sources] == [
        "https://g2.example/acme-alternatives"
    ]


def test_tech_stack_mentions(settings: Settings) -> None:
    fake = FakeExa([body("find_tech_stack", "has-tech")])
    res = FindTechStack(fake).execute(
        ACME, col("find_tech_stack"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.value == ["React", "PostgreSQL", "AWS"]
    assert res.provenance == "ai_inferred"
    req = fake.calls[0][1]
    assert "technology stack tools integrations" in req["query"]


# --------------------------------------------------------- linkedin highlights


def test_linkedin_highlights_company_page(settings: Settings) -> None:
    fake = FakeExa([body("find_linkedin_highlights", "has-profile")])
    res = FindLinkedinHighlights(fake).execute(
        ACME, col("find_linkedin_highlights"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.provenance == "verified"
    # at most 3 highlights, from the /company/ URL only (the /in/ profile
    # result comes first and must be skipped)
    assert res.value == (
        "Acme is a B2B SaaS company with 42 employees. "
        "Recently launched the Acme API. "
        "Hiring 4 GTM roles this quarter."
    )
    assert [s.url for s in res.sources] == [
        "https://www.linkedin.com/company/acme"
    ]
    req = fake.calls[0][1]
    assert req["includeDomains"] == ["linkedin.com"]
    assert req["numResults"] == 3
    assert req["contents"] == {"highlights": True}
    assert "outputSchema" not in req


def test_linkedin_highlights_no_company_page_no_data(settings: Settings) -> None:
    fake = FakeExa([body("find_linkedin_highlights", "wrong-url")])
    res = FindLinkedinHighlights(fake).execute(
        ACME, col("find_linkedin_highlights"), ctx(settings)
    )
    assert res.status == "no_data"


# --------------------------------------------------------- custom_prompt


def test_custom_prompt_query_and_value(settings: Settings) -> None:
    fake = FakeExa([body("custom_prompt", "answer")])
    res = CustomPrompt(fake).execute(
        ACME,
        col("custom_prompt", prompt="What is Acme's differentiation?"),
        ctx(settings),
    )
    assert res.status == "succeeded"
    assert res.provenance == "ai_inferred"
    req = fake.calls[0][1]
    assert req["type"] == "deep-lite"
    assert "What is Acme's differentiation?" in req["query"]
    assert "Company: Acme, Inc. (acme.io)" in req["query"]


def test_custom_prompt_missing_prompt_fails(settings: Settings) -> None:
    fake = FakeExa([])
    res = CustomPrompt(fake).execute(
        ACME, col("custom_prompt"), ctx(settings)
    )
    assert res.status == "failed"
    assert res.error is not None and res.error.code == "missing_input"
    assert fake.calls == []


def test_prompt_hash_distinguishes_prompts() -> None:
    h_a = common.prompt_hash("What is Acme's differentiation?", None)
    h_b = common.prompt_hash("Who are Acme's competitors?", None)
    h_c = common.prompt_hash("What is Acme's differentiation?", {"x": 1})
    assert h_a != h_b
    assert h_a != h_c
    assert h_a == common.prompt_hash("What is Acme's differentiation?", None)


# --------------------------------------------------------- schemas & rules


def test_all_p4a4_schemas_within_limits() -> None:
    for schema in (
        CORE_VALUES_SCHEMA,
        FREE_TRIAL_SCHEMA,
        PRICING_SCHEMA,
        JOB_OPENINGS_SCHEMA,
        CATEGORIES_SCHEMA,
        B2B_B2C_SCHEMA,
        COMPETITORS_SCHEMA,
        TECH_STACK_SCHEMA,
        {"type": "text"},  # gtm / revenue_model / custom_prompt
    ):
        validate_output_schema(schema)


@pytest.mark.parametrize(
    "executor,requires",
    [
        (FindCoreValues, ("domain",)),
        (FindFreeTrial, ("domain",)),
        (FindPricing, ("domain",)),
        (FindJobOpenings, ("domain",)),
        (FindGtmStrategy, ("domain", "name")),
        (FindRevenueModel, ("domain", "name")),
        (FindProductCategories, ("domain", "name")),
        (ClassifyB2bB2c, ("domain", "name")),
        (FindCompetitors, ("domain", "name")),
        (FindTechStack, ("domain", "name")),
        (FindLinkedinHighlights, ("name",)),
        (CustomPrompt, ("domain", "name")),
    ],
)
def test_missing_input_fails_without_call(
    executor: Any, requires: tuple[str, ...], settings: Settings
) -> None:
    rows = [NO_DOMAIN, NO_NAME, EMPTY_ROW]
    for row in rows:
        missing_any = (
            ("domain" in requires and not row.normalized_domain)
            or ("name" in requires and not row.data.get("name"))
        )
        if not missing_any:
            continue
        fake = FakeExa([])
        res = executor(fake).execute(
            row, col("x", prompt="p" if executor is not CustomPrompt else None),
            ctx(settings),
        )
        assert res.status == "failed"
        assert res.error is not None and res.error.code == "missing_input"
        assert fake.calls == []


@pytest.mark.parametrize(
    "executor",
    [
        FindCoreValues, FindFreeTrial, FindPricing, FindJobOpenings,
        FindGtmStrategy, FindRevenueModel, FindProductCategories,
        ClassifyB2bB2c, FindCompetitors, FindTechStack,
        FindLinkedinHighlights, CustomPrompt,
    ],
)
def test_exa_503_maps_to_failed(executor: Any, settings: Settings) -> None:
    fake = FakeExa([], fail=ExaUnavailable("/search", 503, "upstream"))
    res = executor(fake).execute(
        ACME, col("x", prompt="p"), ctx(settings)
    )
    assert res.status == "failed"
    assert res.error is not None and res.error.code == "provider_unavailable"


def test_ai_inferred_never_verified(settings: Settings) -> None:
    # even with citations present, ai_inferred executors keep ai_inferred
    fake = FakeExa([body("find_gtm_strategy", "has-text")])
    res = FindGtmStrategy(fake).execute(
        ACME, col("find_gtm_strategy"), ctx(settings)
    )
    assert res.provenance == "ai_inferred"


def test_no_api_key_in_results(settings: Settings) -> None:
    # H4: the Exa key never surfaces in ExecResult fields or errors
    fake = FakeExa([], fail=ExaUnavailable("/search", 503, "upstream"))
    res = FindGtmStrategy(fake).execute(
        ACME, col("x", prompt="p"), ctx(settings)
    )
    blob = json.dumps(
        {
            "value": res.value,
            "error": res.error.message if res.error else None,
            "calls": [r.request_id for r in res.provider_calls],
        }
    )
    assert "test-exa-key" not in blob
