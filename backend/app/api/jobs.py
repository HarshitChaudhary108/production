"""Job routes (contract "Jobs and streaming" + A1/A2):

- ``GET /jobs/:jobId``          -> JobView
- ``GET /jobs/:jobId/events``   -> text/event-stream (persisted replay + live)
- ``POST /jobs/:jobId/pause|resume|cancel`` -> 409 invalid_state when N/A.
"""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.auth import Principal, get_principal
from app.db import get_session
from app.modules.jobs import service, sse

router = APIRouter()


def _last_event_id(request: Request) -> int:
    raw = request.headers.get("last-event-id") or request.query_params.get(
        "lastEventId"
    )
    try:
        return int(raw) if raw is not None else -1
    except ValueError:
        return -1


@router.get("/jobs/{job_id}")
def get_job(
    job_id: str,
    s: Annotated[Session, Depends(get_session)],
    principal: Annotated[Principal, Depends(get_principal)],
) -> dict[str, Any]:
    return service.job_view(service.get_job(s, principal.workspace_id, job_id))


@router.get("/jobs/{job_id}/events")
async def job_events(
    job_id: str,
    request: Request,
    s: Annotated[Session, Depends(get_session)],
    principal: Annotated[Principal, Depends(get_principal)],
) -> StreamingResponse:
    service.get_job(s, principal.workspace_id, job_id)  # 404 check
    settings = request.app.state.settings
    stream = sse.job_event_stream(
        request,
        session_factory=request.app.state.session_factory,
        database_url=settings.database_url,
        job_id=job_id,
        last_seq=_last_event_id(request),
        heartbeat_s=settings.sse_heartbeat_seconds,
        retry_ms=settings.sse_retry_ms,
    )
    return StreamingResponse(
        stream,
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@router.post("/jobs/{job_id}/pause")
def pause_job(
    job_id: str,
    s: Annotated[Session, Depends(get_session)],
    principal: Annotated[Principal, Depends(get_principal)],
) -> dict[str, Any]:
    job = service.pause_job(s, principal.workspace_id, job_id)
    s.commit()
    return service.job_view(job)


@router.post("/jobs/{job_id}/resume")
def resume_job(
    job_id: str,
    s: Annotated[Session, Depends(get_session)],
    principal: Annotated[Principal, Depends(get_principal)],
) -> dict[str, Any]:
    job = service.resume_job(s, principal.workspace_id, job_id)
    s.commit()
    return service.job_view(job)


@router.post("/jobs/{job_id}/cancel")
def cancel_job(
    job_id: str,
    s: Annotated[Session, Depends(get_session)],
    principal: Annotated[Principal, Depends(get_principal)],
) -> dict[str, Any]:
    job = service.cancel_job(s, principal.workspace_id, job_id)
    s.commit()
    return service.job_view(job)
