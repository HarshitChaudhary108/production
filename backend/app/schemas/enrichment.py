"""Request/response shapes for the enrichment-run endpoints (contract:
POST /enrichments/runs, GET /enrichments/runs/{runId}).

Validation happens in modules.enrichment.service in the mock's order with the
mock's error codes — these are typing aids, not pydantic validators, so a
malformed body still produces the mock-identical error instead of a generic
pydantic 422."""

from typing import Any, TypedDict


class RunColumnSpec(TypedDict, total=False):
    key: str
    label: str
    type: str
    enrichmentId: str
    prompt: str
    params: dict[str, Any]


class RunTarget(TypedDict, total=False):
    sheetId: str
    rowIds: list[str]


class RunRequestBody(TypedDict, total=False):
    target: RunTarget
    columns: list[RunColumnSpec]
    overwriteEdited: bool
    refresh: bool
    estimatedOnly: bool


class CellViewDict(TypedDict, total=False):
    """Contract CellView (api-contract CellView + SA-2 cost field)."""

    rowId: str
    columnKey: str
    enrichmentId: str | None
    status: str
    value: Any
    provenance: str | None
    source: str | None
    sources: list[dict[str, Any]]
    confidence: float | None
    confidenceLabel: str | None
    userEdited: bool
    stale: bool
    fetchedAt: str | None
    cost: int
    error: dict[str, Any] | None


class RunViewDict(TypedDict):
    runId: str
    jobId: str | None
    sheetId: str | None
    columns: list[dict[str, Any]]
    estimatedCredits: int | None
    chargedCredits: int | None
    status: str
    createdAt: str | None
    cells: list[CellViewDict]


class RunCreatedDict(TypedDict):
    runId: str
    jobId: str | None
    estimatedCredits: int
    status: str
