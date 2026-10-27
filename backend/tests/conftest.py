"""Shared fixtures."""

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

import tests.env_defaults  # noqa: F401  (sets env defaults before app imports)
from alembic import command
from app.config import Settings
from app.main import create_app
from tests.support.db import alembic_cfg
from tests.support.test_routes import router as test_router


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
def client(settings: Settings) -> Iterator[TestClient]:
    with TestClient(create_app(settings)) as c:
        yield c


@pytest.fixture
def client_with_test_routes(settings: Settings) -> Iterator[TestClient]:
    app = create_app(settings)
    app.include_router(test_router, prefix="/api/v1")
    with TestClient(app) as c:
        yield c
