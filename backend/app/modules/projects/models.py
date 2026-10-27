"""projects table (plan §8.1)."""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("workspaces.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255))
    status: Mapped[str | None] = mapped_column(String(32))
    type: Mapped[str | None] = mapped_column(String(64))
    prompt: Mapped[str | None] = mapped_column(Text)
    tool_ids: Mapped[list[str] | None] = mapped_column(JSONB)
    connector_ids: Mapped[list[str] | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    last_run_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
