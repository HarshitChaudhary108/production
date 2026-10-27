"""Normalization helpers (plan §8.4)."""

import re
from functools import lru_cache

_SCHEME_RE = re.compile(r"^[a-z][a-z0-9+.-]*://")
_PUNCT_RE = re.compile(r"[^\w\s]")
_WS_RE = re.compile(r"\s+")


@lru_cache(maxsize=1)
def _legal_suffixes() -> frozenset[str]:
    from app.config import Settings

    return frozenset(s.lower() for s in Settings().company_legal_suffixes)  # type: ignore[call-arg]


def normalized_domain(value: str | None) -> str | None:
    """lowercase, strip scheme, path/query/fragment, port, leading www., trailing dot."""
    if not value:
        return None
    v = value.strip().lower()
    v = _SCHEME_RE.sub("", v)
    v = v.split("/", 1)[0].split("?", 1)[0].split("#", 1)[0]
    v = v.split(":", 1)[0]
    if v.startswith("www."):
        v = v[4:]
    v = v.rstrip(".")
    return v or None


def normalized_name(value: str | None, legal_suffixes: frozenset[str] | None = None) -> str | None:
    """lowercase, strip punctuation, collapse whitespace, remove legal suffixes."""
    if not value:
        return None
    suffixes = _legal_suffixes() if legal_suffixes is None else legal_suffixes
    v = _PUNCT_RE.sub(" ", value.lower())
    words = [w for w in _WS_RE.sub(" ", v).strip().split() if w not in suffixes]
    return " ".join(words) or None
