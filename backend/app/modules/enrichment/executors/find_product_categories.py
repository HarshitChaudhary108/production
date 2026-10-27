"""find_product_categories (§7.2): AI-inferred chips synthesis.

Call: ``/search`` ``type: deep-lite``, query = column prompt or catalog
description + ``"Company: <name> (<domain>)"``, outputSchema
``{categories: string[]}``.

Value = the categories list (chips). Provenance ``ai_inferred``;
citations stored when present. Empty → ``no_data``.
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

CATEGORIES_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["categories"],
    "properties": {
        "categories": {"type": "array", "items": {"type": "string"}},
    },
    "additionalProperties": False,
}


class FindProductCategories:
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
                output_schema=CATEGORIES_SCHEMA,
            )
        except ExaError as exc:
            return common.exa_error_result(exc, records)

        grounding = resp.output.grounding if resp.output else []
        content = resp.output.content if resp.output else None
        categories = (
            content.get("categories") if isinstance(content, dict) else None
        )
        items = [
            c.strip() for c in categories or [] if isinstance(c, str) and c.strip()
        ]
        if not items:
            return ExecResult(
                status="no_data",
                provenance="ai_inferred",
                provider_calls=records,
            )
        confidence = grounding[0].confidence if grounding else None
        return ExecResult(
            status="succeeded",
            value=items,
            provenance="ai_inferred",
            confidence_label=confidence,
            sources=common.cited_sources(grounding),
            provider_calls=records,
        )
