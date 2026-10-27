"""seed

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-27

One workspace (credits 5,000, matching the mock) and one user.
Identity values copied from server/mock-api.mjs /me — demo values.
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = '0002'
down_revision: str | None = '0001'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

workspaces = sa.table(
    "workspaces",
    sa.column("id"),
    sa.column("name"),
    sa.column("plan"),
    sa.column("credits_balance"),
)
users = sa.table(
    "users",
    sa.column("id"),
    sa.column("workspace_id"),
    sa.column("name"),
    sa.column("email"),
    sa.column("initials"),
)


def upgrade() -> None:
    op.bulk_insert(
        workspaces,
        [
            {
                "id": "ws_demo",
                "name": "Outmate",
                "plan": "Growth workspace",
                "credits_balance": 5000,
            }
        ],
    )
    op.bulk_insert(
        users,
        [
            {
                "id": "usr_demo",
                "workspace_id": "ws_demo",
                "name": "Omkar Bhor",
                "email": "omkar@outmate.ai",
                "initials": "OB",
            }
        ],
    )


def downgrade() -> None:
    op.execute("DELETE FROM users WHERE id = 'usr_demo'")
    op.execute("DELETE FROM workspaces WHERE id = 'ws_demo'")
