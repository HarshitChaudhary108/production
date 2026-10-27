"""Copilot tables: conversations, messages (plan §8.1)."""

from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("workspaces.id"), nullable=False
    )
    project_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("projects.id"))
    title: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    conversation_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("conversations.id"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(32))
    content: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str | None] = mapped_column(String(32))
    feedback: Mapped[str | None] = mapped_column(String(32))
    intent: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    job_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("jobs.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
