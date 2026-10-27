"""POST /projects — Home research composer (HC-1, docs/prompt-hc.md).

dryRun parses and returns the plan with zero writes; a real run stores the
idempotency key, project, sheet, job and one discover item in a single
transaction (P2 insert-first semantics).
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import idempotency
from app.auth import Principal, get_principal
from app.db import get_session
from app.errors import ApiError
from app.modules.core.models import IdempotencyKey
from app.modules.projects import service as projects
from app.modules.research.parser import parse_research_request
from app.schemas.projects import CreateProjectBody, plan_wire, project_wire

router = APIRouter()

_ROUTE = "POST /api/v1/projects"


@router.post("/projects")
def create_project(
    request: Request,
    body: CreateProjectBody,
    s: Annotated[Session, Depends(get_session)],
    principal: Annotated[Principal, Depends(get_principal)],
) -> JSONResponse:
    prompt = body.prompt.strip()
    if not 1 <= len(prompt) <= 2000:
        raise ApiError(
            422,
            "validation_error",
            "prompt must be 1-2000 characters.",
            {"field": "prompt"},
        )
    if body.enrichments:
        raise ApiError(
            422,
            "not_supported",
            "Enrichment chaining is not available for Home research yet.",
            {"reason": "home_enrichment_not_wired"},
        )
    settings = request.app.state.settings
    plan = parse_research_request(prompt, settings)
    if body.dry_run:
        return JSONResponse(content={"plan": plan_wire(plan)})
    key = request.headers.get("idempotency-key")
    if not key:
        raise ApiError(
            422,
            "validation_error",
            "Idempotency-Key header required.",
            {"header": "Idempotency-Key"},
        )
    body_dump = body.model_dump(mode="json", by_alias=True)
    existing = idempotency.lookup(s, principal.workspace_id, key)
    if existing is not None:
        idempotency.matches(existing, _ROUTE, body_dump)  # warns on mismatch
        stored = existing.response or {}
        return JSONResponse(
            status_code=int(stored.get("status", 202)),
            content=stored.get("body", {}),
        )
    rec = IdempotencyKey(
        workspace_id=principal.workspace_id,
        key=key,
        route=_ROUTE,
        request_hash=idempotency.request_hash(body_dump),
    )
    s.add(rec)
    try:
        s.flush()  # insert-first: a concurrent duplicate collides here
    except IntegrityError:
        s.rollback()
        existing = idempotency.lookup(s, principal.workspace_id, key)
        stored = (existing.response or {}) if existing is not None else {}
        if stored:
            return JSONResponse(
                status_code=int(stored.get("status", 202)),
                content=stored.get("body", {}),
            )
        raise
    project, _sheet, job = projects.create_research_project(
        s,
        workspace_id=principal.workspace_id,
        prompt=prompt,
        plan=plan,
        agent_id=body.agent_id,
        tool_ids=body.tool_ids or None,
        connector_ids=body.connector_ids or None,
    )
    response = {
        "project": project_wire(project),
        "jobId": job.id,
        "plan": plan_wire(plan),
    }
    rec.response = {"status": 202, "body": response}
    s.commit()
    return JSONResponse(status_code=202, content=response)
