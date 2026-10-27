"""find_pricing (§7.2): domain-scoped verified synthesis.

Call: ``/search`` ``includeDomains: [domain]``, ``type: auto``,
``numResults: 5``, query = column prompt or catalog description,
outputSchema ``{pricingPublished, startingPrice, pricingModel}``.

``pricingPublished == null`` → ``no_data``; ``false`` →
``"Pricing not published"`` (the UI's label, cited); ``true`` →
``"{startingPrice} · {pricingModel}"`` dropping missing parts
(``"Pricing published"`` when both are null). ≥1 on-domain citation
required (verified, §7.1 rule 3); entity check applies to citation URLs.
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

PRICING_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["pricingPublished", "startingPrice", "pricingModel"],
    "properties": {
        "pricingPublished": {"type": ["boolean", "null"]},
        "startingPrice": {"type": ["string", "null"]},
        "pricingModel": {"type": ["string", "null"]},
    },
    "additionalProperties": False,
}


class FindPricing:
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
                output_schema=PRICING_SCHEMA,
            )
        except ExaError as exc:
            return common.exa_error_result(exc, records)

        grounding = resp.output.grounding if resp.output else []
        content = resp.output.content if resp.output else None
        if not isinstance(content, dict):
            content = {}
        published = content.get("pricingPublished")
        if published is None:
            return ExecResult(
                status="no_data", provenance="verified", provider_calls=records
            )
        sources = common.cited_sources(grounding, domain)
        if not sources:
            return ExecResult(
                status="no_data", provenance="verified", provider_calls=records
            )
        if not published:
            value = "Pricing not published"
        else:
            details = " · ".join(
                p
                for p in (content.get("startingPrice"), content.get("pricingModel"))
                if p
            )
            value = details or "Pricing published"
        confidence = grounding[0].confidence if grounding else None
        return ExecResult(
            status="succeeded",
            value=value,
            provenance="verified",
            confidence_label=confidence,
            sources=sources,
            provider_calls=records,
        )
