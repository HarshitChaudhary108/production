"""find_free_trial (§7.2): domain-scoped verified synthesis.

Call: ``/search`` ``includeDomains: [domain]``, ``type: auto``,
``numResults: 5``, query = column prompt or catalog description,
outputSchema ``{offersFreeTrial: bool|null, trialLength: string|null}``.

``offersFreeTrial == null`` → ``no_data``. ``true`` →
``"Free trial available"`` (+ ``" ({trialLength})"`` when present);
``false`` → ``"No free trial found"`` — but ONLY when ≥1 on-domain
citation grounds the claim; a ``false`` without a citation is ``no_data``,
never "No free trial found" (verified, §7.1 rule 3). Entity check applies
to citation URLs.
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

FREE_TRIAL_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["offersFreeTrial", "trialLength"],
    "properties": {
        "offersFreeTrial": {"type": ["boolean", "null"]},
        "trialLength": {"type": ["string", "null"]},
    },
    "additionalProperties": False,
}


class FindFreeTrial:
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
                output_schema=FREE_TRIAL_SCHEMA,
            )
        except ExaError as exc:
            return common.exa_error_result(exc, records)

        grounding = resp.output.grounding if resp.output else []
        content = resp.output.content if resp.output else None
        if not isinstance(content, dict):
            content = {}
        offers = content.get("offersFreeTrial")
        if offers is None:
            return ExecResult(
                status="no_data", provenance="verified", provider_calls=records
            )
        sources = common.cited_sources(grounding, domain)
        if not sources:
            return ExecResult(
                status="no_data", provenance="verified", provider_calls=records
            )
        if offers:
            value = "Free trial available"
            length = content.get("trialLength")
            if length:
                value += f" ({length})"
        else:
            value = "No free trial found"
        confidence = grounding[0].confidence if grounding else None
        return ExecResult(
            status="succeeded",
            value=value,
            provenance="verified",
            confidence_label=confidence,
            sources=sources,
            provider_calls=records,
        )
