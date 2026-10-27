"""find_revenue_model (§7.2): AI-inferred synthesis — same shape as
find_gtm_strategy: ``type: deep-lite``, prompt/description query +
``"Company: <name> (<domain>)"``, outputSchema ``{"type": "text"}``.
Provenance ``ai_inferred``; citations stored when present.
"""

from typing import Any

from app.modules.enrichment.executors import common
from app.modules.enrichment.executors.base import (
    ColumnConfig,
    ExecContext,
    ExecResult,
    RowSnapshot,
)
from app.modules.providers.exa.errors import ExaError

TEXT_SCHEMA: dict[str, Any] = {"type": "text"}


class FindRevenueModel:
    provider = "exa"
    EXECUTOR_VERSION = "1"  # plan §8.6: bump when the query shape changes

    def __init__(self, client: common.SyncClient) -> None:
        self._client = client

    def execute(
        self, row: RowSnapshot, column: ColumnConfig, ctx: ExecContext
    ) -> ExecResult:
        if (missing := common.require_inputs(row, ("domain", "name"))) is not None:
            return missing
        domain = row.normalized_domain or ""
        name = str(row.data["name"])
        query = (
            f"{common.column_query(column)}."
            f" {common.company_suffix(name, domain)}"
        )
        records: list[Any] = []
        try:
            resp = common.output_schema_search(
                self._client,
                query,
                ctx=ctx,
                records=records,
                type="deep-lite",
                output_schema=TEXT_SCHEMA,
            )
        except ExaError as exc:
            return common.exa_error_result(exc, records)

        grounding = resp.output.grounding if resp.output else []
        content = resp.output.content if resp.output else None
        text = content.strip() if isinstance(content, str) else ""
        if not text:
            return ExecResult(
                status="no_data",
                provenance="ai_inferred",
                provider_calls=records,
            )
        confidence = grounding[0].confidence if grounding else None
        return ExecResult(
            status="succeeded",
            value=text,
            provenance="ai_inferred",
            confidence_label=confidence,
            sources=common.cited_sources(grounding),
            provider_calls=records,
        )
