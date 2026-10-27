"""find_decision_makers (§7.2, G3-gated): MoltSets ``search_people``.

Request: ``company_domain: [domain]``, ``seniority`` default
``["C Suite","VP","Head","Director","Owner"]``, optional ``department`` /
``title`` from column params, ``limit`` default 10 capped at 25,
``offset`` default 0 — only documented request fields are sent.

Value (people): ``[{name, title, linkedinUrl, seniority}]`` — the UI
derives ``"{first} + {n-1} more"`` from the list. Provenance
``provider_reported``. Side effect: one ``LeaderDraft`` per returned
person — the completion transaction upserts them into the project's
Leaders sheet (``company_row_id`` link, D4 dedupe).

``search_people`` already returns ``business_email`` when present — it
is provider-returned data, stored on the leader row as ``email`` with
``status "Verified"`` (provider-reported, never constructed).
"""

from typing import Any

from app.modules.enrichment.executors import common
from app.modules.enrichment.executors.base import (
    ColumnConfig,
    ExecContext,
    ExecError,
    ExecResult,
    LeaderDraft,
    RowSnapshot,
    SourceRef,
)
from app.modules.providers.moltsets.client import SyncMoltSetsClient
from app.modules.providers.moltsets.errors import (
    MoltSetsError,
    MoltSetsRateLimited,
    MoltSetsUnavailable,
)

DEFAULT_SENIORITY = ["C Suite", "VP", "Head", "Director", "Owner"]


class FindDecisionMakers:
    provider = "moltsets"
    EXECUTOR_VERSION = "1"  # plan §8.6: bump when the query shape changes

    def __init__(self, client: SyncMoltSetsClient) -> None:
        self._client = client

    def execute(
        self, row: RowSnapshot, column: ColumnConfig, ctx: ExecContext
    ) -> ExecResult:
        if (missing := common.require_inputs(row, ("domain",))) is not None:
            return missing
        domain = row.normalized_domain or ""
        params = column.params or {}
        seniority = params.get("seniority") or DEFAULT_SENIORITY
        department = params.get("department")
        title = params.get("title")
        try:
            limit = min(max(1, int(params.get("limit", 10))), 25)
        except (TypeError, ValueError):
            limit = 10
        try:
            offset = max(0, int(params.get("offset", 0)))
        except (TypeError, ValueError):
            offset = 0

        records: list[Any] = []
        try:
            resp = self._client.search_people(
                company_domain=[domain],
                seniority=seniority,
                department=department,
                title=title,
                limit=limit,
                offset=offset,
                record=records.append,
            )
        except MoltSetsRateLimited:
            raise  # not a cell outcome — the worker defers the item
        except MoltSetsUnavailable as exc:
            return ExecResult(
                status="failed",
                error=ExecError(code="provider_unavailable", message=exc.message),
                provider_calls=records,
            )
        except MoltSetsError as exc:
            return ExecResult(
                status="failed",
                error=ExecError(code=exc.code, message=exc.message),
                provider_calls=records,
            )

        if resp.status == "not_found" or not resp.people:
            return ExecResult(
                status="no_data",
                provenance="provider_reported",
                provider_calls=records,
            )

        value: list[dict[str, Any]] = []
        leaders: list[LeaderDraft] = []
        sources: list[SourceRef] = []
        for person in resp.people:
            value.append(
                {
                    "name": person.full_name,
                    "title": person.title,
                    "linkedinUrl": person.linkedin_url,
                    "seniority": person.seniority,
                }
            )
            company = person.company
            leaders.append(
                LeaderDraft(
                    name=person.full_name,
                    title=person.title,
                    company_name=(company.name if company else None)
                    or row.data.get("name"),
                    linkedin_url=person.linkedin_url,
                    email=person.business_email,
                    status="Verified" if person.business_email else None,
                    persona=None,
                    seniority=person.seniority,
                    last_active_at=person.last_updated_at,
                    company_domain=(company.domain if company else None)
                    or domain,
                )
            )
            if person.linkedin_url:
                sources.append(
                    SourceRef(url=person.linkedin_url, title=person.full_name)
                )
        return ExecResult(
            status="succeeded",
            value=value,
            provenance="provider_reported",
            sources=sources,
            provider_calls=records,
            leaders=leaders,
        )
