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
    run_max_rows: int = 20  # Q4 answered: human confirmed 20 rows/run max
    # PG-8: per-enrichment TTLs (seconds). Empty mapping -> cache fully off
    # (no reads, no writes). e.g. {"find_funding": 3600}.
    cache_ttl_seconds: dict[str, int] = {}

    # --- MoltSets plan limits (§5.2/P4b human design; env-overridable per
    # tier — docs publish NO req/min, only rolling Fair Use windows +
    # concurrency caps; windows are ROLLING from first request) ---
    # Defaults track the lowest paid tier ($27): 3 concurrent searches,
    # 2.5k search requests / 500 search records / 1k enrich records per 5h.
    # budget_fraction holds headroom for other consumers on the account.
    moltsets_base_url: str = "https://api.moltsets.com/api/v1/tools"
    moltsets_user_agent: str = "outmate-backend/0.1.0"
    moltsets_max_concurrent: int = 3
    moltsets_requests_per_window: int = 2500
    moltsets_search_records_per_window: int = 500
    moltsets_enrich_records_per_window: int = 1000
    moltsets_window_hours: float = 5.0
    moltsets_budget_fraction: float = 0.8

    # --- catalog gates (plan §5.3/§6: gated items stay hidden until the
    # gate passes; all off by default) ---
    gate_g2_linkedin: bool = False  # find_linkedin_highlights
    gate_g3_moltsets: bool = False  # find_decision_makers, find_work_email
    gate_g4_job_openings: bool = False  # find_job_openings
    gate_tech_stack_label: bool = False  # find_tech_stack (Q6 label CONFIRM)

    # --- worker + SSE (engineering defaults, not specified in the plan) ---
    max_attempts: int = 5
    max_concurrency: int = 4
    worker_batch_size: int = 10
    job_lease_seconds: float = 30
    job_recovery_interval_seconds: float = 15
    worker_poll_interval_seconds: float = 0.5
    sse_heartbeat_seconds: float = 15
    sse_retry_ms: int = 1000  # matches the mock's "retry: 1000" SSE directive
    download_token_ttl_seconds: int = 300
    # minimum milliseconds between calls to one provider (empty = unlimited)
    provider_min_interval_ms: dict[str, float] = {}

    @field_validator("cors_origins", "company_legal_suffixes", "social_link_filters", mode="before")
    @classmethod
    def _parse_list(cls, value: Any) -> Any:
        return _list_from_env(value)
