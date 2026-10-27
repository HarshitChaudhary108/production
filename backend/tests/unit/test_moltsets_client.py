"""MoltSets client contract (developer.moltsets.com, plan §5.2/§8.8) —
httpx.MockTransport, no network.

Covers: Bearer + User-Agent auth headers; H4 secret hygiene (key never in
error messages, request bodies, or logs); envelope parsing (200 ok /
not_found); only documented request fields; retries on 429/500 honouring
Retry-After; provider error codes carried verbatim with zero retries;
tokens/records captured into ProviderCallRecord.
"""

import asyncio
import json
import logging
from pathlib import Path
from typing import Any

import httpx
import pytest

from app.modules.enrichment.executors.base import ProviderCallRecord
from app.modules.providers.moltsets.client import MoltSetsClient
from app.modules.providers.moltsets.errors import (
    MoltSetsError,
    MoltSetsRateLimited,
    MoltSetsUnavailable,
)

SENTINEL = "ms-SENTINEL-KEY-4d9f2b"
FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "moltsets"


def fixture_body(tool: str, case: str) -> dict[str, Any]:
    path = FIXTURES / tool / f"{case}.synthetic.json"
    return json.loads(path.read_text(encoding="utf-8"))["response"]


def err_body(code: str, message: str = "denied") -> dict[str, Any]:
    return {"error": {"code": code, "message": message}}


class Queue:
    """MockTransport handler: replays queued responses / exceptions and
    captures every request."""

    def __init__(self, *steps: Any) -> None:
        self.steps = list(steps)
        self.requests: list[httpx.Request] = []

    def __call__(self, request: httpx.Request) -> httpx.Response:
        self.requests.append(request)
        step = (
            self.steps.pop(0)
            if self.steps
            else httpx.Response(200, json=fixture_body("search_people", "example-com"))
        )
        if isinstance(step, BaseException):
            raise step
        return step


def make_client(
    handler: Queue,
    records: list[ProviderCallRecord] | None = None,
    sleeps: list[float] | None = None,
    **kw: Any,
) -> MoltSetsClient:
    async def fake_sleep(d: float) -> None:
        (sleeps if sleeps is not None else []).append(d)

    return MoltSetsClient(
        SENTINEL,
        transport=httpx.MockTransport(handler),
        sleep=fake_sleep,
        record=records.append if records is not None else None,
        **kw,
    )


def run(coro: Any) -> Any:
    return asyncio.run(coro)


def body_of(request: httpx.Request) -> dict[str, Any]:
    return json.loads(request.content.decode())


# ----------------------------------------------------------------- auth/H4


def test_auth_headers_and_user_agent() -> None:
    q = Queue()
    client = make_client(q)
    run(client.search_people(company_domain=["acme.io"]))
    req = q.requests[0]
    assert req.headers["authorization"] == f"Bearer {SENTINEL}"
    assert req.headers["user-agent"] == "outmate-backend/0.1.0"


def test_api_key_never_in_errors_or_bodies(caplog: pytest.LogCaptureFixture) -> None:
    q = Queue(
        httpx.Response(403, json=err_body("plan_restricted", "not on plan")),
        httpx.Response(422, json=err_body("invalid_input")),
    )
    client = make_client(q)
    with caplog.at_level(logging.DEBUG):
        with pytest.raises(MoltSetsError):
            run(client.search_people(company_domain=["acme.io"]))
        with pytest.raises(MoltSetsError) as excinfo:
            run(client.search_business_email_by_name(name="X", company_domain="y.io"))
    blob = "\n".join(r.getMessage() for r in caplog.records) + str(excinfo.value)
    assert SENTINEL not in blob
    for request in q.requests:
        assert SENTINEL not in request.content.decode()


# ------------------------------------------------------------- request shape


def test_search_people_only_documented_fields() -> None:
    q = Queue()
    client = make_client(q)
    run(
        client.search_people(
            company_domain=["acme.io"],
            seniority=["VP"],
            department=["Sales"],
            title="vp sales",
            limit=10,
            offset=5,
        )
    )
    body = body_of(q.requests[0])
    allowed = {
        "query", "title", "company", "company_domain", "country", "state",
        "city", "seniority", "industry", "department", "functional_area",
        "employee_range", "revenue_range", "naics_code", "linkedin_industry",
        "limit", "offset",
    } | {f"exclude_{f}" for f in ("companies", "titles", "seniority", "departments", "industries")}
    assert set(body) <= allowed
    assert body["company_domain"] == ["acme.io"]
    assert body["seniority"] == ["VP"]
    assert body["department"] == ["Sales"]
    assert body["title"] == "vp sales"
    assert body["offset"] == 5


def test_limit_capped_at_25() -> None:
    q = Queue()
    client = make_client(q)
    run(client.search_people(company_domain=["acme.io"], limit=100))
    assert body_of(q.requests[0])["limit"] == 25
    run(client.search_people(company_domain=["acme.io"], limit=0))
    assert body_of(q.requests[1])["limit"] == 1


def test_linkedin_to_business_email_body() -> None:
    q = Queue(httpx.Response(200, json=fixture_body("linkedin_to_business_email", "found")))
    client = make_client(q)
    resp = run(client.linkedin_to_business_email("https://www.linkedin.com/in/x"))
    assert body_of(q.requests[0]) == {"linkedin_url": "https://www.linkedin.com/in/x"}
    assert resp.status == "ok"
    assert resp.email == "ada.lovelace@example.com"
    assert resp.risk_score == "A"


