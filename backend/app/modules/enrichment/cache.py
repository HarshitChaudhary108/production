"""Enrichment result cache (plan §8.6, PG-8 resolved).

Key: (normalized_domain, enrichment_id, sha256(prompt + params),
executor_version) — the composite primary key of ``enrichment_cache``.

OFF BY DEFAULT: ``settings.cache_ttl_seconds`` is a per-enrichment TTL map
({enrichment_id: seconds}). An id without a TTL is never read and never
written — the cache does nothing until configured. ``refresh: true`` on the
run bypasses reads (a fresh result still rewrites the row so the store stays
current). Only ``succeeded`` results are stored (prompt1.md D3); a cached
result carries no provider_calls, so a hit adds zero spend.
"""

from datetime import UTC, datetime
from typing import Any

from sqlalchemy import delete, func
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.config import Settings
from app.modules.enrichment.executors.base import (
    ExecResult,
    SignalDraft,
    SourceRef,
)
from app.modules.enrichment.models import EnrichmentCache


def ttl_for(settings: Settings, enrichment_id: str | None) -> int | None:
    """TTL seconds for this enrichment, or None when the cache is off for it."""
    if not enrichment_id:
        return None
    return settings.cache_ttl_seconds.get(enrichment_id)


def _is_fresh(row: EnrichmentCache, ttl_seconds: int) -> bool:
    created = row.created_at
    if created is None:
        return False
    if created.tzinfo is None:
        created = created.replace(tzinfo=UTC)
    return (datetime.now(UTC) - created).total_seconds() < ttl_seconds


def lookup(
    s: Session,
    *,
    normalized_domain: str,
    enrichment_id: str,
    prompt_hash: str,
    executor_version: str,
    ttl_seconds: int,
) -> ExecResult | None:
    """Return the cached ExecResult when a fresh row exists, else None.
    Expired rows are deleted so a stale hit cannot resurrect."""
    row = s.get(
        EnrichmentCache,
        (normalized_domain, enrichment_id, prompt_hash, executor_version),
    )
    if row is None or row.result is None:
        return None
    if not _is_fresh(row, ttl_seconds):
        s.delete(row)
        s.flush()
        return None
    r = row.result
    return ExecResult(
        status="succeeded",
        value=r.get("value"),
        provenance=r.get("provenance"),
        confidence_label=r.get("confidenceLabel"),
        sources=[
            SourceRef(url=src.get("url"), title=src.get("title"))
            for src in r.get("sources") or []
        ],
        signals=[
            SignalDraft(
                type=str(d.get("type") or ""),
                detail=d.get("detail"),
                source_host=d.get("sourceHost"),
                detected_at=d.get("detectedAt"),
                confidence_label=d.get("confidenceLabel"),
            )
            for d in r.get("signals") or []
        ],
    )


def store(
    s: Session,
    *,
    normalized_domain: str,
    enrichment_id: str,
    prompt_hash: str,
    executor_version: str,
    result: ExecResult,
) -> None:
    """Upsert a succeeded result (provider_calls are never persisted — they
    describe one call, not the reusable value)."""
    if result.status != "succeeded":
        return
    payload: dict[str, Any] = {
        "status": result.status,
        "value": result.value,
        "provenance": result.provenance,
        "confidenceLabel": result.confidence_label,
        "sources": [{"url": src.url, "title": src.title} for src in result.sources],
        "signals": [
            {
                "type": d.type,
                "detail": d.detail,
                "sourceHost": d.source_host,
                "detectedAt": d.detected_at,
                "confidenceLabel": d.confidence_label,
            }
            for d in result.signals
        ],
    }
    s.execute(
        pg_insert(EnrichmentCache)
        .values(
            normalized_domain=normalized_domain,
            enrichment_id=enrichment_id,
            prompt_hash=prompt_hash,
            executor_version=executor_version,
            result=payload,
        )
        .on_conflict_do_update(
            index_elements=[
                "normalized_domain",
                "enrichment_id",
                "prompt_hash",
                "executor_version",
            ],
            set_={"result": payload, "created_at": func.now()},
        )
    )
    s.flush()


def clear(s: Session) -> None:
    """Test helper: wipe the cache table."""
    s.execute(delete(EnrichmentCache))
    s.flush()
