"""find_core_values (§7.2): domain-scoped verified synthesis.

Call: ``/search`` ``includeDomains: [domain]``, ``type: auto``,
``numResults: 5``, query = column prompt or catalog description,
outputSchema ``{values: string[]}`` + canonical system prompt.

Entity check applies to the grounding citation URLs — a citation to another
domain is discarded. ≥1 on-domain citation required (verified, §7.1 rule
3); empty values → ``no_data``. Value = values joined ``", "`` (text
column). Provenance ``verified``.
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

CORE_VALUES_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["values"],
    "properties": {
        "values": {"type": "array", "items": {"type": "string"}},
    },
    "additionalProperties": False,
}


class FindCoreValues:
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
        records: list[Any] = []
        try:
            resp = common.output_schema_search(
                self._client,
                common.column_query(column),
                ctx=ctx,
                records=records,
                include_domains=[domain],
                num_results=5,
                output_schema=CORE_VALUES_SCHEMA,
            )
        except ExaError as exc:
            return common.exa_error_result(exc, records)

        grounding = resp.output.grounding if resp.output else []
        content = resp.output.content if resp.output else None
        values = content.get("values") if isinstance(content, dict) else None
        items = [v.strip() for v in values or [] if isinstance(v, str) and v.strip()]
        sources = common.cited_sources(grounding, domain)
        if not items or not sources:
            return ExecResult(
                status="no_data", provenance="verified", provider_calls=records
            )
        confidence = grounding[0].confidence if grounding else None
        return ExecResult(
            status="succeeded",
            value=", ".join(items),
            provenance="verified",
            confidence_label=confidence,
            sources=sources,
            provider_calls=records,
        )
