"""Alembic environment. URL comes from Settings() (DATABASE_URL)."""

import importlib
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context
from app.config import Settings
from app.db import Base

_MODEL_MODULES = [
    "app.modules.core.models",
    "app.modules.sheets.models",
    "app.modules.jobs.models",
    "app.modules.credits.models",
    "app.modules.enrichment.models",
    "app.modules.providers.models",
    "app.modules.projects.models",
    "app.modules.copilot.models",
    "app.modules.radar.models",
    "app.modules.exports.models",
]
for _m in _MODEL_MODULES:
    importlib.import_module(_m)

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name, disable_existing_loggers=False)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=Settings().database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        {"sqlalchemy.url": Settings().database_url},
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
