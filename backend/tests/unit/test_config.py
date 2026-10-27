from pathlib import Path

import pytest
from pydantic import ValidationError

from app.config import Settings

WORKSPACE_ROOT = Path(__file__).resolve().parents[3]


def test_settings_load_from_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("RUN_MAX_ROWS", "123")
    monkeypatch.setenv("NEWS_LOOKBACK_DAYS", "45")
    settings = Settings()
    assert settings.run_max_rows == 123
    assert settings.news_lookback_days == 45


def test_missing_secret_raises_at_load(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in ("DATABASE_URL", "EXA_API_KEY", "MOLTSETS_API_KEY"):
        monkeypatch.delenv(name, raising=False)
    with pytest.raises(ValidationError):
        Settings(_env_file=None)


def test_env_files_are_gitignored() -> None:
    for gitignore in (
        WORKSPACE_ROOT / ".gitignore",
        WORKSPACE_ROOT / "outmate-home" / ".gitignore",
    ):
        assert gitignore.exists(), f"missing {gitignore}"
        assert ".env*" in gitignore.read_text(encoding="utf-8"), f".env* not in {gitignore}"
