"""download_tokens table (plan §8.1)."""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class DownloadToken(Base):
    __tablename__ = "download_tokens"

    token: Mapped[str] = mapped_column(String(128), primary_key=True)
    sheet_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("sheets.id"))
    format: Mapped[str] = mapped_column(String(16))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
