"""find_revenue (§7.2): same domain-restricted entity lookup as
find_snapshot; value ``financials.revenueAnnual`` formatted
``"$28M (estimated)"``; null → no_data. Provenance ``estimated``.
Never issues an outputSchema call — no model fallback.
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
from app.modules.enrichment.executors.find_snapshot import entity_lookup
from app.modules.providers.exa.errors import ExaError


class FindRevenue:
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

        revenue = entity.financials.revenue_annual if entity.financials else None
        if revenue is None:
            return ExecResult(status="no_data", provider_calls=records)
        return ExecResult(
            status="succeeded",
            value=f"{common.format_usd_short(revenue)} (estimated)",
            provenance="estimated",
            sources=[SourceRef(url=result.url or "", title=result.title)],
            provider_calls=records,
        )
