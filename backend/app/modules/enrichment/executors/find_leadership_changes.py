"""find_leadership_changes (§7.2): third-party grounded news search.

Call: ``/search`` ``category: news``, query
``"<name> appoints OR hires OR joins as chief OR VP OR head"``,
``startPublishedDate = now - leadership_lookback_days``, outputSchema
``LEADERSHIP_SCHEMA`` ({changes: [{person, role, type, date}]}) with the
canonical system prompt. The host==domain entity check does NOT apply
(explicitly a third-party search).

Citations are required (verified rule, §7.1 rule 3): each change is kept
only when ``output.grounding`` cites its index — Exa grounds fields as
``changes[<i>].<prop>`` (a bare ``changes`` field grounds every item). A
change without a citation is dropped; nothing kept → ``no_data``.

Value: ``"New {role}: {person} ({date})"`` per hire, ``"Departed …"`` per
departure (the plan templates only the hire form — engineering mirror for
departures), joined by ``"; "``. Changes missing person or role are
dropped.

Required inputs: ``domain`` and ``name``.
"""

import re
from datetime import timedelta
from typing import Any

from app.modules.enrichment.executors import common
from app.modules.enrichment.executors.base import (
    ColumnConfig,
    ExecContext,
    ExecResult,
    RowSnapshot,
    SourceRef,
)
from app.modules.providers.exa.errors import ExaError
from app.modules.providers.exa.models import (
    ExaCitation,
    GroundingEntry,
    build_search_request,
    user_identifier,
)

LEADERSHIP_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["changes"],
    "properties": {
        "changes": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["person", "role", "type", "date"],
                "properties": {
                    "person": {"type": ["string", "null"]},
                    "role": {"type": ["string", "null"]},
                    "type": {
                        "type": ["string", "null"],
                        "enum": ["hire", "departure", None],
                    },
                    "date": {"type": ["string", "null"]},
                },
                "additionalProperties": False,
            },
        },
    },
    "additionalProperties": False,
}

# Exa grounding fields: "changes" (whole array) or "changes[<i>]" /
# "changes[<i>].<prop>" (one item). Anything else is ignored.
_CHANGES_FIELD_RE = re.compile(r"^changes(?:\[(\d+)\])?(?:\..*)?$")


def _cited_changes(
    grounding: list[GroundingEntry],
) -> tuple[dict[int, list[ExaCitation]], list[ExaCitation]]:
    """Split grounding citations into (per-index, whole-array) buckets."""
    by_index: dict[int, list[ExaCitation]] = {}
    whole: list[ExaCitation] = []
    for g in grounding:
        m = _CHANGES_FIELD_RE.match(g.field or "")
        if not m:
            continue
        if m.group(1) is None:
            whole.extend(g.citations)
        else:
            by_index.setdefault(int(m.group(1)), []).extend(g.citations)
    return by_index, whole


class FindLeadershipChanges:
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
        since = common.now_utc() - timedelta(
            days=ctx.settings.leadership_lookback_days
        )
        try:
            resp = self._client.search(
                build_search_request(
                    f"{name} appoints OR hires OR joins as chief OR VP OR head",
                    type="auto",
                    category="news",
                    start_published_date=common.iso_z(since),
                    output_schema=LEADERSHIP_SCHEMA,
                    system_prompt=ctx.settings.exa_system_prompt,
                    user_identifier=user_identifier(ctx.workspace_id),
                ),
                record=records.append,
            )
        except ExaError as exc:
            return common.exa_error_result(exc, records)

        grounding = resp.output.grounding if resp.output else []
        content = resp.output.content if resp.output else None
        changes = content.get("changes") if isinstance(content, dict) else None
        if not isinstance(changes, list) or not changes:
            return ExecResult(
                status="no_data", provenance="verified", provider_calls=records
            )

        by_index, whole = _cited_changes(grounding)
        parts: list[str] = []
        seen_urls: set[str] = set()
        citations: list[SourceRef] = []
        for i, change in enumerate(changes):
            if not isinstance(change, dict):
                continue
            person, role = change.get("person"), change.get("role")
            if not person or not role:
                continue
            found = by_index.get(i, []) + whole
            found = [c for c in found if c.url]
            if not found:
                continue  # change without a citation is dropped
            verb = "Departed" if change.get("type") == "departure" else "New"
            part = f"{verb} {role}: {person}"
            if change.get("date"):
                part += f" ({change['date']})"
            parts.append(part)
            for c in found:
                url = c.url or ""
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    citations.append(SourceRef(url=url, title=c.title))
        if not parts:
            return ExecResult(
                status="no_data", provenance="verified", provider_calls=records
            )
        confidence = grounding[0].confidence if grounding else None
        return ExecResult(
            status="succeeded",
            value="; ".join(parts),
            provenance="verified",
            confidence_label=confidence,
            sources=citations,
            provider_calls=records,
        )
