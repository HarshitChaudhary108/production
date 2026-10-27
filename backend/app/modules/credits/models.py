"""Credit ledger (plan §8.1)."""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class CreditLedger(Base):
    __tablename__ = "credit_ledger"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("workspaces.id"), nullable=False
    )
    job_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("jobs.id"))
    kind: Mapped[str] = mapped_column(String(32))
    amount: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
