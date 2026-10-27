"""Typed MoltSets request/response models — field names read verbatim from
developer.moltsets.com/openapi.json (checked 27 Oct 2026).

Envelope on every tool call: ``{results: {...}, status: "ok"|"not_found",
metadata: {...}}``. Read ``status``, not the HTTP code — a miss is 200.
"""

from dataclasses import dataclass, field
from typing import Any, Literal

# ------------------------------------------------------------ request shapes
# Only the fields the plan uses are sent; the docs accept string-or-list on
# every positive filter.

SENIORITIES = (
    "Intern",
    "Entry",
    "Senior",
    "Manager",
    "Director",
    "VP",
    "Head",
    "C Suite",
    "Owner",
    "Partner",
)

DEPARTMENTS = (
    "Operations",
    "Sales",
    "Information Technology",
    "Education",
    "Engineering",
    "Finance",
    "Medical & Health",
    "Marketing",
    "Human Resources",
    "Design",
    "Consulting",
    "Legal",
)

MAX_LIMIT = 25
DEFAULT_LIMIT = 10


# ------------------------------------------------------------ response shapes

ToolStatus = Literal["ok", "not_found"]


@dataclass(frozen=True)
class FairUse:
    """``metadata.fair_use`` — headroom for the record windows binding this
    call (docs: rolling 5-hour and 1-week windows)."""

    records_remaining_5h: int | None = None
    records_reset_5h: str | None = None
    records_remaining_1w: int | None = None
    records_reset_1w: str | None = None


@dataclass(frozen=True)
class Metadata:
    """``metadata`` — always carries ``fair_use``; ``tokens_*`` appear only
    on token-bound accounts; ``retry_after`` only on Fair Use 429s."""

    fair_use: FairUse | None = None
    tokens_used: int | None = None
    tokens_remaining: int | None = None
    retry_after: int | None = None


@dataclass(frozen=True)
class PersonCompany:
    name: str | None = None
    domain: str | None = None
    industry: str | None = None
    size: str | None = None
    website_url: str | None = None
    linkedin_url: str | None = None


@dataclass(frozen=True)
class Person:
    """One ``search_people`` result (``results.results[]``)."""

    full_name: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    title: str | None = None
    headline: str | None = None
    seniority: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    current_industry: str | None = None
    functional_area: list[str] = field(default_factory=list)
    linkedin_url: str | None = None
    business_email: str | None = None
    business_email_risk_score: str | None = None
    business_email_validated_at: str | None = None
    current_role_start_date: str | None = None
    last_updated_at: str | None = None
    company: PersonCompany | None = None
    score: float | None = None


@dataclass(frozen=True)
class PeopleResponse:
    """``search_people`` body: ``results`` is an OBJECT containing the
    ``results`` list + ``total`` (spec example, checked verbatim)."""

    status: ToolStatus
    people: list[Person]
    total: int | None
    metadata: Metadata | None = None


@dataclass(frozen=True)
class EmailResponse:
    """``linkedin_to_business_email`` / ``search_business_email_by_name``:
    ``results`` is a single object (batch not used — P4b scope).
    ``linkedin_url`` is the profile the name+domain lookup matched."""

    status: ToolStatus
    email: str | None
    risk_score: str | None
    linkedin_url: str | None
    metadata: Metadata | None = None


def _str(value: Any) -> str | None:
    return value if isinstance(value, str) and value else None


def _int(value: Any) -> int | None:
    if isinstance(value, bool):
        return None
    return value if isinstance(value, int) else None


def parse_metadata(raw: Any) -> Metadata | None:
    if not isinstance(raw, dict):
        return None
    fair = raw.get("fair_use")
    return Metadata(
        fair_use=FairUse(
            records_remaining_5h=_int(fair.get("records_remaining_5h")),
            records_reset_5h=_str(fair.get("records_reset_5h")),
            records_remaining_1w=_int(fair.get("records_remaining_1w")),
            records_reset_1w=_str(fair.get("records_reset_1w")),
        )
        if isinstance(fair, dict)
        else None,
        tokens_used=_int(raw.get("tokens_used")),
        tokens_remaining=_int(raw.get("tokens_remaining")),
        retry_after=_int(raw.get("retry_after")),
    )


def parse_person(raw: Any) -> Person:
    if not isinstance(raw, dict):
        return Person()
    company = raw.get("company")
    return Person(
        full_name=_str(raw.get("full_name")),
        first_name=_str(raw.get("first_name")),
        last_name=_str(raw.get("last_name")),
        title=_str(raw.get("title")),
        headline=_str(raw.get("headline")),
        seniority=_str(raw.get("seniority")),
        city=_str(raw.get("city")),
        state=_str(raw.get("state")),
        country=_str(raw.get("country")),
        current_industry=_str(raw.get("current_industry")),
        functional_area=[
            v for v in (raw.get("functional_area") or []) if isinstance(v, str)
        ],
        linkedin_url=_str(raw.get("linkedin_url")),
        business_email=_str(raw.get("business_email")),
        business_email_risk_score=_str(raw.get("business_email_risk_score")),
        business_email_validated_at=_str(raw.get("business_email_validated_at")),
        current_role_start_date=_str(raw.get("current_role_start_date")),
        last_updated_at=_str(raw.get("last_updated_at")),
        company=PersonCompany(
            name=_str(company.get("name")),
            domain=_str(company.get("domain")),
            industry=_str(company.get("industry")),
            size=_str(company.get("size")),
            website_url=_str(company.get("website_url")),
            linkedin_url=_str(company.get("linkedin_url")),
        )
        if isinstance(company, dict)
        else None,
        score=raw.get("_score") if isinstance(raw.get("_score"), (int, float)) else None,
    )


def parse_people_response(body: Any) -> PeopleResponse:
    """Body shape: ``results.results[]`` persons + ``results.total``."""
    results = body.get("results") if isinstance(body, dict) else {}
    people_raw = results.get("results") if isinstance(results, dict) else []
    return PeopleResponse(
        status="not_found" if body.get("status") == "not_found" else "ok",
        people=[parse_person(p) for p in (people_raw or [])],
        total=_int(results.get("total")) if isinstance(results, dict) else None,
        metadata=parse_metadata(body.get("metadata")),
    )


def parse_email_response(body: Any) -> EmailResponse:
    results = body.get("results") if isinstance(body, dict) else {}
    if not isinstance(results, dict):
        results = {}
    return EmailResponse(
        status="not_found" if body.get("status") == "not_found" else "ok",
        email=_str(results.get("email")),
        risk_score=_str(results.get("risk_score")),
        linkedin_url=_str(results.get("linkedin_url")),
        metadata=parse_metadata(body.get("metadata")),
    )
