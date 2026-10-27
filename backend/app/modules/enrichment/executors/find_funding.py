"""find_funding (§7.2): two steps.

Step 1 — same domain-restricted entity lookup; value
``financials.fundingLatestRound`` formatted ``"{name} — {amount}"``
(+ ``" (date)"`` when present). Provenance provider_reported.

Step 2 — only when step 1 is null: ``category: news``, query
``"<name> raises funding round"``, ``startPublishedDate = now - 730d``
(config ``funding_news_lookback_days``), outputSchema
{roundName, amountUsd, announcedDate, leadInvestor} with the canonical
system prompt. Requires ≥1 citation (verified rule) else no_data.
Provenance verified; emits one SignalDraft type "Funding" (§8.7, PG-9).
"""

from datetime import timedelta
from typing import Any

from app.modules.enrichment.executors import common
from app.modules.enrichment.executors.base import (
    ColumnConfig,
    ExecContext,
    ExecResult,
    RowSnapshot,
    SignalDraft,
    SourceRef,
)
from app.modules.enrichment.executors.find_snapshot import entity_lookup
from app.modules.providers.exa.errors import ExaError
from app.modules.providers.exa.models import build_search_request, user_identifier

FUNDING_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["roundName", "amountUsd", "announcedDate", "leadInvestor"],
    "properties": {
        "roundName": {"type": ["string", "null"]},
        "amountUsd": {"type": ["number", "null"]},
        "announcedDate": {"type": ["string", "null"]},
        "leadInvestor": {"type": ["string", "null"]},
    },
    "additionalProperties": False,
}


class FindFunding:
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
        records: list[Any] = []

        # Step 1: provider-reported latest round.
        try:
            hit = entity_lookup(self._client, name, domain, ctx, records)
        except ExaError as exc:
            return common.exa_error_result(exc, records)
        if hit is not None:
            result, entity = hit
            latest = (
                entity.financials.funding_latest_round
                if entity.financials
                else None
            )
            if latest and latest.amount is not None:
                value = (
                    f"{latest.name or 'Round'}"
                    f" — {common.format_usd_short(latest.amount)}"
                )
                if latest.date:
                    value += f" ({latest.date})"
                return ExecResult(
                    status="succeeded",
                    value=value,
                    provenance="provider_reported",
                    sources=[SourceRef(url=result.url or "", title=result.title)],
                    provider_calls=records,
                )

        # Step 2: grounded news search over the lookback window.
        since = common.now_utc() - timedelta(
            days=ctx.settings.funding_news_lookback_days
        )
        try:
            resp = self._client.search(
                build_search_request(
                    f"{name} raises funding round",
                    type="auto",
                    category="news",
                    start_published_date=common.iso_z(since),
                    output_schema=FUNDING_SCHEMA,
                    system_prompt=ctx.settings.exa_system_prompt,
                    user_identifier=user_identifier(ctx.workspace_id),
                ),
                record=records.append,
            )
        except ExaError as exc:
            return common.exa_error_result(exc, records)

        grounding = resp.output.grounding if resp.output else []
        citations = [
            SourceRef(url=c.url or "", title=c.title)
            for g in grounding
            for c in g.citations
            if c.url
        ]
        if not citations:
            return ExecResult(
                status="no_data", provenance="verified", provider_calls=records
            )

        content = resp.output.content if resp.output else None
        if not isinstance(content, dict) or all(
            v is None for v in content.values()
        ):
            return ExecResult(
                status="no_data", provenance="verified", provider_calls=records
            )
        value = f"{content.get('roundName') or 'Funding'}"
        if content.get("amountUsd") is not None:
            value += f" — {common.format_usd_short(content['amountUsd'])}"
        if content.get("leadInvestor"):
            value += f" led by {content['leadInvestor']}"
        if content.get("announcedDate"):
            value += f" ({content['announcedDate']})"
        confidence = grounding[0].confidence if grounding else None
        return ExecResult(
            status="succeeded",
            value=value,
            provenance="verified",
            confidence_label=confidence,
            sources=citations,
            provider_calls=records,
            signals=[
                SignalDraft(
                    type="Funding",
                    detail=value,
                    source_host=common.url_host(citations[0].url),
                    detected_at=common.iso_z(common.now_utc()),
                    confidence_label=confidence,
                )
            ],
        )
