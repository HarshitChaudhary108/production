"""Idempotency helper (plan §8.9): same (workspace, key) replays the stored
response; a different body under the same key returns the original and logs a
warning (Q9 default = mock behaviour)."""

import logging

import pytest
from sqlalchemy.orm import Session

from app import idempotency
from app.modules.core.models import IdempotencyKey

ROUTE = "POST /api/v1/enrichments/runs"
BODY = {"target": {"sheetId": "sh_x", "rowIds": ["row_1"]},
        "columns": [{"key": "f", "enrichmentId": "find_funding"}]}
RESPONSE = {"runId": "enr_1", "jobId": "job_1", "estimatedCredits": 3,
            "status": "queued"}


def test_store_then_replay_returns_stored_response(db: Session) -> None:
    assert idempotency.lookup(db, "ws_demo", "k1") is None
    idempotency.store(db, "ws_demo", "k1", ROUTE, BODY, 202, RESPONSE)
    rec = idempotency.lookup(db, "ws_demo", "k1")
    assert rec is not None
    assert rec.response == {"status": 202, "body": RESPONSE}
    assert rec.request_hash == idempotency.request_hash(BODY)


def test_same_key_and_body_matches(db: Session) -> None:
    idempotency.store(db, "ws_demo", "k2", ROUTE, BODY, 202, RESPONSE)
    rec = idempotency.lookup(db, "ws_demo", "k2")
    assert rec is not None
    assert idempotency.matches(rec, ROUTE, BODY)


def test_different_body_same_key_logs_warning_and_returns_original(
    db: Session, caplog: pytest.LogCaptureFixture
) -> None:
    idempotency.store(db, "ws_demo", "k3", ROUTE, BODY, 202, RESPONSE)
    rec = idempotency.lookup(db, "ws_demo", "k3")
    assert rec is not None
    changed = {**BODY, "columns": [{"key": "f", "enrichmentId": "find_revenue"}]}
    with caplog.at_level(logging.WARNING):
        matches = idempotency.matches(rec, ROUTE, changed)
    assert not matches
    assert rec.response == {"status": 202, "body": RESPONSE}
    assert "idempotency" in caplog.text.lower()


def test_keys_are_scoped_per_workspace(db: Session) -> None:
    idempotency.store(db, "ws_demo", "k4", ROUTE, BODY, 202, RESPONSE)
    assert idempotency.lookup(db, "ws_other", "k4") is None


def test_lookup_missing_key_returns_none(db: Session) -> None:
    assert db.get(IdempotencyKey, ("ws_demo", "nope")) is None
    assert idempotency.lookup(db, "ws_demo", "nope") is None
