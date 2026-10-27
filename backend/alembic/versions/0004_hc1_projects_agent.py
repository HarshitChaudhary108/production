"""hc1 projects agent

Revision ID: 0004
Revises: 0003
Create Date: 2026-10-27

HC-1: ``projects.agent_id`` — the composer stores the agentId alongside
toolIds/connectorIds (stored, no behaviour per the contract).
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = '0004'
down_revision: str | None = '0003'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "projects",
        sa.Column("agent_id", sa.String(length=64), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("projects", "agent_id")
