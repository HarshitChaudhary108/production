"""Research project creation (HC-1, docs/prompt-hc.md; plan §5.1/§9.1).

Creates the project, its Target Companies sheet, and one ``research`` job
with a single ``discover`` item — all inside the caller's transaction.
"""

from typing import Any

from sqlalchemy.orm import Session

from app.ids import new_id
from app.modules.jobs.models import Job, JobItem
from app.modules.projects.models import Project
from app.modules.research.parser import ResearchPlan
from app.modules.sheets import service as sheets

# plan §5.1 / ALL_COLS (src/pages/workspace/model.ts): visible base columns.
_BASE_COLUMNS = [
    ("company", "Company Name", "company"),
    ("domain", "Domain", "link"),
    ("emp", "Employee Count", "text"),
    ("loc", "Location", "text"),
]
# PG-3: present for later phases; hidden and never filled by discover.
_HIDDEN_COLUMNS = [
    ("linkedin", "LinkedIn URL", "linkedin"),
    ("industry", "Industry", "text"),
]

DISCOVER_STEP = {"key": "discover", "label": "Discovering companies"}


def create_research_project(
    s: Session,
    *,
    workspace_id: str,
    prompt: str,
    plan: ResearchPlan,
    agent_id: str | None,
    tool_ids: list[str] | None,
    connector_ids: list[str] | None,
) -> tuple[Project, Any, Job]:  # sheet type stays inside sheets/ (§8.4)
    project = Project(
        id=new_id("prj"),
        workspace_id=workspace_id,
        name=prompt[:60],  # HC-D5
        status="Live",
        type="GTM Research",
        prompt=prompt,
        agent_id=agent_id,
        tool_ids=tool_ids,
        connector_ids=connector_ids,
    )
    s.add(project)
    s.flush()
    sheet = sheets.create_sheet(
        s,
        key="target_companies",
        name="Target Companies",
        kind="companies",
        project_id=project.id,
    )
    for pos, (key, label, type_) in enumerate(_BASE_COLUMNS):
        sheets.add_column(
            s, sheet.id, key=key, label=label, type=type_, is_base=True,
            position=pos,
        )
    for key, label, type_ in _HIDDEN_COLUMNS:
        sheets.add_column(
            s, sheet.id, key=key, label=label, type=type_, is_base=True,
            hidden=True,
        )
    job = Job(
        id=new_id("job"),
        workspace_id=workspace_id,
        type="research",
        status="queued",
        progress={
            "done": 0,
            "total": plan.requested_count,
            "unit": "companies",
        },
        steps=[{**DISCOVER_STEP, "status": "running", "meta": ""}],
        estimated_credits=None,  # HC-D6: research jobs carry no credits
        charged_credits=0,
        parent_ref={"projectId": project.id, "sheetId": sheet.id},
        result={"projectId": project.id, "sheetId": sheet.id},
    )
    s.add(job)
    s.flush()
    s.add(
        JobItem(
            id=new_id("job"),
            job_id=job.id,
            kind="discover",
            status="pending",
            payload={
                "query": plan.query,
                "requestedCount": plan.requested_count,
                "capped": plan.capped,
                "sheetId": sheet.id,
                "projectId": project.id,
            },
        )
    )
    s.flush()
    return project, sheet, job
