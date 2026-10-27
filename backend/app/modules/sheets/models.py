"""Sheet tables: sheets, columns, rows, cells, cell_sources (plan §8.1).

Import rule (plan §8.4): only modules under app/modules/sheets/ and alembic/
may import this module. Everything else goes through service.py.
"""

from datetime import datetime
from typing import Any

from sqlalchemy import (
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Sheet(Base):
    __tablename__ = "sheets"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    project_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("projects.id"))
    key: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(255))
    kind: Mapped[str] = mapped_column(String(32))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class SheetColumn(Base):
    __tablename__ = "columns"
    __table_args__ = (UniqueConstraint("sheet_id", "key", name="uq_columns_sheet_key"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    sheet_id: Mapped[str] = mapped_column(String(64), ForeignKey("sheets.id"), nullable=False)
    key: Mapped[str] = mapped_column(String(255))
    label: Mapped[str] = mapped_column(String(255))
    type: Mapped[str] = mapped_column(String(64))
    enrichment_id: Mapped[str | None] = mapped_column(String(64))
    prompt: Mapped[str | None] = mapped_column(Text)
    params: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    position: Mapped[int] = mapped_column(Integer, server_default="0")
    hidden: Mapped[bool] = mapped_column(server_default="false")
    is_base: Mapped[bool] = mapped_column(server_default="false")
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Row(Base):
    __tablename__ = "rows"
    __table_args__ = (Index("ix_rows_sheet_domain", "sheet_id", "normalized_domain"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    sheet_id: Mapped[str] = mapped_column(String(64), ForeignKey("sheets.id"), nullable=False)
    data: Mapped[dict[str, Any]] = mapped_column(JSONB, server_default="{}")
    normalized_domain: Mapped[str | None] = mapped_column(String(255))
    company_row_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("rows.id"))
    revision: Mapped[int] = mapped_column(Integer, server_default="0")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Cell(Base):
    __tablename__ = "cells"
    __table_args__ = (Index("ix_cells_column_id", "column_id"),)

    row_id: Mapped[str] = mapped_column(String(64), ForeignKey("rows.id"), primary_key=True)
    column_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("columns.id"), primary_key=True
    )
    value: Mapped[Any | None] = mapped_column(JSONB)
    status: Mapped[str] = mapped_column(String(32), server_default="'pending'")
    provenance: Mapped[str | None] = mapped_column(String(64))
    confidence: Mapped[float | None] = mapped_column(Numeric)
    confidence_label: Mapped[str | None] = mapped_column(String(16))
    source: Mapped[str | None] = mapped_column(String(64))
    user_edited: Mapped[bool] = mapped_column(server_default="false")
    stale: Mapped[bool] = mapped_column(server_default="false")
    cost: Mapped[int] = mapped_column(Integer, server_default="0")
    error: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    fetched_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_run_id: Mapped[str | None] = mapped_column(String(64))
    revision: Mapped[int] = mapped_column(Integer, server_default="0")


class CellSource(Base):
    __tablename__ = "cell_sources"
    __table_args__ = (
        ForeignKeyConstraint(
            ["row_id", "column_id"], ["cells.row_id", "cells.column_id"]
        ),
        Index("ix_cell_sources_cell", "row_id", "column_id"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    row_id: Mapped[str] = mapped_column(String(64), nullable=False)
    column_id: Mapped[str] = mapped_column(String(64), nullable=False)
    url: Mapped[str | None] = mapped_column(Text)
    title: Mapped[str | None] = mapped_column(Text)
    provider: Mapped[str | None] = mapped_column(String(64))
    captured_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
