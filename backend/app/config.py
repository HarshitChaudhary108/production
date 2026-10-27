"""Application settings loaded from environment variables.

Every tunable the plan marks "(config)" lives here. Secrets never have defaults:
loading ``Settings`` without ``DATABASE_URL``, ``EXA_API_KEY`` or
``MOLTSETS_API_KEY`` set raises ``pydantic.ValidationError``.

Env vars use the field name uppercased (``RUN_MAX_ROWS``, ``NEWS_LOOKBACK_DAYS``…).
List values accept JSON arrays or comma-separated strings.
"""

import json
from typing import Any

from pydantic import SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _list_from_env(value: Any) -> Any:
    if isinstance(value, str):
        stripped = value.strip()
        if stripped.startswith("["):
            return json.loads(stripped)
        return [part.strip() for part in stripped.split(",") if part.strip()]
    return value


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- secrets (required, no defaults) ---
    database_url: str
    exa_api_key: SecretStr
    moltsets_api_key: SecretStr

    # --- server ---
    cors_origins: list[str] = ["http://localhost:5173"]

    # --- provider executors (plan §7; defaults given by the plan) ---
    exa_system_prompt: str = (
        "Use only facts stated in the sources. "
        "If the requested information is not stated, return null for that field."
    )
    company_legal_suffixes: list[str] = [
        "inc",
        "incorporated",
        "ltd",
        "limited",
        "llc",
        "llp",
        "corp",
        "corporation",
        "co",
        "company",
        "gmbh",
        "ag",
        "sa",
        "sas",
        "sarl",
        "srl",
        "bv",
        "nv",
        "plc",
        "pty",
        "ab",
        "oy",
        "as",
        "spa",
        "ltda",
        "pte",
        "se",
    ]
    social_link_filters: list[str] = [
        "linkedin.com/company",
        "x.com",
        "twitter.com",
        "youtube.com",
        "facebook.com",
        "instagram.com",
    ]
    news_lookback_days: int = 90
    funding_news_lookback_days: int = 730
    leadership_lookback_days: int = 90
    prompt_min_chars: int = 1
    prompt_max_chars: int = 2000

    # --- credits / runs (plan §8.3, §8.6, §9; defaults from the plan) ---
    discovery_credits_per_company: int = 2  # until CONFIRM Q2
    research_default_count: int = 25  # plan-suggested, CONFIRM Q4
    run_max_rows: int = 500  # plan-suggested, CONFIRM Q4
    cache_ttl_seconds: int | None = None  # no plan default; cache stays off (PG-8)

    # --- worker + SSE (engineering defaults, not specified in the plan) ---
    max_attempts: int = 5
    max_concurrency: int = 4
    worker_batch_size: int = 10
    job_lease_seconds: int = 30
    job_recovery_interval_seconds: int = 15
    sse_heartbeat_seconds: int = 15
    download_token_ttl_seconds: int = 300

    @field_validator("cors_origins", "company_legal_suffixes", "social_link_filters", mode="before")
    @classmethod
    def _parse_list(cls, value: Any) -> Any:
        return _list_from_env(value)