def test_search_business_email_by_name_body() -> None:
    q = Queue(httpx.Response(200, json=fixture_body("search_business_email_by_name", "found")))
    client = make_client(q)
    resp = run(
        client.search_business_email_by_name(name="Ada Lovelace", company_domain="example.com")
    )
    assert body_of(q.requests[0]) == {
        "name": "Ada Lovelace",
        "company_domain": "example.com",
    }
    assert resp.email == "ada.lovelace@example.com"
    assert resp.linkedin_url == "https://www.linkedin.com/in/ada-lovelace-example"


# ------------------------------------------------------------- envelope


def test_not_found_is_not_an_error() -> None:
    q = Queue(httpx.Response(200, json=fixture_body("search_business_email_by_name", "not-found")))
    client = make_client(q)
    resp = run(client.search_business_email_by_name(name="Z", company_domain="z.io"))
    assert resp.status == "not_found"
    assert resp.email is None


def test_people_response_parsed() -> None:
    q = Queue(httpx.Response(200, json=fixture_body("search_people", "example-com")))
    client = make_client(q)
    resp = run(client.search_people(company_domain=["example.com"]))
    assert resp.status == "ok"
    assert resp.total == 3
    assert [p.full_name for p in resp.people] == [
        "Ada Lovelace", "Grace Hopper", "Alan Turing",
    ]
    assert resp.people[0].company is not None
    assert resp.people[0].company.domain == "example.com"


# ---------------------------------------------------------------- errors


@pytest.mark.parametrize(
    "status,code",
    [(401, "unauthorized"), (402, "insufficient_tokens"), (403, "plan_restricted"),
     (404, "tool_not_found"), (422, "invalid_input")],
)
def test_non_retryable_errors_never_retried(status: int, code: str) -> None:
    sleeps: list[float] = []
    q = Queue(httpx.Response(status, json=err_body(code, "boom")))
    client = make_client(q, sleeps=sleeps)
    with pytest.raises(MoltSetsError) as excinfo:
        run(client.search_people(company_domain=["acme.io"]))
    exc = excinfo.value
    assert exc.code == code
    assert exc.status_code == status
    assert not isinstance(exc, MoltSetsRateLimited)
    assert len(q.requests) == 1 and sleeps == []


def test_429_retries_then_rate_limited_with_retry_after() -> None:
    sleeps: list[float] = []
    q = Queue(
        httpx.Response(429, json=err_body("rate_limited"), headers={"Retry-After": "4"}),
        httpx.Response(429, json=err_body("fair_use_limit_exceeded"), headers={"Retry-After": "4"}),
        httpx.Response(429, json=err_body("rate_limited"), headers={"Retry-After": "4"}),
    )
    client = make_client(q, sleeps=sleeps)
    with pytest.raises(MoltSetsRateLimited) as excinfo:
        run(client.search_people(company_domain=["acme.io"]))
    assert excinfo.value.retry_after == 4.0
    assert len(q.requests) == 3
    assert sleeps and sleeps[0] == 4.0  # Retry-After honoured


def test_429_recovers_on_later_attempt() -> None:
    q = Queue(
        httpx.Response(
            429,
            json=err_body("search_concurrency_exceeded"),
            headers={"Retry-After": "1"},
        ),
        httpx.Response(200, json=fixture_body("search_business_email_by_name", "found")),
    )
    client = make_client(q)
    resp = run(client.search_business_email_by_name(name="A", company_domain="b.io"))
    assert resp.status == "ok"
    assert len(q.requests) == 2


def test_500_and_timeout_retry_then_unavailable() -> None:
    sleeps: list[float] = []
    q = Queue(
        httpx.Response(500, json=err_body("internal_error")),
        httpx.Response(500, json=err_body("internal_error")),
        httpx.Response(500, json=err_body("internal_error")),
    )
    client = make_client(q, sleeps=sleeps)
    with pytest.raises(MoltSetsUnavailable) as excinfo:
        run(client.search_people(company_domain=["acme.io"]))
    assert excinfo.value.code == "internal_error"
    assert len(q.requests) == 3
    assert len(sleeps) == 2

    q2 = Queue(
        httpx.ConnectTimeout("slow"),
        httpx.ConnectTimeout("slow"),
        httpx.ConnectTimeout("slow"),
    )
    client2 = make_client(q2, sleeps=sleeps)
    with pytest.raises(MoltSetsUnavailable) as excinfo2:
        run(client2.search_people(company_domain=["acme.io"]))
    assert excinfo2.value.code == "transport_error"


# ------------------------------------------------------------- observability


def test_records_capture_tokens_and_records_returned() -> None:
    records: list[ProviderCallRecord] = []
    q = Queue(httpx.Response(200, json=fixture_body("search_people", "example-com")))
    client = make_client(q, records=records)
    run(client.search_people(company_domain=["example.com"]))
    assert len(records) == 1
    rec = records[0]
    assert rec.provider == "moltsets"
    assert rec.endpoint == "search_people"
    assert rec.status_code == 200
    assert rec.tokens == 3
    assert rec.records_returned == 3
    assert SENTINEL not in repr(rec)


def test_records_on_error_attempts() -> None:
    records: list[ProviderCallRecord] = []
    q = Queue(
        httpx.Response(429, json=err_body("rate_limited"), headers={"Retry-After": "0"}),
        httpx.Response(200, json=fixture_body("search_business_email_by_name", "not-found")),
    )
    client = make_client(q, records=records)
    run(client.search_business_email_by_name(name="Z", company_domain="z.io"))
    assert [r.status_code for r in records] == [429, 200]
    assert records[1].records_returned == 0  # miss consumed no records
