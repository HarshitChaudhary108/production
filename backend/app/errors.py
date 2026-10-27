"""Error envelope: every error leaves the API as {"error": {code, message, details}}."""

from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class ApiError(Exception):
    def __init__(
        self,
        status: int,
        code: str,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message
        self.details = details


def _envelope(code: str, message: str, details: Any) -> dict[str, Any]:
    return {"error": {"code": code, "message": message, "details": details}}


# Contract error codes for HTTP errors raised by the framework itself.
_STATUS_TO_CODE = {
    400: "validation_error",
    404: "not_found",
    405: "invalid_state",
    409: "invalid_state",
    422: "validation_error",
    429: "rate_limited",
}


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def api_error_handler(request: Request, exc: ApiError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status,
            content=_envelope(exc.code, exc.message, exc.details),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        errors = [
            {"loc": list(e.get("loc", ())), "msg": e.get("msg", ""), "type": e.get("type", "")}
            for e in exc.errors()
        ]
        return JSONResponse(
            status_code=422,
            content=_envelope("validation_error", "Request validation failed", {"errors": errors}),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_error_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        code = _STATUS_TO_CODE.get(
            exc.status_code, "invalid_state" if exc.status_code < 500 else "internal_error"
        )
        message = exc.detail if isinstance(exc.detail, str) else "HTTP error"
        return JSONResponse(
            status_code=exc.status_code,
            headers=getattr(exc, "headers", None),
            content=_envelope(code, message, None),
        )

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content=_envelope("internal_error", "Internal server error", None),
        )
