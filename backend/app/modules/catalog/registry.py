"""The canonical enrichment catalog (plan §6) — a typed code registry, NOT a
DB table. Single source of truth for ``GET /enrichments/catalog`` (C1).

- ``cost`` is credits-per-cell **display metadata only** (SA-2; CONFIRM Q2 on
  every price) — no code may read it for charging.
- ``source`` is the real provider (C3): ``exa``, ``moltsets`` or ``user``.
  Never the mock's fake badges (crunchbase / builtwith / linkedin).
- ``status``: ``live`` items are always served; ``gated`` items are served
  only when ``settings.<gate_flag>`` is true (all flags default off — §5.3).
- ``executor_id`` names the executor that will own this entry (P4a/P4b).
  Resolution is lazy via :func:`resolve_executor`; nothing here imports an
  executor module, so missing executors cannot break this import.
- Excluded items (``website_intent``, ``add_to_hubspot``) are not entries at
  all — they cannot appear in any configuration.

``requires_inputs`` lists the row fields the executor requires (§7.2).
Derivation: domain-restricted entity/outputSchema executors require
``domain``; third-party name searches require ``name``; the deep-lite
template ``"Company: <name> (<domain>)"`` requires both. For
``find_work_email`` the executor accepts *either* ``linkedinUrl`` *or*
``name`` + ``domain`` — the field lists all inputs it consults.
"""

import importlib
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Literal, cast

if TYPE_CHECKING:
    from app.config import Settings
    from app.modules.enrichment.executors.base import Executor

OutputType = Literal["text", "badge", "chips", "link", "email", "people"]
AppliesTo = Literal["companies", "leaders", "any"]
Source = Literal["exa", "moltsets", "user"]
Status = Literal["live", "gated"]


@dataclass(frozen=True)
class CatalogEntry:
    id: str
    name: str
    description: str
    cost: int
    output_type: OutputType
    applies_to: AppliesTo
    source: Source
    status: Status
    gate_flag: str | None
    requires_inputs: tuple[str, ...] = field(default_factory=tuple)
    executor_id: str | None = None

    @property
    def runnable(self) -> bool:
        return self.executor_id is not None


def _e(
    id: str,
    name: str,
    description: str,
    cost: int,
    output_type: OutputType,
    applies_to: AppliesTo,
    source: Source,
    status: Status = "live",
    gate_flag: str | None = None,
    requires_inputs: tuple[str, ...] = (),
    executor: bool = True,
) -> CatalogEntry:
    return CatalogEntry(
        id=id,
        name=name,
        description=description,
        cost=cost,
        output_type=output_type,
        applies_to=applies_to,
        source=source,
        status=status,
        gate_flag=gate_flag,
        requires_inputs=requires_inputs,
        executor_id=id if executor else None,
    )


