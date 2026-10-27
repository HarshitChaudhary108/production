"""find_snapshot (§7.2): company-search restricted to the row domain.

Call: ``/search`` ``includeDomains: [domain]``, ``category: company``,
numResults 3. Take the company entity on the first result whose host
passes the entity check; value =
``"{description} · {workforce.total} employees · {city}, {country}"``
with missing parts dropped; all missing → no_data. Provenance
provider_reported.
"""

from typing import Any

from app.modules.enrichment.executors import common
from app.modules.enrichment.executors.base import (
    ColumnConfig,
    ExecContext,
    ExecResult,
    RowSnapshot,
    SourceRef,
)
from app.modules.providers.exa.errors import ExaError
from app.modules.providers.exa.models import build_search_request, user_identifier

ENTITY_SEARCH_KWARGS: dict[str, Any] = {
    "type": "auto",
    "category": "company",
    "num_results": 3,
}


def entity_lookup(
    client: common.SyncClient,
    query: str,
    domain: str,
    ctx: ExecContext,
    records: list[Any],
) -> tuple[Any, Any] | None:
    """Shared pattern for find_snapshot / find_revenue / find_funding
    step 1: company-search restricted to the domain, then the entity
    check. Returns (SearchResult, CompanyEntity) or None."""
    resp = client.search(
        build_search_request(
            query,
            include_domains=[domain],
            user_identifier=user_identifier(ctx.workspace_id),
            **ENTITY_SEARCH_KWARGS,
        ),
        record=records.append,
    )
    return common.first_company_entity(resp.results, domain)


class FindSnapshot:
    provider = "exa"
    EXECUTOR_VERSION = "1"  # plan §8.6: bump when the query shape changes

    def __init__(self, client: common.SyncClient) -> None:
        self._client = client

    def execute(
        self, row: RowSnapshot, column: ColumnConfig, ctx: ExecContext
    ) -> ExecResult:
        if (missing := common.require_inputs(row, ("domain",))) is not None:
            return missing
        domain = row.normalized_domain or ""
        query = str(row.data.get("name") or domain)
        records: list[Any] = []
        try:
            hit = entity_lookup(self._client, query, domain, ctx, records)
        except ExaError as exc:
            return common.exa_error_result(exc, records)
        if hit is None:
            return ExecResult(status="no_data", provider_calls=records)
        result, entity = hit

        hq = entity.headquarters
        location = ", ".join(
            part
            for part in (hq.city if hq else None, hq.country if hq else None)
            if part
        )
        parts = [
            entity.description,
            (f"{entity.workforce.total} employees"
             if entity.workforce and entity.workforce.total else None),
            location or None,
        ]
        value = " · ".join(p for p in parts if p)
        if not value:
            return ExecResult(status="no_data", provider_calls=records)
        return ExecResult(
            status="succeeded",
            value=value,
            provenance="provider_reported",
            sources=[SourceRef(url=result.url or "", title=result.title)],
            provider_calls=records,
        )
