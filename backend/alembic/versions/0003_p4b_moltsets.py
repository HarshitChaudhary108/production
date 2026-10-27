"""p4b moltsets

Revision ID: 0003
Revises: 0002
Create Date: 2026-10-27

P4b MoltSets adapter support:
- ``job_items.available_at``: provider-side deferral timestamp — the claim
  query skips pending items until it passes (429 backoff / gate wait).
- ``provider_calls.tokens``: provider-native units consumed (MoltSets
  ``metadata.tokens_used``; null on unlimited plans / other providers).
- ``provider_calls.records_returned``: Fair Use records consumed — the
  window-budget accounting source for the MoltSets gate; on an open
  reservation row (``status_code`` NULL) it holds the reserved worst-case.
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = '0003'
down_revision: str | None = '0002'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "job_items",
        sa.Column("available_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "provider_calls",
        sa.Column("tokens", sa.Integer(), nullable=True),
    )
    op.add_column(
        "provider_calls",
        sa.Column("records_returned", sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("provider_calls", "records_returned")
    op.drop_column("provider_calls", "tokens")
    op.drop_column("job_items", "available_at")
