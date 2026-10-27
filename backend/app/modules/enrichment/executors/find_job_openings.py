"""find_job_openings (§7.2, GATED G4): domain-scoped verified synthesis.

Call: ``/search`` ``includeDomains: [domain]``, ``type: auto``, query
``"careers open positions"``, outputSchema
``{openRoleCount: number|null, gtmRoles: string[]}``.

Value = ``"{n} open roles; GTM: {roles}"`` with missing parts dropped
(roles joined ``", "``). Both parts empty → ``no_data``. ≥1 on-domain
citation required (verified, §7.1 rule 3); entity check applies to
citation URLs. Known limitation (§7.2): job boards on other domains are
not covered — gate G4.
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

JOB_OPENINGS_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["openRoleCount", "gtmRoles"],
    "properties": {
        "openRoleCount": {"type": ["number", "null"]},
        "gtmRoles": {"type": "array", "items": {"type": "string"}},
    },
    "additionalProperties": False,
}


class FindJobOpenings:
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
                "careers open positions",
                ctx=ctx,
                records=records,
                include_domains=[domain],
                output_schema=JOB_OPENINGS_SCHEMA,
            )
        except ExaError as exc:
            return common.exa_error_result(exc, records)

        grounding = resp.output.grounding if resp.output else []
        content = resp.output.content if resp.output else None
        count = (
            content.get("openRoleCount") if isinstance(content, dict) else None
        )
        roles = content.get("gtmRoles") if isinstance(content, dict) else None
        role_items = [
            r.strip() for r in roles or [] if isinstance(r, str) and r.strip()
        ]
        parts = []
        if count is not None:
            parts.append(f"{count:g} open roles")
        if role_items:
            parts.append(f"GTM: {', '.join(role_items)}")
        sources = common.cited_sources(grounding, domain)
        if not parts or not sources:
            return ExecResult(
                status="no_data", provenance="verified", provider_calls=records
            )
        confidence = grounding[0].confidence if grounding else None
        return ExecResult(
            status="succeeded",
            value="; ".join(parts),
            provenance="verified",
            confidence_label=confidence,
            sources=sources,
            provider_calls=records,
        )
