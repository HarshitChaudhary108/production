"""``GET /me`` (SA-3): seeded user/workspace; credits are the static seed
values — no ledger exists to move them."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import Principal, get_principal
from app.db import get_session
from app.errors import ApiError
from app.modules.core.models import User, Workspace

router = APIRouter()


@router.get("/me")
def me(
    s: Annotated[Session, Depends(get_session)],
    principal: Annotated[Principal, Depends(get_principal)],
) -> dict[str, Any]:
    user = s.get(User, principal.user_id)
    workspace = s.get(Workspace, principal.workspace_id)
    if user is None or workspace is None:
        raise ApiError(404, "not_found", "seeded user/workspace missing")
    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "initials": user.initials,
        },
        "workspace": {
            "id": workspace.id,
            "name": workspace.name,
            "plan": workspace.plan,
        },
        "credits": {
            "remaining": workspace.credits_balance,
            "used": 0,
            "reserved": 0,
        },
    }
