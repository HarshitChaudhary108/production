"""SQLAlchemy engine/session factory + shared declarative base."""

from collections.abc import Iterator

from fastapi import Request
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import Settings


class Base(DeclarativeBase):
    pass


def make_engine(settings: Settings) -> Engine:
    return create_engine(settings.database_url, pool_pre_ping=True)


def make_session_factory(engine: Engine) -> sessionmaker[Session]:
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_session(request: Request) -> Iterator[Session]:
    """FastAPI dependency: one sync session per request; the route commits."""
    factory: sessionmaker[Session] = request.app.state.session_factory
    with factory() as s:
        yield s


def psycopg_dsn(sqlalchemy_url: str) -> str:
    """``postgresql+psycopg://…`` -> ``postgresql://…`` for raw psycopg use
    (the LISTEN connection in modules/jobs/sse.py)."""
    for prefix in ("postgresql+psycopg://", "postgresql+psycopg2://"):
        if sqlalchemy_url.startswith(prefix):
            return "postgresql://" + sqlalchemy_url[len(prefix):]
    return sqlalchemy_url
