"""Exa request builders + response models (exa-spec.yaml: /search, /contents).

Builders emit plain dicts ready to JSON-encode and perform the plan's LOCAL
validations (§5.1) before anything hits the wire — a bad combination raises
``ExaRequestError`` instead of costing a 400 round-trip:

- ``type``: only auto | lite | deep-lite | deep (legacy fast/instant/
  deep-reasoning rejected);
- ``category`` company|people reject start/endPublishedDate; people also
  rejects excludeDomains;
- ``numResults`` 1-100; domain lists ≤1,200 entries;
- ``outputSchema`` runs through ``schema_limits.validate_output_schema``;
- ``userIdentifier`` must match ^[A-Za-z0-9_-]{1,64}$.

Deprecated request fields (livecrawl, subpages on /search, includeText,
excludeText, context, startCrawlDate, endCrawlDate) simply have no parameter
here — they can never appear in a built body.
"""

import hashlib
import re
from typing import Any, Literal

from pydantic import ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.modules.providers.exa.errors import ExaRequestError
from app.modules.providers.exa.schema_limits import validate_output_schema
from app.schemas.base import CamelModel

ALLOWED_TYPES = ("auto", "lite", "deep-lite", "deep")
Category = Literal[
    "company", "people", "news", "publication", "personal site",
    "financial report",
]
_NO_DATE_CATEGORIES = ("company", "people")
_USER_ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,64}$")


def user_identifier(workspace_id: str) -> str:
    """§7.1 rule 5: opaque hash of the workspace id; matches the wire pattern
    (sha256 hex is [0-9a-f], 64 chars — inside ^[A-Za-z0-9_-]{1,64}$)."""
    return hashlib.sha256(workspace_id.encode("utf-8")).hexdigest()


def _check_user_identifier(value: str) -> None:
    if not _USER_ID_RE.fullmatch(value):
        raise ExaRequestError("userIdentifier must match ^[A-Za-z0-9_-]{1,64}$")


def _put(body: dict[str, Any], key: str, value: Any) -> None:
    if value is not None:
        body[key] = value


def build_search_request(
    query: str,
    *,
    type: str = "auto",
    category: str | None = None,
    num_results: int | None = None,
    include_domains: list[str] | None = None,
    exclude_domains: list[str] | None = None,
    start_published_date: str | None = None,
    end_published_date: str | None = None,
    contents: dict[str, Any] | None = None,
    output_schema: dict[str, Any] | None = None,
    system_prompt: str | None = None,
    objective: str | None = None,
    user_identifier: str | None = None,
    moderation: bool | None = None,
    stream: bool | None = None,
    additional_queries: list[str] | None = None,
    user_location: Any = None,
    compliance: str | None = None,
) -> dict[str, Any]:
    """Validated POST /search body. Raises ExaRequestError before the wire."""
    if not query:
        raise ExaRequestError("query is required")
    if type not in ALLOWED_TYPES:
        raise ExaRequestError(
            f"search type {type!r} is not allowed; use one of {ALLOWED_TYPES}"
        )
    if category in _NO_DATE_CATEGORIES and (
        start_published_date is not None or end_published_date is not None
    ):
        raise ExaRequestError(
            f"category {category!r} does not support published-date filters"
        )
    if category == "people" and exclude_domains:
        raise ExaRequestError(
            "category 'people' does not support excludeDomains"
        )
    if num_results is not None and not 1 <= num_results <= 100:
        raise ExaRequestError("numResults must be between 1 and 100")
    for name, domains in (
        ("includeDomains", include_domains),
        ("excludeDomains", exclude_domains),
    ):
        if domains is not None and len(domains) > 1200:
            raise ExaRequestError(f"{name} is limited to 1200 entries")
    if output_schema is not None:
        validate_output_schema(output_schema)
    if user_identifier is not None:
        _check_user_identifier(user_identifier)

    body: dict[str, Any] = {"query": query, "type": type}
    _put(body, "category", category)
    _put(body, "numResults", num_results)
    _put(body, "includeDomains", include_domains)
    _put(body, "excludeDomains", exclude_domains)
    _put(body, "startPublishedDate", start_published_date)
    _put(body, "endPublishedDate", end_published_date)
    _put(body, "contents", contents)
    _put(body, "outputSchema", output_schema)
    _put(body, "systemPrompt", system_prompt)
    _put(body, "objective", objective)
    _put(body, "userIdentifier", user_identifier)
    _put(body, "moderation", moderation)
    _put(body, "stream", stream)
    _put(body, "additionalQueries", additional_queries)
    _put(body, "userLocation", user_location)
    _put(body, "compliance", compliance)
    return body


