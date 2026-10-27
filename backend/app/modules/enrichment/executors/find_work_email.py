"""find_work_email (§7.2, G3-gated): MoltSets business-email tools.

Routing on a Leaders row:

- ``linkedinUrl`` present -> ``linkedin_to_business_email``
- else ``name`` + company domain -> ``search_business_email_by_name``
- else -> ``failed/missing_input`` (ZERO provider calls)

Found -> value = the provider's email, provenance ``provider_reported``.
Not found (``status: "not_found"`` or null email) -> ``no_data``,
``value`` None, cost 0.

Hard rule: an email is NEVER constructed from a name pattern — the only
source of a non-null value is a provider response body. Batching
(``linkedin_urls[]``) is P10 scope; one URL per call here.
"""

from typing import Any

from app.modules.enrichment.executors.base import (
    ColumnConfig,
    ExecContext,
    ExecError,
    ExecResult,
    RowSnapshot,
    SourceRef,
)
from app.modules.providers.moltsets.client import SyncMoltSetsClient
from app.modules.providers.moltsets.errors import (
    MoltSetsError,
    MoltSetsRateLimited,
    MoltSetsUnavailable,
)


class FindWorkEmail:
    provider = "moltsets"
    EXECUTOR_VERSION = "1"  # plan §8.6: bump when the query shape changes

    def __init__(self, client: SyncMoltSetsClient) -> None:
        self._client = client

    def execute(
        self, row: RowSnapshot, column: ColumnConfig, ctx: ExecContext
    ) -> ExecResult:
        linkedin_url = row.data.get("linkedinUrl")
        name = row.data.get("name")
        domain = row.data.get("companyDomain") or row.normalized_domain

        records: list[Any] = []
        if linkedin_url:
            try:
                resp = self._client.linkedin_to_business_email(
                    str(linkedin_url), record=records.append
                )
            except MoltSetsRateLimited:
                raise  # the worker defers the item — not a cell outcome
            except MoltSetsError as exc:
                return _failed(exc, records)
            evidence_url = str(linkedin_url)
        elif name and domain:
            try:
                resp = self._client.search_business_email_by_name(
                    name=str(name),
                    company_domain=str(domain),
                    record=records.append,
                )
            except MoltSetsRateLimited:
                raise
            except MoltSetsError as exc:
                return _failed(exc, records)
            evidence_url = None
        else:
            return ExecResult(
                status="failed",
                error=ExecError(
                    code="missing_input",
                    message=(
                        "required input(s) missing: linkedinUrl or "
                        "name + companyDomain"
                    ),
                ),
            )

        if resp.status == "not_found" or not resp.email:
            return ExecResult(
                status="no_data",
                provenance="provider_reported",
                provider_calls=records,
            )
        sources = []
        cited = resp.linkedin_url or evidence_url
        if cited:
            sources.append(SourceRef(url=cited, title=None))
        return ExecResult(
            status="succeeded",
            value=resp.email,
            provenance="provider_reported",
            sources=sources,
            provider_calls=records,
        )


def _failed(exc: MoltSetsError, records: list[Any]) -> ExecResult:
    """Provider error -> failed cell carrying the provider's own code
    (§8.8 MoltSets row: cell failed, code from provider, no retry);
    exhausted outages map to ``provider_unavailable`` like Exa."""
    code = (
        "provider_unavailable"
        if isinstance(exc, MoltSetsUnavailable)
        else exc.code
    )
    return ExecResult(
        status="failed",
        error=ExecError(code=code, message=exc.message),
        provider_calls=records,
    )
