"""find_linkedin_highlights (§7.2, GATED G2): verified LinkedIn lookup.

Call: ``/search`` ``includeDomains: ["linkedin.com"]``, ``type: auto``,
query ``"<name> company page"``, ``contents.highlights: true``,
``numResults: 3``. No outputSchema — highlights come straight from results.

Accept only a result whose URL is ``linkedin.com/company/…`` — personal
``/in/…`` profiles and anything else are discarded. Value = up to 3
highlights joined by spaces. No accepted result → ``no_data``. Provenance
``verified``; ``sources`` = the accepted company-page URL.
"""

from typing import Any
from urllib.parse import urlparse

from app.modules.enrichment.executors import common
from app.modules.enrichment.executors.base import (
    ColumnConfig,
    ExecContext,
    ExecResult,
    RowSnapshot,
    SourceRef,
)
from app.modules.providers.exa.errors import ExaError
from app.modules.providers.exa.models import build_search_request, user_identifier

MAX_HIGHLIGHTS = 3


def _is_company_profile(url: str | None) -> bool:
    if not url:
        return False
    host = (common.url_host(url) or "").lower()
    path = urlparse(url).path if "://" in url else urlparse(f"https://{url}").path
    return host in ("linkedin.com", "www.linkedin.com") and path.startswith(
        "/company/"
    )


class FindLinkedinHighlights:
    provider = "exa"
    EXECUTOR_VERSION = "1"  # plan §8.6: bump when the query shape changes

    def __init__(self, client: common.SyncClient) -> None:
        self._client = client

    def execute(
        self, row: RowSnapshot, column: ColumnConfig, ctx: ExecContext
    ) -> ExecResult:
        if (missing := common.require_inputs(row, ("name",))) is not None:
            return missing
        name = str(row.data["name"])
        records: list[Any] = []
        try:
            resp = self._client.search(
                build_search_request(
                    f"{name} company page",
                    type="auto",
                    include_domains=["linkedin.com"],
                    num_results=3,
                    contents={"highlights": True},
                    user_identifier=user_identifier(ctx.workspace_id),
                ),
                record=records.append,
            )
        except ExaError as exc:
            return common.exa_error_result(exc, records)

        for result in resp.results:
            if not _is_company_profile(result.url):
                continue
            highlights = [
                h.strip()
                for h in result.highlights[:MAX_HIGHLIGHTS]
                if isinstance(h, str) and h.strip()
            ]
            if not highlights:
                continue
            return ExecResult(
                status="succeeded",
                value=" ".join(highlights),
                provenance="verified",
                sources=[SourceRef(url=result.url or "", title=result.title)],
                provider_calls=records,
            )
        return ExecResult(
            status="no_data", provenance="verified", provider_calls=records
        )
