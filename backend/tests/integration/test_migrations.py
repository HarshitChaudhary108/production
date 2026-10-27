"""Migration lifecycle: upgrade head on an empty DB, downgrade base, upgrade again."""

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

from alembic import command
from tests.support.db import alembic_cfg

EXPECTED_TABLES = {
    "workspaces",
    "users",
    "projects",
    "sheets",
    "columns",
    "rows",
    "cells",
    "cell_sources",
    "enrichment_runs",
    "jobs",
    "job_items",
    "job_events",
    "credit_ledger",
    "idempotency_keys",
    "enrichment_cache",
    "provider_calls",
    "conversations",
    "messages",
    "radar_signal_actions",
    "download_tokens",
}


def test_upgrade_head_creates_all_tables(engine: Engine, migrated: None) -> None:
    names = set(inspect(engine).get_table_names())
    missing = EXPECTED_TABLES - names
    assert not missing, f"missing tables: {missing}"


def test_downgrade_base_drops_all_tables(engine: Engine, migrated: None) -> None:
    command.downgrade(alembic_cfg(), "base")
    try:
        remaining = set(inspect(engine).get_table_names())
        survived = EXPECTED_TABLES & remaining
        assert not survived, f"tables survived downgrade: {survived}"
    finally:
        command.upgrade(alembic_cfg(), "head")


def test_upgrade_after_downgrade_and_seed(engine: Engine, migrated: None) -> None:
    with engine.connect() as conn:
        assert conn.execute(text("select count(*) from workspaces")).scalar_one() == 1
        assert (
            conn.execute(text("select credits_balance from workspaces")).scalar_one() == 5000
        )
        assert conn.execute(text("select count(*) from users")).scalar_one() == 1
        ws = conn.execute(
            text("select id, name, plan from workspaces")
        ).mappings().one()
        assert ws["id"] == "ws_demo"
        assert ws["name"] == "Outmate"
        assert ws["plan"] == "Growth workspace"
        user = conn.execute(
            text("select id, name, email, initials from users")
        ).mappings().one()
        assert user["id"] == "usr_demo"
        assert user["name"] == "Omkar Bhor"
        assert user["email"] == "omkar@outmate.ai"
        assert user["initials"] == "OB"
