"""Projects DTOs (HC-1: POST /projects)."""

from datetime import datetime
from typing import Any

from pydantic import Field

from app.modules.research.parser import ResearchPlan
from app.schemas.base import CamelModel


class CreateProjectBody(CamelModel):
    prompt: str
    agent_id: str | None = None
    tool_ids: list[str] = Field(default_factory=list)
    connector_ids: list[str] = Field(default_factory=list)
    enrichments: list[str] = Field(default_factory=list)
    dry_run: bool = False


class ProjectCounts(CamelModel):
    companies: int = 0
    leaders: int = 0
    signals: int = 0
    enriched: int = 0


class ProjectView(CamelModel):
    id: str
    name: str
    status: str
    type: str
    counts: ProjectCounts
    credits_used: int
    last_run_at: datetime | None
    created_at: datetime


def plan_wire(plan: ResearchPlan) -> dict[str, Any]:
    return {
        "query": plan.query,
        "requestedCount": plan.requested_count,
        "countSource": plan.count_source,
        "requestedRaw": plan.requested_raw,
        "capped": plan.capped,
        "maxCount": plan.max_count,
        "columns": [c.model_dump() for c in plan.columns],
    }


def project_wire(
    project: Any, *, companies: int = 0
) -> dict[str, Any]:
    return ProjectView(
        id=project.id,
        name=project.name,
        status=project.status or "Live",
        type=project.type or "GTM Research",
        counts=ProjectCounts(companies=companies),
        credits_used=0,
        last_run_at=project.last_run_at,
        created_at=project.created_at,
    ).model_dump(by_alias=True, mode="json")
