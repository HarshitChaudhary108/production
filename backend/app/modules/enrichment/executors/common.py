"""Shared executor helpers (plan §7.1 rules + §7.2 templates).

- ``SyncExaClient``: wraps the async ExaClient for the sync executor
  contract (executors run in a worker thread with no event loop).
- ``host_matches_domain``: §7.1 rule 2 entity check.
- ``format_usd_short``: minimal $-formatting rule (plan gives only "$28M").
- ``require_inputs``: §7.1 rule 1 — missing required input → failed /
  missing_input BEFORE any provider call.
- ``apply_citation_rule``: §7.1 rule 3 — ``verified`` needs ≥1 citation,
  ``ai_inferred`` keeps its value either way.
- ``exa_error_result``: §8.8 error → ExecResult mapping.
- ``first_company_entity``: pick the company entity on the first result
  whose URL host passes the entity check.
"""

import asyncio
import hashlib
import json
import re
from collections.abc import Sequence
from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any, Protocol
from urllib.parse import urlparse

if TYPE_CHECKING:
    from app.modules.providers.exa.client import ExaClient

from app.modules.enrichment.executors.base import (
    ColumnConfig,
    ExecContext,
    ExecError,
    ExecResult,
    ProviderCallRecord,
    RowSnapshot,
    SourceRef,
)
from app.modules.providers.exa.errors import (
    ExaAuth,
    ExaError,
    ExaOutOfCredits,
    ExaRejected,
    ExaUnavailable,
)
from app.modules.providers.exa.models import (
    CompanyEntity,
    ExaResponse,
    GroundingEntry,
    SearchResult,
    build_search_request,
    user_identifier,
)

RecordFn = Any


class SyncClient(Protocol):
    """The sync surface executors use; ExaClient is async underneath."""

    def search(
        self, body: dict[str, Any], record: Any = None
    ) -> ExaResponse: ...

    def contents(
        self, body: dict[str, Any], record: Any = None
    ) -> ExaResponse: ...


class SyncExaClient:
    """Sync wrapper over the async ``ExaClient`` (worker has no loop).

    A private loop is kept for the wrapper's lifetime rather than
    ``asyncio.run`` per call: httpx's connection pool binds to the loop
    that first serves it, so a fresh loop per call leaves pooled
    connections stranded on a closed loop ("Event loop is closed").
    """

    def __init__(self, client: "ExaClient") -> None:
        self._client = client
        self._loop = asyncio.new_event_loop()

    def search(self, body: dict[str, Any], record: Any = None) -> ExaResponse:
        return self._loop.run_until_complete(self._client.search(body, record=record))

    def contents(self, body: dict[str, Any], record: Any = None) -> ExaResponse:
        return self._loop.run_until_complete(self._client.contents(body, record=record))


def now_utc() -> datetime:
    return datetime.now(UTC)


def iso_z(dt: datetime) -> str:
    return dt.astimezone(UTC).isoformat().replace("+00:00", "Z")


# ------------------------------------------------------------- checks


def host_matches_domain(url: str | None, normalized_domain: str | None) -> bool:
    """URL host equals the domain or is a subdomain of it. ``evil-acme.io``
    does NOT match ``acme.io`` — the boundary is a dot, not a suffix."""
    if not url or not normalized_domain:
        return False
    host = urlparse(url if "://" in url else f"https://{url}").hostname
    if not host:
        return False
    host = host.lower().rstrip(".")
    domain = normalized_domain.lower().rstrip(".")
    return host == domain or host.endswith(f".{domain}")


_LEGAL_STRIP = re.compile(r"[^a-z0-9 ]+")


def normalize_name(name: str, legal_suffixes: Sequence[str]) -> str:
    """Case-fold, strip punctuation, drop legal suffixes (config list)."""
    words = _LEGAL_STRIP.sub(" ", name.lower()).split()
    while words and words[-1] in legal_suffixes:
        words.pop()
    return " ".join(words)


def require_inputs(row: RowSnapshot, fields: Sequence[str]) -> ExecResult | None:
    """Return a failed/missing_input ExecResult when any required input is
    absent — executors call this BEFORE any provider call."""
    missing = [
        f
        for f in fields
        if not (row.normalized_domain if f == "domain" else row.data.get(f))
    ]
    if missing:
        return ExecResult(
            status="failed",
            error=ExecError(
                code="missing_input",
                message=f"required input(s) missing: {', '.join(missing)}",
            ),
        )
    return None


