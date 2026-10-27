"""find_social_profiles (§7.2): links off the company homepage.

Call: ``/contents`` for ``https://{domain}`` with ``extras.links: 100``.
NOT ``/search`` — no query, no outputSchema, no model involved: the value
is a pure filter of the links Exa extracted from the homepage.

Keep a link when its host matches an entry in config ``social_link_filters``
(``linkedin.com/company``, ``x.com``, ``twitter.com``, ``youtube.com``,
``facebook.com``, ``instagram.com``): a bare host entry matches the exact
host (``www.`` stripped); an entry with a path (``linkedin.com/company``)
matches host + path-prefix, so a personal ``linkedin.com/in/…`` profile is
not kept. Value = kept URLs in page order, deduplicated; provenance
``verified``; ``sources`` = the homepage URL. None kept → ``no_data``.

Required input: ``domain``.
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
from app.modules.providers.exa.models import (
    build_contents_request,
    user_identifier,
)

EXTRAS_LINKS = 100


def _matches_filter(link: str, filters: list[str]) -> bool:
    parsed = urlparse(link if "://" in link else f"https://{link}")
    host = (parsed.hostname or "").lower()
    if host.startswith("www."):
        host = host[4:]
    if not host:
        return False
    path = parsed.path.rstrip("/") or "/"
    for f in filters:
        f = f.lower().strip().rstrip("/")
        if "/" in f:
            f_host, _, f_prefix = f.partition("/")
            if host == f_host and (
                path == f"/{f_prefix}" or path.startswith(f"/{f_prefix}/")
            ):
                return True
        elif host == f:
            return True
    return False


class FindSocialProfiles:
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
        homepage = f"https://{domain}"
        records: list[Any] = []
        try:
            resp = self._client.contents(
                build_contents_request(
                    urls=[homepage],
                    extras={"links": EXTRAS_LINKS},
                    user_identifier=user_identifier(ctx.workspace_id),
                ),
                record=records.append,
            )
        except ExaError as exc:
            return common.exa_error_result(exc, records)

        filters = ctx.settings.social_link_filters
        links: list[str] = []
        for r in resp.results:
            for link in (r.extras.links if r.extras else []):
                if (
                    isinstance(link, str)
                    and _matches_filter(link, filters)
                    and link not in links
                ):
                    links.append(link)
        if not links:
            return ExecResult(status="no_data", provider_calls=records)
        title = resp.results[0].title if resp.results else None
        return ExecResult(
            status="succeeded",
            value=links,
            provenance="verified",
            sources=[SourceRef(url=homepage, title=title)],
            provider_calls=records,
        )
