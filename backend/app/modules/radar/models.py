"""radar_signal_actions table (plan §8.1)."""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class RadarSignalAction(Base):
    __tablename__ = "radar_signal_actions"

    workspace_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("workspaces.id"), primary_key=True
    )
    signal_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    action: Mapped[str] = mapped_column(String(32))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
