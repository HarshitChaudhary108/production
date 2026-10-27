"""Prefixed opaque ids (plan §4.2)."""

import secrets

ALLOWED_PREFIXES = ("prj", "sh", "col", "row", "enr", "job", "conv", "msg")


def new_id(prefix: str) -> str:
    """Return ``<prefix>_<opaque token>``. Raises ValueError on an unknown prefix."""
    if prefix not in ALLOWED_PREFIXES:
        raise ValueError(f"unknown id prefix: {prefix!r}")
    token = secrets.token_urlsafe(16)
    while token.isdigit():
        token = secrets.token_urlsafe(16)
    return f"{prefix}_{token}"
