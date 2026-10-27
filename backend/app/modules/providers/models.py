"""provider_calls table (plan §8.1)."""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class ProviderCall(Base):
    __tablename__ = "provider_calls"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    job_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("jobs.id"))
    row_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("rows.id"))
    provider: Mapped[str] = mapped_column(String(32))
    endpoint: Mapped[str] = mapped_column(String(255))
    status_code: Mapped[int | None] = mapped_column(Integer)
    request_id: Mapped[str | None] = mapped_column(String(128))
    cost_dollars: Mapped[float | None] = mapped_column(Numeric)
    ms: Mapped[int | None] = mapped_column(Integer)
    # P4b (§5.2): provider-native units. ``tokens`` = MoltSets tokens_used
    # (null on unlimited plans / Exa). ``records_returned`` = Fair Use
    # records the call consumed — the window-budget accounting source;
    # on an open reservation row (status_code NULL) it is the RESERVED
    # worst-case and is rewritten with the actual at completion.
    tokens: Mapped[int | None] = mapped_column(Integer)
    records_returned: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
