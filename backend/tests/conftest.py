"""Shared fixtures."""

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

import tests.env_defaults  # noqa: F401  (sets env defaults before app imports)
from alembic import command
from app.config import Settings
from app.main import create_app
from tests.support.db import alembic_cfg
from tests.support.probe_routes import router as probe_router


@pytest.fixture(scope="session")
def settings() -> Settings:
    return Settings()


@pytest.fixture(scope="session")
def engine(settings: Settings) -> Iterator[Engine]:
    engine = create_engine(settings.database_url, pool_pre_ping=True)
    yield engine
    engine.dispose()


@pytest.fixture(scope="session")
def migrated(engine: Engine) -> None:
    command.upgrade(alembic_cfg(), "head")


@pytest.fixture
def db(engine: Engine, migrated: None) -> Iterator[Session]:
    """Rollback-scoped session on the migrated schema (unit tests)."""
    conn = engine.connect()
    trans = conn.begin()
    session = Session(bind=conn, expire_on_commit=False)
    try:
        yield session
    finally:
        session.close()
        trans.rollback()
        conn.close()


@pytest.fixture
def client(settings: Settings) -> Iterator[TestClient]:
    with TestClient(create_app(settings)) as c:
        yield c


@pytest.fixture
def client_with_probes(settings: Settings) -> Iterator[TestClient]:
    app = create_app(settings)
    app.include_router(probe_router, prefix="/api/v1")
    with TestClient(app) as c:
        yield c


@pytest.fixture
def client_g2(settings: Settings) -> Iterator[TestClient]:
    """The real app with ``gate_g2_linkedin`` on so find_linkedin_highlights
    is runnable through POST /enrichments/runs (P5)."""
    gated = settings.model_copy(update={"gate_g2_linkedin": True})
    with TestClient(create_app(gated)) as c:
        yield c


@pytest.fixture
def client_g3(settings: Settings) -> Iterator[TestClient]:
    """The real app with ``gate_g3_moltsets`` on so the two MoltSets
    enrichments are visible and runnable through POST /enrichments/runs."""
    gated = settings.model_copy(update={"gate_g3_moltsets": True})
    with TestClient(create_app(gated)) as c:
        yield c
