"""Canonical catalog (plan §6, A12, C3) — port of mock test 1 rewritten for
the canonical 17-live/22-total catalog.

- Default config: only ``live`` items are returned.
- A ``gated`` item appears only when its own gate flag is on.
- Excluded items (website_intent, add_to_hubspot) are never in the registry.
- ``cost`` is display metadata only (SA-2); no code may read it for charging.
"""

from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app

BASE = "/api/v1"

# The canonical table from plan §6. Prices are display-only — CONFIRM Q2.
def _exp(
    cost: int, output: str, applies: str, status: str, source: str
) -> dict[str, Any]:
    return {
        "cost": cost,
        "outputType": output,
        "appliesTo": applies,
        "status": status,
        "source": source,
    }


EXPECTED: dict[str, dict[str, Any]] = {
    "find_company_domain": _exp(2, "link", "companies", "live", "exa"),
    "find_snapshot": _exp(3, "text", "companies", "live", "exa"),
    "find_funding": _exp(3, "badge", "companies", "live", "exa"),
    "find_revenue": _exp(2, "text", "companies", "live", "exa"),
    "find_company_news": _exp(3, "text", "companies", "live", "exa"),
    "find_job_openings": _exp(3, "text", "companies", "gated", "exa"),
    "find_social_profiles": _exp(2, "chips", "companies", "live", "exa"),
    "find_core_values": _exp(3, "text", "companies", "live", "exa"),
    "find_free_trial": _exp(2, "badge", "companies", "live", "exa"),
    "find_pricing": _exp(3, "text", "companies", "live", "exa"),
    "find_gtm_strategy": _exp(5, "text", "companies", "live", "exa"),
    "find_revenue_model": _exp(3, "text", "companies", "live", "exa"),
    "find_product_categories": _exp(2, "chips", "companies", "live", "exa"),
    "classify_b2b_b2c": _exp(2, "badge", "companies", "live", "exa"),
    "find_competitors": _exp(2, "chips", "companies", "live", "exa"),
    "find_leadership_changes": _exp(4, "text", "companies", "live", "exa"),
    "find_tech_stack": _exp(6, "chips", "companies", "gated", "exa"),
    "find_linkedin_highlights": _exp(4, "text", "companies", "gated", "exa"),
    "find_decision_makers": _exp(20, "people", "companies", "gated", "moltsets"),
    "find_work_email": _exp(3, "email", "leaders", "gated", "moltsets"),
    "custom_prompt": _exp(3, "text", "companies", "live", "exa"),
    "plain_value": _exp(0, "text", "any", "live", "user"),
}

LIVE_IDS = {i for i, e in EXPECTED.items() if e["status"] == "live"}
GATED_IDS = set(EXPECTED) - LIVE_IDS
EXCLUDED_IDS = {"website_intent", "add_to_hubspot"}

GATE_FLAG_TO_IDS: dict[str, set[str]] = {
    "gate_g2_linkedin": {"find_linkedin_highlights"},
    "gate_g3_moltsets": {"find_decision_makers", "find_work_email"},
    "gate_g4_job_openings": {"find_job_openings"},
    "gate_tech_stack_label": {"find_tech_stack"},
}
ALL_FLAGS = set(GATE_FLAG_TO_IDS)


def _client(settings: Settings, **flags: bool) -> TestClient:
    return TestClient(create_app(settings.model_copy(update=flags)))


def _catalog(client: TestClient) -> list[dict[str, Any]]:
    res = client.get(f"{BASE}/enrichments/catalog")
    assert res.status_code == 200
    return res.json()["data"]


def test_default_config_returns_only_live_items(client: TestClient) -> None:
    items = _catalog(client)
    assert len(items) == 17
    assert {i["id"] for i in items} == LIVE_IDS
    for item in items:
        assert isinstance(item["id"], str)
        assert isinstance(item["cost"], int)
        assert item["cost"] >= 0
        if item["id"] == "plain_value":
            assert item["cost"] == 0
        else:
            assert item["cost"] > 0


def test_all_gate_flags_on_returns_every_item(settings: Settings) -> None:
    with _client(settings, **{f: True for f in ALL_FLAGS}) as client:
        items = _catalog(client)
    assert len(items) == 22
    assert {i["id"] for i in items} == set(EXPECTED)


@pytest.mark.parametrize("flag", sorted(ALL_FLAGS))
def test_each_gate_flag_turns_on_only_its_own_items(
    settings: Settings, flag: str
) -> None:
    with _client(settings, **{flag: True}) as client:
        ids = {i["id"] for i in _catalog(client)}
    assert ids == LIVE_IDS | GATE_FLAG_TO_IDS[flag]


def test_no_internal_fields_and_only_real_providers(
    settings: Settings,
) -> None:
    with _client(settings, **{f: True for f in ALL_FLAGS}) as client:
        items = _catalog(client)
    for item in items:
        for forbidden in ("executor", "sample", "internal"):
            assert forbidden not in item, f"{item['id']} exposes {forbidden!r}"
        assert item["source"] in {"exa", "moltsets", "user"}


def test_excluded_ids_never_appear(client: TestClient, settings: Settings) -> None:
    default_ids = {i["id"] for i in _catalog(client)}
    with _client(settings, **{f: True for f in ALL_FLAGS}) as gated_client:
        gated_ids = {i["id"] for i in _catalog(gated_client)}
    assert EXCLUDED_IDS.isdisjoint(default_ids | gated_ids)


@pytest.mark.parametrize("item_id,expected", sorted(EXPECTED.items()))
def test_costs_match_the_canonical_table(
    settings: Settings, item_id: str, expected: dict[str, Any]
) -> None:
    with _client(settings, **{f: True for f in ALL_FLAGS}) as client:
        items = {i["id"]: i for i in _catalog(client)}
    item = items[item_id]
    for field in ("cost", "outputType", "appliesTo", "status", "source"):
        assert item[field] == expected[field], f"{item_id}.{field}"


def test_ids_are_unique_and_plain_value_applies_to_any(
    settings: Settings,
) -> None:
    with _client(settings, **{f: True for f in ALL_FLAGS}) as client:
        items = _catalog(client)
    ids = [i["id"] for i in items]
    assert len(ids) == len(set(ids))
    plain = next(i for i in items if i["id"] == "plain_value")
    assert plain["appliesTo"] == "any"
