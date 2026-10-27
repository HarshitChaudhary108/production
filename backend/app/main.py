"""FastAPI application factory."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import enrichments as enrichments_api
from app.api import jobs as jobs_api
from app.api import me as me_api
from app.config import Settings
from app.db import make_engine, make_session_factory
from app.errors import register_error_handlers
from app.logging import RequestIdMiddleware

API_PREFIX = "/api/v1"


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()  # type: ignore[call-arg]
    app = FastAPI(title="Outmate API")
    app.state.settings = settings
    app.state.engine = make_engine(settings)
    app.state.session_factory = make_session_factory(app.state.engine)

    register_error_handlers(app)

    # Hardening H1 (not in the plan): explicit method/header allow-list.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["content-type", "authorization", "idempotency-key"],
    )
    # H5: request-id on every response (incl. SSE stream start).
    app.add_middleware(RequestIdMiddleware)

    app.include_router(me_api.router, prefix=API_PREFIX)
    app.include_router(jobs_api.router, prefix=API_PREFIX)
    app.include_router(enrichments_api.router, prefix=API_PREFIX)

    @app.get("/health")
    def health() -> dict[str, bool]:
        return {"ok": True}

    return app


app = create_app()
