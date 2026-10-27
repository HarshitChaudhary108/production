"""Executor contract (plan §7.1): the only interface the worker knows.

    execute(row: RowSnapshot, column: ColumnConfig, ctx: ExecContext) -> ExecResult

Executors are synchronous: the DB stack is sync and provider clients use
httpx; any retry/backoff (§8.8) happens inside execute(). ``provider`` is the
rate-limiter key used by the worker.
"""

from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any, Literal, Protocol

if TYPE_CHECKING:
    from app.config import Settings

ExecStatus = Literal["succeeded", "no_data", "failed"]
ConfidenceLabel = Literal["low", "medium", "high"]

# Plan §8.5 provenance classes (kept as plain str; no seventh class exists).
Provenance = Literal[
    "verified",
    "provider_reported",
    "estimated",
    "ai_inferred",
    "conflicting",
    "not_found",
]


@dataclass(frozen=True)
class SourceRef:
    url: str | None
    title: str | None


@dataclass(frozen=True)
class ProviderCallRecord:
    """One provider call for observability (provider_calls row). Fields map to
    plan §7.1 providerCalls entries: {provider, endpoint, costDollars|tokens,
    requestId, ms} plus the HTTP status_code the table also stores."""

    provider: str
    endpoint: str
    status_code: int | None = None
    request_id: str | None = None
    cost_dollars: float | None = None
    tokens: int | None = None
    ms: int | None = None
    # P4b: Fair Use records the call consumed (MoltSets). ``reservation_id``
    # points at the provider_calls row the claim-time reservation wrote —
    # complete_item UPDATES it instead of inserting a duplicate.
    records_returned: int | None = None
    reservation_id: str | None = None


@dataclass(frozen=True)
class ExecError:
    code: str
    message: str


@dataclass(frozen=True)
class SignalDraft:
    """One row for the derived Signals sheet (plan §8.7, PG-9). Emitted by
    find_funding step 2 (``type="Funding"``) and find_company_news
    (``type="News"``); empty for every other executor."""

    type: str
    detail: str | None = None
    source_host: str | None = None
    detected_at: str | None = None
    confidence_label: ConfidenceLabel | str | None = None


@dataclass(frozen=True)
class LeaderDraft:
    """One row for the derived Leaders sheet (plan §7.2 find_decision_makers
    side effect, PG-4/N4). Field names match the Leaders base columns;
    ``company_domain`` is lookup data for find_work_email's name+domain
    path, not a base column. Dedupe key per D4: LinkedIn URL, else
    normalized name + company row."""

    name: str | None = None
    title: str | None = None
    company_name: str | None = None
    linkedin_url: str | None = None
    email: str | None = None
    status: str | None = None
    persona: str | None = None
    seniority: str | None = None
    last_active_at: str | None = None
    company_domain: str | None = None


@dataclass(frozen=True)
class ExecResult:
    status: ExecStatus
    value: Any = None
    provenance: Provenance | str | None = None
    confidence_label: ConfidenceLabel | str | None = None
    sources: list[SourceRef] = field(default_factory=list)
    provider_calls: list[ProviderCallRecord] = field(default_factory=list)
    signals: list[SignalDraft] = field(default_factory=list)
    leaders: list[LeaderDraft] = field(default_factory=list)
    error: ExecError | None = None


@dataclass(frozen=True)
class RowSnapshot:
    id: str
    data: dict[str, Any]
    normalized_domain: str | None


@dataclass(frozen=True)
class ColumnConfig:
    id: str
    key: str
    label: str
    type: str
    enrichment_id: str | None
    prompt: str | None
    params: dict[str, Any] | None


@dataclass(frozen=True)
class ExecContext:
    job_id: str
    workspace_id: str
    run_id: str | None
    settings: "Settings"


class Executor(Protocol):
    """One executor per catalog enrichment id (§6/§7.2). The worker looks the
    executor up by the item's enrichmentId and calls execute() once per cell."""

    provider: str  # rate-limiter key ("exa" | "moltsets" | "fake" | …)

    def execute(
        self, row: RowSnapshot, column: ColumnConfig, ctx: ExecContext
    ) -> ExecResult: ...
