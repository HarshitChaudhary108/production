"""find_company_domain (§7.2): open company search, no domain restriction.

Call: ``/search`` category ``company``, type ``auto``, query "<name> <loc>",
numResults 5. Candidates are results whose company-entity name matches the
row name after normalization. Exactly one distinct candidate host → its
host; several → no_data/conflicting (candidates in sources); none →
no_data. Provenance provider_reported / conflicting. Missing name →
failed/missing_input with zero provider calls.
"""

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
from app.modules.providers.exa.models import build_search_request, user_identifier


class FindCompanyDomain:
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
        loc = row.data.get("loc") or row.data.get("city") or ""
        records: list[Any] = []
        try:
            resp = self._client.search(
                build_search_request(
                    f"{name} {loc}".strip(),
                    type="auto",
                    category="company",
                    num_results=5,
                    user_identifier=user_identifier(ctx.workspace_id),
                ),
                record=records.append,
            )
        except ExaError as exc:
            return common.exa_error_result(exc, records)

        suffixes = ctx.settings.company_legal_suffixes
        wanted = common.normalize_name(name, suffixes)
        candidates: dict[str, SourceRef] = {}
        for r in resp.results:
            for e in r.company_entities():
                if common.normalize_name(e.name or "", suffixes) == wanted:
                    host = common.url_host(r.url)
                    if host:
                        candidates.setdefault(
                            host, SourceRef(url=r.url or "", title=r.title)
                        )
                    break  # one candidate per result
        if len(candidates) == 1:
            return ExecResult(
                status="succeeded",
                value=next(iter(candidates)),
                provenance="provider_reported",
                sources=list(candidates.values()),
                provider_calls=records,
            )
        return ExecResult(
            status="no_data",
            provenance="conflicting" if candidates else None,
            sources=list(candidates.values()),
            provider_calls=records,
        )
