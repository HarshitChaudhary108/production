"""Job tables: jobs, job_items, job_events (plan §8.1)."""

from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("workspaces.id"), nullable=False
    )
    type: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(32), server_default="'queued'")
    progress: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    steps: Mapped[list[dict[str, Any]] | None] = mapped_column(JSONB)
    estimated_credits: Mapped[int | None] = mapped_column(Integer)
    charged_credits: Mapped[int | None] = mapped_column(Integer)
    result: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    error: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    parent_ref: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class JobItem(Base):
    __tablename__ = "job_items"
    __table_args__ = (Index("ix_job_items_status_job", "status", "job_id"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    job_id: Mapped[str] = mapped_column(String(64), ForeignKey("jobs.id"), nullable=False)
    kind: Mapped[str] = mapped_column(String(32))
    row_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("rows.id"))
    column_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("columns.id"))
    payload: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    status: Mapped[str] = mapped_column(String(32), server_default="'pending'")
    attempts: Mapped[int] = mapped_column(Integer, server_default="0")
    lease_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # P4b: provider-side deferral (429 / gate wait). The item stays
    # claimable only once this passes; NULL = claimable immediately.
    available_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    result: Mapped[dict[str, Any] | None] = mapped_column(JSONB)


class JobEvent(Base):
    __tablename__ = "job_events"

    job_id: Mapped[str] = mapped_column(String(64), ForeignKey("jobs.id"), primary_key=True)
    seq: Mapped[int] = mapped_column(Integer, primary_key=True)
    event: Mapped[str] = mapped_column(String(32))
    data: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