def apply_citation_rule(result: ExecResult, mode: str) -> ExecResult:
    """§7.1 rule 3: ``verified`` needs ≥1 citation else the value becomes
    no_data; ``ai_inferred`` keeps the value regardless."""
    if mode == "verified" and not result.sources:
        return ExecResult(
            status="no_data",
            value=None,
            provenance=result.provenance,
            provider_calls=result.provider_calls,
            signals=[],
        )
    return result


_ERROR_CODES: dict[type[ExaError], str] = {
    ExaOutOfCredits: "provider_out_of_credits",
    ExaAuth: "provider_auth",
    ExaRejected: "provider_rejected_request",
    ExaUnavailable: "provider_unavailable",
}


def exa_error_result(
    exc: ExaError, records: list[ProviderCallRecord]
) -> ExecResult:
    code = _ERROR_CODES.get(type(exc), "provider_unavailable")
    return ExecResult(
        status="failed",
        error=ExecError(code=code, message=str(exc)),
        provider_calls=list(records),
    )


def first_company_entity(
    results: list[SearchResult], domain: str
) -> tuple[SearchResult, CompanyEntity] | None:
    """First result passing the entity check that carries a company entity."""
    for r in results:
        if not host_matches_domain(r.url, domain):
            continue
        entities = r.company_entities()
        if entities:
            return r, entities[0]
    return None


def format_usd_short(n: float | int | None) -> str:
    """Minimal plan rule: ≥1M -> "$xM" (trailing .0 dropped), ≥1K ->
    "$xK" (rounded), else "$x". e.g. 28_000_000 -> "$28M",
    1_500_000 -> "$1.5M", 950_000 -> "$950K"."""
    if n is None:
        return ""
    value = float(n)
    if abs(value) >= 1_000_000:
        m = round(value / 1_000_000, 1)
        return f"${m:g}M"
    if abs(value) >= 1_000:
        return f"${round(value / 1_000):g}K"
    return f"${value:g}"


def url_host(url: str | None) -> str | None:
    if not url:
        return None
    return urlparse(url if "://" in url else f"https://{url}").hostname


# ------------------------------------------------------------- P4a.4 helpers


def column_query(column: ColumnConfig) -> str:
    """P4a.4 rule: query text = the column's own prompt when set, else the
    catalog description of its enrichment (§7.2 "catalog default
    description if none"). Falls back to the column label when the
    enrichment id is unknown so query construction never crashes."""
    if column.prompt:
        return column.prompt
    if column.enrichment_id:
        # Lazy import: executors -> catalog registry must not create a cycle.
        from app.modules.catalog.registry import get_entry

        try:
            return get_entry(column.enrichment_id).description
        except KeyError:
            pass
    return column.label or ""


def cited_sources(
    grounding: Sequence[GroundingEntry],
    domain: str | None = None,
) -> list[SourceRef]:
    """Deduped ``SourceRef`` list pooled from all grounding citations.
    With ``domain``, keeps only citations passing the §7.1 entity check —
    a citation to another domain is discarded (P4a.4 verified rule)."""
    seen: set[str] = set()
    out: list[SourceRef] = []
    for g in grounding:
        for c in g.citations:
            if not c.url or c.url in seen:
                continue
            if domain is not None and not host_matches_domain(c.url, domain):
                continue
            seen.add(c.url)
            out.append(SourceRef(url=c.url, title=c.title))
    return out


def output_schema_search(
    client: SyncClient,
    query: str,
    *,
    ctx: ExecContext,
    records: list[Any],
    type: str = "auto",
    include_domains: list[str] | None = None,
    num_results: int | None = None,
    contents: dict[str, Any] | None = None,
    output_schema: dict[str, Any] | None = None,
) -> ExaResponse:
    """Every outputSchema call carries the canonical ``systemPrompt``
    (§7.1 rule 4) and the hashed ``userIdentifier`` (§7.1 rule 5)."""
    return client.search(
        build_search_request(
            query,
            type=type,
            include_domains=include_domains,
            num_results=num_results,
            contents=contents,
            output_schema=output_schema,
            system_prompt=ctx.settings.exa_system_prompt,
            user_identifier=user_identifier(ctx.workspace_id),
        ),
        record=records.append,
    )


def prompt_hash(prompt: str | None, params: dict[str, Any] | None) -> str:
    """Cache-key ingredient for prompt-driven columns (§8.6; P5 reads it):
    canonical JSON of (prompt, params) → sha256 hex. Two different prompts
    always produce different inputs."""
    payload = json.dumps(
        {"prompt": prompt or "", "params": params or {}},
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def company_suffix(name: str, domain: str) -> str:
    """The ``"Company: <name> (<domain>)"`` tail appended to deep-lite
    queries (§7.2 / P4a.4)."""
    return f"Company: {name} ({domain})"
