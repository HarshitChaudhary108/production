"""Auth stub: single seeded user + workspace, no login (plan §1.2).

Ids match the rows created by migration 0002_seed (demo values from
server/mock-api.mjs /me).
"""

from dataclasses import dataclass

SEED_USER_ID = "usr_demo"
SEED_WORKSPACE_ID = "ws_demo"


@dataclass(frozen=True)
class Principal:
    user_id: str
    workspace_id: str


def get_principal() -> Principal:
    return Principal(user_id=SEED_USER_ID, workspace_id=SEED_WORKSPACE_ID)
