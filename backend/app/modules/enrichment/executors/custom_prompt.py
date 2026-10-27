"""custom_prompt (§7.2): user-prompted AI-inferred synthesis.

Call: ``/search`` ``type: deep-lite``, query
``"<user prompt>. Company: <name> (<domain>)"``, outputSchema
``{"type": "text"}`` + canonical system prompt.

The column's prompt is REQUIRED — a custom_prompt column without one is a
configuration bug, so it fails ``missing_input`` rather than running the
meta catalog description as a query. Prompt text feeds the cache key via
``common.prompt_hash`` (§7.2 / §8.6).

Provenance ``ai_inferred``; citations stored when present. Empty content →
``no_data``.
"""

from typing import Any

from app.modules.enrichment.executors import common
from app.modules.enrichment.executors.base import (
    ColumnConfig,
    ExecContext,
    ExecError,
    ExecResult,
    RowSnapshot,
)
from app.modules.providers.exa.errors import ExaError

TEXT_SCHEMA: dict[str, Any] = {"type": "text"}


class CustomPrompt:
    provider = "exa"
    EXECUTOR_VERSION = "1"  # plan §8.6: bump when the query shape changes

    def __init__(self, client: common.SyncClient) -> None:
        self._client = client

    def execute(
        self, row: RowSnapshot, column: ColumnConfig, ctx: ExecContext
    ) -> ExecResult:
        if (missing := common.require_inputs(row, ("domain", "name"))) is not None:
            return missing
        prompt = (column.prompt or "").strip()
        if not prompt:
            return ExecResult(
                status="failed",
                error=ExecError(
                    code="missing_input",
                    message="required input(s) missing: prompt",
                ),
            )
        domain = row.normalized_domain or ""
        name = str(row.data["name"])
        query = f"{prompt}. {common.company_suffix(name, domain)}"
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
