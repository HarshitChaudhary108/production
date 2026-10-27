"""Integration fixtures: rollback-scoped session on the migrated schema."""

from collections.abc import Iterator

import pytest
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session


@pytest.fixture
def db(engine: Engine, migrated: None) -> Iterator[Session]:
    conn = engine.connect()
    trans = conn.begin()
    session = Session(bind=conn, expire_on_commit=False)
    try:
        yield session
    finally:
        session.close()
        trans.rollback()
        conn.close()
