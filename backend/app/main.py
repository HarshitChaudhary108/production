"""FastAPI application factory."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import Settings
from app.errors import register_error_handlers

API_PREFIX = "/api/v1"


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    app = FastAPI(title="Outmate API")
    app.state.settings = settings

    register_error_handlers(app)

    # Hardening H1 (not in the plan): explicit method/header allow-list.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["content-type", "authorization", "idempotency-key"],
    )

    @app.get("/health")
    def health() -> dict[str, bool]:
        return {"ok": True}

    return app


app = create_app()