# plan §6 table, in table order. Prices are CONFIRM Q2 — display only.
CATALOG: tuple[CatalogEntry, ...] = (
    _e(
        "find_company_domain",
        "Find Company Domain",
        "Find the company's domain from their name.",
        2,
        "link",
        "companies",
        "exa",
        requires_inputs=("name",),
    ),
    _e(
        "find_snapshot",
        "Find Company Snapshot",
        "Return a one-line company snapshot.",
        3,
        "text",
        "companies",
        "exa",
        requires_inputs=("domain",),
    ),
    _e(
        "find_funding",
        "Find Company Funding",
        "Find the company's latest funding round.",
        3,
        "badge",
        "companies",
        "exa",
        requires_inputs=("domain",),
    ),
    _e(
        "find_revenue",
        "Find Company Revenue",
        "Find the company's estimated revenue.",
        2,
        "text",
        "companies",
        "exa",
        requires_inputs=("domain",),
    ),
    _e(
        "find_company_news",
        "Find Company News",
        "Find the latest relevant company news.",
        3,
        "text",
        "companies",
        "exa",
        requires_inputs=("name", "domain"),
    ),
    _e(
        "find_job_openings",
        "Find Job Openings",
        "Find current GTM job openings.",
        3,
        "text",
        "companies",
        "exa",
        status="gated",
        gate_flag="gate_g4_job_openings",
        requires_inputs=("domain",),
    ),
    _e(
        "find_social_profiles",
        "Find Social Profiles",
        "Find the company's social accounts.",
        2,
        "chips",
        "companies",
        "exa",
        requires_inputs=("domain",),
    ),
    _e(
        "find_core_values",
        "Find Core Values",
        "Find the company's stated core values.",
        3,
        "text",
        "companies",
        "exa",
        requires_inputs=("domain",),
    ),
    _e(
        "find_free_trial",
        "Find Free Trial",
        "Check whether a free trial or freemium tier exists.",
        2,
        "badge",
        "companies",
        "exa",
        requires_inputs=("domain",),
    ),
    _e(
        "find_pricing",
        "Find Pricing",
        "Find the company's published pricing.",
        3,
        "text",
        "companies",
        "exa",
        requires_inputs=("domain",),
    ),
    _e(
        "find_gtm_strategy",
        "Find GTM Strategy",
        "Analyze the company's go-to-market motion.",
        5,
        "text",
        "companies",
        "exa",
        requires_inputs=("name", "domain"),
    ),
    _e(
        "find_revenue_model",
        "Determine Company Revenue Model",
        "Identify the company's revenue model — subscription, usage or services.",
        3,
        "text",
        "companies",
        "exa",
        requires_inputs=("name", "domain"),
    ),
    _e(
        "find_product_categories",
        "Find Product Categories",
        "Classify the product into GTM categories.",
        2,
        "chips",
        "companies",
        "exa",
        requires_inputs=("name", "domain"),
    ),
    _e(
        "classify_b2b_b2c",
        "Classify as B2B or B2C",
        "Determine if the company sells B2B, B2C or both.",
        2,
        "badge",
        "companies",
        "exa",
        requires_inputs=("name", "domain"),
    ),
    _e(
        "find_competitors",
        "Find Competitors",
        "Find three competitors for the company.",
        2,
        "chips",
        "companies",
        "exa",
        requires_inputs=("name", "domain"),
    ),
    _e(
        "find_leadership_changes",
        "Find Recent Leadership Changes",
        "Find leadership hires and departures in the last 90 days.",
        4,
        "text",
        "companies",
        "exa",
        requires_inputs=("name", "domain"),
    ),
    _e(
        "find_tech_stack",
        "Find Website Tech Stack",
        "Identify technologies the company runs on.",
        6,
        "chips",
        "companies",
        "exa",
        status="gated",
        gate_flag="gate_tech_stack_label",
        requires_inputs=("name", "domain"),
    ),
    _e(
        "find_linkedin_highlights",
        "Find LinkedIn Profile Highlights",
        "Extract noteworthy details from the company profile.",
        4,
        "text",
        "companies",
        "exa",
        status="gated",
        gate_flag="gate_g2_linkedin",
        requires_inputs=("name",),
    ),
    _e(
        "find_decision_makers",
        "Find Decision Makers",
        "Find the buying committee at each company.",
        20,
        "people",
        "companies",
        "moltsets",
        status="gated",
        gate_flag="gate_g3_moltsets",
        requires_inputs=("domain",),
    ),
    _e(
        "find_work_email",
        "Work Email",
        "Find the person's work email address.",
        3,
        "email",
        "leaders",
        "moltsets",
        status="gated",
        gate_flag="gate_g3_moltsets",
        requires_inputs=("linkedinUrl", "name", "domain"),
    ),
    _e(
        "custom_prompt",
        "AI column (your prompt)",
        "Answer a custom prompt for each company row.",
        3,
        "text",
        "companies",
        "exa",
        requires_inputs=("name", "domain"),
    ),
    _e(
        "plain_value",
        "Value",
        "Plain text column you can fill in yourself.",
        0,
        "text",
        "any",
        "user",
        executor=False,
    ),
)

CATALOG_BY_ID: dict[str, CatalogEntry] = {e.id: e for e in CATALOG}

_ids = [e.id for e in CATALOG]
assert len(_ids) == len(set(_ids)), "duplicate catalog ids"
assert all(e.status == "live" or e.gate_flag for e in CATALOG), (
    "every gated entry needs a gate flag"
)


def visible_catalog(settings: "Settings") -> list[CatalogEntry]:
    """Entries served by ``GET /enrichments/catalog``: every live item plus
    each gated item whose gate flag is on in config."""
    return [
        e
        for e in CATALOG
        if e.status == "live"
        or (e.gate_flag is not None and getattr(settings, e.gate_flag, False))
    ]


def get_entry(enrichment_id: str) -> CatalogEntry:
    try:
        return CATALOG_BY_ID[enrichment_id]
    except KeyError:
        raise KeyError(f"unknown enrichment id {enrichment_id!r}") from None


def resolve_executor(entry: CatalogEntry) -> Callable[..., "Executor"]:
    """Lazily resolve an entry's executor. Executors arrive in P4a/P4b; until
    then this raises LookupError — importing this module never fails.

    The resolved attribute is the executor CLASS (the callable takes the
    sync provider client); the worker instantiates it per job."""
    if entry.executor_id is None:
        raise LookupError(f"{entry.id} has no executor")
    executors = importlib.import_module("app.modules.enrichment.executors")
    executor = getattr(executors, entry.executor_id, None)
    if executor is None:
        raise LookupError(
            f"executor for {entry.id!r} is not built yet (P4a/P4b)"
        )
    return cast("Callable[..., Executor]", executor)
