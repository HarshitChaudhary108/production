"""Leader derivation (plan §7.2 find_decision_makers side effect, PG-4):
persist executor ``LeaderDraft``s as rows in the lazily-created Leaders
sheet.

Only find_decision_makers emits drafts — every other executor returns an
empty list and this is a no-op. Row fields follow the N4-answered base
columns (contract Leader fields + linkedinUrl); ``companyDomain`` is
lookup data for find_work_email's name+domain path, not a base column.
The link to the company is ``row.company_row_id`` (contract companyId).

This module only translates drafts -> dicts; all sheet writes go through
sheets.service (the sole writer of sheet tables).
"""

from sqlalchemy.orm import Session

from app.modules.enrichment.executors.base import ExecResult
from app.modules.sheets import service as sheets


def emit(s: Session, *, company_row_id: str, result: ExecResult) -> int:
    """Upsert the result's leader drafts, deduped by
    sheets.upsert_leader_rows (D4). Returns rows inserted."""
    if not result.leaders:
        return 0
    rows = [
        {
            "name": d.name,
            "title": d.title,
            "companyName": d.company_name,
            "linkedinUrl": d.linkedin_url,
            "email": d.email,
            "status": d.status,
            "persona": d.persona,
            "seniority": d.seniority,
            "lastActiveAt": d.last_active_at,
            "companyDomain": d.company_domain,
        }
        for d in result.leaders
    ]
    return sheets.upsert_leader_rows(
        s, company_row_id=company_row_id, leaders=rows
    )
