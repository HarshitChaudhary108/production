"""Routes mounted only in tests, never in app code.

``/__test/*`` probes exercise the error envelope (P0): a deliberate ApiError
and a pydantic-validated echo. Replaces the probe half of the retired
test_routes.py (the run routes it hosted are real app routes since P5).
"""

from fastapi import APIRouter
from pydantic import BaseModel

from app.errors import ApiError

router = APIRouter()


class EchoBody(BaseModel):
    name: str


@router.get("/__test/api-error")
def api_error() -> None:
    raise ApiError(422, "validation_error", "x", {"a": 1})


@router.post("/__test/validated")
def validated(body: EchoBody) -> dict[str, str]:
    return {"name": body.name}
