"""find_company_news (§7.2): third-party news search.

Call: ``/search`` ``category: news``, ``type: auto``, ``query: "<name>"``,
``numResults: 10``, ``startPublishedDate = now - news_lookback_days``,
``contents.highlights: true``.

This is an explicitly third-party search: the §7.1 rule 2 host==domain
entity check does NOT apply. Instead a result is kept only when the company
name (normalized — "Acme, Inc." matches "Acme …") or the domain appears in
its title or highlights (word-boundary match, not bare substring, so
"tacme" does not keep a result for "Acme").

Value = newest kept item ``"{title} ({publishedDate})"``; ``sources`` = that
URL; provenance ``verified``. Emits one ``SignalDraft(type="News")`` whose
``source_host`` is the cited URL's host and ``detected_at`` the item's
publishedDate (§8.7). Nothing kept → ``no_data`` with no signals.

Required inputs: ``domain`` and ``name`` — missing either fails with
``missing_input`` before any provider call.
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
    SignalDraft,
    SourceRef,
)
from app.modules.providers.exa.errors import ExaError
from app.modules.providers.exa.models import (
    SearchResult,
    build_search_request,
    user_identifier,
)


def _needles(name: str, domain: str, ctx: ExecContext) -> list[str]:
    """Lowercase match needles: normalized company name (fall back to the raw
    name when normalization strips everything) plus the row domain."""
    normalized = common.normalize_name(
        name, ctx.settings.company_legal_suffixes
    )
    return [n for n in {normalized or name.strip().lower(), domain.lower()} if n]


def _mentions(result: SearchResult, needles: list[str]) -> bool:
    haystack = " ".join([result.title or "", *result.highlights]).lower()
    return any(
        re.search(rf"(?<!\w){re.escape(n)}(?!\w)", haystack) for n in needles
    )


class FindCompanyNews:
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
        since = common.now_utc() - timedelta(days=ctx.settings.news_lookback_days)
        try:
            resp = self._client.search(
                build_search_request(
                    name,
                    type="auto",
                    category="news",
                    num_results=10,
                    start_published_date=common.iso_z(since),
                    contents={"highlights": True},
                    user_identifier=user_identifier(ctx.workspace_id),
                ),
                record=records.append,
            )
        except ExaError as exc:
            return common.exa_error_result(exc, records)

        needles = _needles(name, domain, ctx)
        kept = [r for r in resp.results if _mentions(r, needles)]
        if not kept:
            return ExecResult(status="no_data", provider_calls=records)
        newest = max(kept, key=lambda r: r.published_date or "")
        title = newest.title or newest.url or "Untitled"
        value = (
            f"{title} ({newest.published_date})"
            if newest.published_date
            else title
        )
        return ExecResult(
            status="succeeded",
            value=value,
            provenance="verified",
            sources=[SourceRef(url=newest.url or "", title=newest.title)],
            provider_calls=records,
            signals=[
                SignalDraft(
                    type="News",
                    detail=value,
                    source_host=common.url_host(newest.url),
                    detected_at=newest.published_date,
                )
            ],
        )