def build_contents_request(
    urls: list[str] | None = None,
    ids: list[str] | None = None,
    *,
    text: Any = None,
    highlights: Any = None,
    summary: Any = None,
    extras: Any = None,
    subpages: int | None = None,
    subpage_target: list[str] | str | None = None,
    max_age_hours: int | None = None,
    user_identifier: str | None = None,
    compliance: str | None = None,
) -> dict[str, Any]:
    """Validated POST /contents body (urls or ids; subpages belong HERE —
    they are deprecated on /search, not on /contents)."""
    if not urls and not ids:
        raise ExaRequestError("contents requires at least one url or id")
    for name, targets in (("urls", urls), ("ids", ids)):
        if targets is not None:
            if not 1 <= len(targets) <= 100:
                raise ExaRequestError(f"{name} is limited to 1-100 entries")
            if any(not 1 <= len(t) <= 2048 for t in targets):
                raise ExaRequestError(f"{name} entries must be 1-2048 chars")
    if user_identifier is not None:
        _check_user_identifier(user_identifier)

    body: dict[str, Any] = {}
    _put(body, "urls", urls)
    _put(body, "ids", ids)
    _put(body, "text", text)
    _put(body, "highlights", highlights)
    _put(body, "summary", summary)
    _put(body, "extras", extras)
    _put(body, "subpages", subpages)
    _put(body, "subpageTarget", subpage_target)
    _put(body, "maxAgeHours", max_age_hours)
    _put(body, "userIdentifier", user_identifier)
    _put(body, "compliance", compliance)
    return body


# --------------------------------------------------------------- responses
# extra="allow": responses round-trip losslessly for recorded fixtures.


class ExaModel(CamelModel):
    model_config = ConfigDict(
        alias_generator=to_camel, populate_by_name=True, extra="allow"
    )


class ExaCitation(ExaModel):
    url: str | None = None
    title: str | None = None


class GroundingEntry(ExaModel):
    field: str
    citations: list[ExaCitation] = Field(default_factory=list)
    confidence: str | None = None  # low | medium | high


class SynthesisOutput(ExaModel):
    """``output`` — present when outputSchema was sent."""

    content: Any = None
    grounding: list[GroundingEntry] = Field(default_factory=list)


class CostDollars(ExaModel):
    total: float | None = None


class ExaWarning(ExaModel):
    """Log it; never feed it to a model (spec §SearchWarningOutput)."""

    code: str | None = None
    path: str | None = None
    message: str | None = None


class ExaNotice(ExaModel):
    code: str | None = None
    path: str | None = None
    message: str | None = None
    details: dict[str, Any] | None = None


class Workforce(ExaModel):
    total: int | None = None


class Headquarters(ExaModel):
    address: str | None = None
    city: str | None = None
    postal_code: str | None = None
    country: str | None = None


class FundingRound(ExaModel):
    name: str | None = None
    date: str | None = None
    amount: float | None = None


class Financials(ExaModel):
    revenue_annual: float | None = None
    funding_total: float | None = None
    funding_latest_round: FundingRound | None = None


class CompanyEntity(ExaModel):
    """``results[].entities[]`` member with ``type: "company"`` (§5.1)."""

    type: str = "company"
    name: str | None = None
    founded_year: int | None = None
    description: str | None = None
    workforce: Workforce | None = None
    headquarters: Headquarters | None = None
    financials: Financials | None = None
    web_traffic: Any = None


class ResultExtras(ExaModel):
    """``results[].extras`` — each field is returned only when the matching
    ``extras`` request option was sent (spec §ContentsResult extras)."""

    links: list[str] = Field(default_factory=list)
    image_links: list[str] = Field(default_factory=list)
    rich_links: list[dict[str, Any]] = Field(default_factory=list)
    code_blocks: list[dict[str, Any]] = Field(default_factory=list)


class SearchResult(ExaModel):
    title: str | None = None
    url: str | None = None
    published_date: str | None = None
    author: str | None = None
    id: str | None = None
    image: str | None = None
    favicon: str | None = None
    text: str | None = None
    highlights: list[str] = Field(default_factory=list)
    highlight_scores: list[float] = Field(default_factory=list)
    summary: str | None = None
    subpages: list[dict[str, Any]] = Field(default_factory=list)
    entities: list[dict[str, Any]] = Field(default_factory=list)
    extras: ResultExtras | None = None

    def company_entities(self) -> list[CompanyEntity]:
        return [
            CompanyEntity.model_validate(e)
            for e in self.entities
            if e.get("type") == "company"
        ]


class ExaResponse(ExaModel):
    """Shared response surface for /search and /contents."""

    request_id: str | None = None
    results: list[SearchResult] = Field(default_factory=list)
    cost_dollars: CostDollars | None = None
    search_time: float | None = None
    warnings: list[ExaWarning] = Field(default_factory=list)
    notices: list[ExaNotice] = Field(default_factory=list)
    output: SynthesisOutput | None = None
    statuses: list[dict[str, Any]] = Field(default_factory=list)  # /contents only
