"""find_tech_stack (§7.2, GATED Q6): AI-inferred chips synthesis.

Call: ``/search`` ``type: auto``, query
``"<name> technology stack tools integrations"``, outputSchema
``{technologies: string[]}``.

Value = technologies mentioned in public sources (chips) — Exa CANNOT
detect installed scripts the way the UI's "bw" badge implies; the Q6
label confirmation is pending, so the catalog text stays as P3 wrote it.
Provenance ``ai_inferred``; citations stored when present. Empty →
``no_data``.
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

TECH_STACK_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["technologies"],
    "properties": {
        "technologies": {"type": "array", "items": {"type": "string"}},
    },
    "additionalProperties": False,
}


class FindTechStack:
    provider = "exa"
    EXECUTOR_VERSION = "1"  # plan §8.6: bump when the query shape changes

    def __init__(self, client: common.SyncClient) -> None:
        self._client = client

    def execute(
        self, row: RowSnapshot, column: ColumnConfig, ctx: ExecContext
    ) -> ExecResult:
        if (missing := common.require_inputs(row, ("domain", "name"))) is not None:
            return missing
        name = str(row.data["name"])
        records: list[Any] = []
        try:
            resp = common.output_schema_search(
                self._client,
                f"{name} technology stack tools integrations",
                ctx=ctx,
                records=records,
                type="auto",
                output_schema=TECH_STACK_SCHEMA,
            )
        except ExaError as exc:
            return common.exa_error_result(exc, records)

        grounding = resp.output.grounding if resp.output else []
        content = resp.output.content if resp.output else None
        technologies = (
            content.get("technologies") if isinstance(content, dict) else None
        )
        items = [
            t.strip()
            for t in technologies or []
            if isinstance(t, str) and t.strip()
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
