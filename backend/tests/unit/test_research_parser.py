"""HC-1 research prompt parser (docs/prompt-hc.md; HC-D1/HC-D2).

The count the user sees is the count the job gets: first number followed,
within <=3 intervening words, by a company noun — never an employee count
or a range end.
"""

import pytest

import tests.env_defaults  # noqa: F401
from app.config import Settings
from app.errors import ApiError
from app.modules.research.parser import parse_research_request

SETTINGS = Settings()

SCREENSHOT = "find 20 companies in delhi, india. startup with technology category."


@pytest.mark.parametrize(
    ("prompt", "count", "source", "capped", "raw"),
    [
        (SCREENSHOT, 20, "prompt", False, 20),
        ("Find 30 B2B SaaS companies in India", 30, "prompt", False, 30),
        ("find 20 tech companies in Pune", 20, "prompt", False, 20),
        ("find 15 b2b saas fintech startups", 15, "prompt", False, 15),
        ("Find 1,200 startups", 100, "prompt", True, 1200),
        ("companies with 100-250 employees in Delhi", 25, "default", False, None),
        ("companies with 100 to 250 employees", 25, "default", False, None),
        ("find 50 employee companies", 25, "default", False, None),
        ("find twenty companies", 25, "default", False, None),
        ("find some companies", 25, "default", False, None),
    ],
)
def test_counts(
    prompt: str, count: int, source: str, capped: bool, raw: int | None
) -> None:
    plan = parse_research_request(prompt, SETTINGS)
    assert plan.requested_count == count
    assert plan.count_source == source
    assert plan.capped is capped
    assert plan.requested_raw == raw
    assert plan.max_count == 100


def test_zero_count_is_422() -> None:
    with pytest.raises(ApiError) as err:
        parse_research_request("find 0 companies", SETTINGS)
    assert err.value.status == 422
    assert err.value.code == "validation_error"
    assert (err.value.details or {}).get("reason") == "count_must_be_positive"


def test_query_is_the_trimmed_prompt_unchanged() -> None:
    plan = parse_research_request(f"  {SCREENSHOT}  ", SETTINGS)
    assert plan.query == SCREENSHOT


def test_columns_are_the_four_all_cols_entries() -> None:
    plan = parse_research_request(SCREENSHOT, SETTINGS)
    assert [c.model_dump() for c in plan.columns] == [
        {"key": "company", "label": "Company Name"},
        {"key": "domain", "label": "Domain"},
        {"key": "emp", "label": "Employee Count"},
        {"key": "loc", "label": "Location"},
    ]
