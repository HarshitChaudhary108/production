"""Enrichment tables: enrichment_runs, enrichment_cache (plan §8.1)."""

from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class EnrichmentRun(Base):
    __tablename__ = "enrichment_runs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    job_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("jobs.id"))
    sheet_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("sheets.id"))
    columns: Mapped[list[dict[str, Any]] | None] = mapped_column(JSONB)
    estimated_credits: Mapped[int | None] = mapped_column(Integer)
    charged_credits: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(32), server_default="'queued'")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class EnrichmentCache(Base):
    __tablename__ = "enrichment_cache"

    normalized_domain: Mapped[str] = mapped_column(String(255), primary_key=True)
    enrichment_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    prompt_hash: Mapped[str] = mapped_column(String(128), primary_key=True)
    executor_version: Mapped[str] = mapped_column(String(32), primary_key=True)
    result: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
