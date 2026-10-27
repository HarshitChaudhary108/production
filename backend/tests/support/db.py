"""DB test helpers: alembic config."""

from pathlib import Path

from alembic.config import Config

BACKEND_DIR = Path(__file__).resolve().parents[2]


def alembic_cfg() -> Config:
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    return cfg
