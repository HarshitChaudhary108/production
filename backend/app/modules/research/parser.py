"""HC-1 research request parser (docs/prompt-hc.md; HC-D1/HC-D2).

Extracts the company count the user asked for. The count is only trusted
when a number is followed, within at most three intervening words, by a
company-noun — and no employee-word or another number stands between.
Ranges ("100-250", "100 to 250") and employee counts never count.
"""

import re
from typing import Literal

from pydantic import BaseModel

from app.config import Settings
from app.errors import ApiError

_COUNT_NOUNS = frozenset(
    {"companies", "company", "accounts", "businesses", "startups", "brands"}
)
_EMPLOYEE_WORDS = frozenset(
    {"employee", "employees", "people", "staff", "members", "headcount"}
)
_SKIP_PREV = frozenset({"-", "–", "to"})  # noqa: RUF001 (en dash is a real range separator)
_NUMBER = re.compile(r"\d[\d,]*")

_STRIP = ".,;:!?\"'()[]{}"

PLAN_COLUMNS = [
    {"key": "company", "label": "Company Name"},
    {"key": "domain", "label": "Domain"},
    {"key": "emp", "label": "Employee Count"},
    {"key": "loc", "label": "Location"},
]


class PlanColumn(BaseModel):
    key: str
    label: str


class ResearchPlan(BaseModel):
    query: str
    requested_count: int
    count_source: Literal["prompt", "default"]
    requested_raw: int | None
    capped: bool
    max_count: int
    columns: list[PlanColumn]


def _norm(token: str) -> str:
    return token.strip(_STRIP).lower()


def _is_number(token: str) -> bool:
    return bool(_NUMBER.fullmatch(_norm(token)))


def _count_candidate(tokens: list[str]) -> int | None:
    """First requested company count, or None (HC-D1)."""
    for i, raw in enumerate(tokens):
        tok = _norm(raw)
        if not _NUMBER.fullmatch(tok):
            continue
        if i > 0 and _norm(tokens[i - 1]) in _SKIP_PREV:
            continue  # range end: "100 to 250" / "100 - 250"
        found = False
        for j in range(i + 1, min(i + 5, len(tokens))):
            word = _norm(tokens[j])
            if word in _COUNT_NOUNS:
                found = True
                break
            if _is_number(tokens[j]) or word in _EMPLOYEE_WORDS:
                break  # another number or an employee-word blocks the noun
        if found:
            return int(tok.replace(",", ""))
    return None


def parse_research_request(prompt: str, settings: Settings) -> ResearchPlan:
    """Parse the composer prompt into a research plan (docs/prompt-hc.md)."""
    query = prompt.strip()
    raw = _count_candidate(prompt.split())
    source: Literal["prompt", "default"]
    if raw is not None:
        if raw == 0:
            raise ApiError(
                422,
                "validation_error",
                "Company count must be positive.",
                details={"reason": "count_must_be_positive"},
            )
        n, source = raw, "prompt"
    else:
        n, source = settings.research_default_count, "default"
    max_count = settings.research_max_count
    return ResearchPlan(
        query=query,
        requested_count=min(n, max_count),
        count_source=source,
        requested_raw=raw,
        capped=n > max_count,
        max_count=max_count,
        columns=[PlanColumn(**c) for c in PLAN_COLUMNS],
    )
