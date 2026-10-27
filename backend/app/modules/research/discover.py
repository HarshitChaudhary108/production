"""HC-1 discover executor: Exa company search -> Target Companies rows.

``execute`` runs outside any DB transaction (provider latency); typed
ExaError subclasses propagate to the worker (P4a.1). ``apply`` runs inside
the P2 completion transaction: it writes rows/cells only through the
sheets service (SA / plan §8.4) and returns the job summary.
"""

from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

from sqlalchemy.orm import Session

from app.modules.enrichment.executors.base import ExecError, ProviderCallRecord
from app.modules.jobs import events
from app.modules.jobs.models import Job, JobItem
from app.modules.projects.models import Project
from app.modules.providers.exa.models import (
    ExaResponse,
    SearchResult,
    build_search_request,
)
from app.modules.sheets import service as sheets
from app.modules.sheets.normalize import normalized_domain


@dataclass
class DiscoverOutcome:
    """What the worker hands to the completion transaction."""

    response: ExaResponse | None
    error: ExecError | None = None
    provider_calls: list[ProviderCallRecord] = field(default_factory=list)


def execute(
    payload: dict[str, Any],
    client: Any,
    records: list[ProviderCallRecord],
) -> ExaResponse:
    """POST /search company discovery. Raises typed ExaError on failure."""
    body = build_search_request(
        str(payload["query"]),
        type="auto",
        category="company",
        num_results=int(payload["requestedCount"]),
        contents={"highlights": True},
    )
    response: ExaResponse = client.search(body, record=records.append)
    return response


def _row_draft(result: SearchResult) -> dict[str, Any] | None:
    """One result -> row data, or None when the URL has no usable host."""
    domain = normalized_domain(result.url)
    if not domain:
        return None
    entity = next(iter(result.company_entities()), None)
    emp = entity.workforce.total if entity and entity.workforce else None
    city, country = None, None
    if entity and entity.headquarters:
        city, country = entity.headquarters.city, entity.headquarters.country
    loc = ", ".join(p for p in (city, country) if p)
    return {
        "company": (entity.name if entity else None) or result.title,
        "domain": domain,
        "emp": emp,
        "loc": loc or None,
        "linkedin": "",
        "industry": "",
    }


def _company_column(s: Session, sheet_id: str) -> Any:
    return sheets.get_column(s, sheet_id, "company")


def fail_project(s: Session, payload: dict[str, Any]) -> None:
    """HC-D4: a failed research job returns the project to Draft."""
    project_id = payload.get("projectId")
    if not project_id:
        return
    project = s.get(Project, project_id)
    if project is not None:
        project.status = "Draft"
        s.flush()


def apply(
    s: Session,
    *,
    item: JobItem,
    job: Job,
    outcome: DiscoverOutcome,
) -> tuple[dict[str, Any], str]:
    """Write discover results inside the completion transaction.

    Returns ``(summary, item_status)``. The caller owns the item status,
    job state and events ordering.
    """
    payload = item.payload or {}
    requested = int(payload["requestedCount"])
    response = outcome.response
    assert response is not None
    returned = len(response.results)
    results = response.results[:requested]  # defensive slice (HC spec)

    drafts: list[tuple[dict[str, Any], SearchResult]] = []
    skipped_no_host = 0
    for result in results:
        draft = _row_draft(result)
        if draft is None:
            skipped_no_host += 1
            continue
        drafts.append((draft, result))
    outcome_rows = sheets.add_base_rows(
        s, payload["sheetId"], (d for d, _ in drafts)
    )
    inserted_rows: list[Any] = outcome_rows["rows"]
    by_domain = {r.normalized_domain: r for r in inserted_rows}
    company_col = _company_column(s, payload["sheetId"])
    for draft, result in drafts:
        row = by_domain.get(normalized_domain(result.url) or "")
        if row is None:
            continue  # duplicate domain — counted, no row written
        sheets.write_enrichment_result(
            s,
            row.id,
            company_col.id,
            status="succeeded",
            value=draft["company"],
            provenance="provider_reported",
            source="exa",
            sources=[{"url": result.url, "title": result.title}],
            cost=0,
        )
    inserted = outcome_rows["inserted"]
    summary = {
        "requested": requested,
        "returnedByProvider": returned,
        "companies": inserted,
        "duplicatesRemoved": outcome_rows["duplicates"],
        "skippedNoHost": skipped_no_host,
        "capped": bool(payload.get("capped", False)),
    }
    job.progress = {"done": inserted, "total": inserted, "unit": "companies"}
    events.append_event(s, job.id, "progress", job.progress)
    step = {
        "key": "discover",
        "label": "Discovering companies",
        "status": "done",
        "meta": f"{inserted} companies",
    }
    job.steps = [step]
    events.append_event(s, job.id, "step", step)
    project = s.get(Project, payload.get("projectId"))
    if project is not None:
        project.status = "Complete"
        project.last_run_at = datetime.now(UTC)
        s.flush()
    return summary, "succeeded" if inserted > 0 else "no_data"
