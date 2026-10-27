"""Signal derivation (plan §8.7): persist executor SignalDrafts as rows in the
lazily-created Signals sheet.

Only find_company_news (type "News") and find_funding step 2 (type "Funding")
emit drafts — every other executor returns an empty list and this is a no-op.
Row fields follow the contract Signal shape: companyName, type, detail,
source = host of the cited URL, detectedAt = publishedDate, confidence =
confidenceLabel; freshness/relevance stay null (contract A5). The link to the
company is row.company_row_id (contract companyId).

This module only translates drafts → dicts; all sheet writes go through
sheets.service (the sole writer of sheet tables)."""

from sqlalchemy.orm import Session

from app.modules.enrichment.executors.base import ExecResult
from app.modules.sheets import service as sheets


def emit(s: Session, *, company_row_id: str, result: ExecResult) -> int:
    """Insert the result's signal drafts, deduped by sheets.upsert_signal_rows
    (D4). Returns the number of rows actually inserted."""
    if not result.signals:
        return 0
    company_row = sheets.get_row(s, company_row_id)
    rows = [
        {
            "companyName": company_row.data.get("name"),
            "type": d.type,
            "detail": d.detail,
            "source": d.source_host,
            "detectedAt": d.detected_at,
            "confidence": d.confidence_label,
            "freshness": None,
            "relevance": None,
        }
        for d in result.signals
    ]
    return sheets.upsert_signal_rows(
        s, company_row_id=company_row_id, signals=rows
    )
