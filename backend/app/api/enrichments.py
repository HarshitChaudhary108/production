"""Enrichment routes: ``GET /enrichments/catalog`` (P3), plus the P5 run
lifecycle ``POST /enrichments/runs`` and ``GET /enrichments/runs/{runId}``
(plan §9.2 + SA adaptations — no credit check, no ledger writes)."""

from typing import Annotated, Any

from fastapi import APIRouter, Body, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app import idempotency
from app.auth import Principal, get_principal
from app.db import get_session
from app.modules.catalog import registry
from app.modules.enrichment import service as enrichment_service
from app.schemas.catalog import CatalogItem

router = APIRouter()

RUNS_ROUTE = "POST /api/v1/enrichments/runs"


@router.get("/enrichments/catalog")
def list_catalog(request: Request) -> dict[str, list[dict[str, object]]]:
    """{data: [CatalogItem…]} — live items plus gated items whose config
    gate flag is on. No executor/internal fields (A12)."""
    items = [
        CatalogItem(
            id=e.id,
            name=e.name,
            description=e.description,
            cost=e.cost,
            output_type=e.output_type,
            applies_to=e.applies_to,
            source=e.source,
            status=e.status,
            requires_inputs=list(e.requires_inputs),
        ).model_dump(by_alias=True)
        for e in registry.visible_catalog(request.app.state.settings)
    ]
    return {"data": items}


@router.post("/enrichments/runs")
def create_run(
    request: Request,
    body: Annotated[dict[str, Any], Body()],
    s: Annotated[Session, Depends(get_session)],
    principal: Annotated[Principal, Depends(get_principal)],
) -> JSONResponse:
    """202 {runId, jobId, estimatedCredits, status:"queued"}.

    Validation errors come back in the mock's codes/order (see
    enrichment.service). Idempotency-Key honoured (§8.9): a replay returns
    the stored response — same runId/jobId, no second job."""
    key = request.headers.get("idempotency-key")
    if key:
        existing = idempotency.lookup(s, principal.workspace_id, key)
        if existing is not None:
            idempotency.matches(existing, RUNS_ROUTE, body)  # warns on mismatch
            stored = existing.response or {}
            return JSONResponse(
                status_code=int(stored.get("status", 202)),
                content=stored.get("body", {}),
            )
    run, job = enrichment_service.create_run(
        s,
        workspace_id=principal.workspace_id,
        body=body,
        settings=request.app.state.settings,
    )
    response = {
        "runId": run.id,
        "jobId": job.id,
        "estimatedCredits": run.estimated_credits,
        "status": "queued",
    }
    if key:
        idempotency.store(
            s, principal.workspace_id, key, RUNS_ROUTE, body, 202, response
        )
    s.commit()
    return JSONResponse(status_code=202, content=response)


@router.get("/enrichments/runs/{run_id}")
def get_run(
    run_id: str,
    s: Annotated[Session, Depends(get_session)],
    principal: Annotated[Principal, Depends(get_principal)],
) -> dict[str, Any]:
    """The run view: run fields plus every queued cell as a CellView
    (contract + A4/A6/A8). Unknown run -> 404 not_found."""
    return enrichment_service.get_run_view(
        s, workspace_id=principal.workspace_id, run_id=run_id
    )
