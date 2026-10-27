"""Core tables: workspaces, users, idempotency_keys (plan §8.1)."""

from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    plan: Mapped[str | None] = mapped_column(String(255))
    credits_balance: Mapped[int] = mapped_column(Integer, server_default="0")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("workspaces.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(320))
    initials: Mapped[str | None] = mapped_column(String(16))


class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"

    workspace_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("workspaces.id"), primary_key=True
    )
    key: Mapped[str] = mapped_column(String(255), primary_key=True)
    route: Mapped[str] = mapped_column(String(255))
    request_hash: Mapped[str | None] = mapped_column(String(128))
    response: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
