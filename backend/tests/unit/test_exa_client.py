"""Exa client contract (plan §5.1 / §8.8) — httpx.MockTransport, no network.

Covers: x-api-key header + H4 secret hygiene; local request validation (legacy
types, category/filter combos, numResults bounds, no deprecated fields);
retry/error mapping (429/503/5xx+timeouts retried, 402/400/401/403 never);
provider_calls recording from costDollars.total.
"""

import asyncio
import logging
from typing import Any

import httpx
import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.enrichment.executors.base import ProviderCallRecord
from app.modules.providers.exa.client import ExaClient, user_identifier
from app.modules.providers.exa.errors import (
    ExaAuth,
    ExaOutOfCredits,
    ExaRejected,
    ExaRequestError,
    ExaUnavailable,
)
from app.modules.providers.exa.models import (
    build_contents_request,
    build_search_request,
)
from app.modules.providers.models import ProviderCall

SENTINEL = "EXA-KEY-SENTINEL-4d9f2b"
DEPRECATED_FIELDS = {
    "livecrawl",
    "subpages",
    "includeText",
    "excludeText",
    "context",
    "startCrawlDate",
    "endCrawlDate",
}


def ok_body(**over: Any) -> dict[str, Any]:
    body: dict[str, Any] = {
        "requestId": "req-1",
        "results": [
            {"title": "T", "url": "https://acme.com", "id": "d1"}
        ],
        "costDollars": {"total": 0.005},
        "searchTime": 12.0,
    }
    body.update(over)
    return body


class Queue:
    """MockTransport handler: replays queued responses / exceptions."""

    def __init__(self, *steps: Any) -> None:
        self.steps = list(steps)
        self.requests: list[httpx.Request] = []

    def __call__(self, request: httpx.Request) -> httpx.Response:
        self.requests.append(request)
        step = self.steps.pop(0) if self.steps else httpx.Response(200, json=ok_body())
        if isinstance(step, BaseException):
            raise step
        return step


def make_client(
    handler: Queue,
    records: list[ProviderCallRecord] | None = None,
    sleeps: list[float] | None = None,
    **kw: Any,
) -> ExaClient:
    async def fake_sleep(d: float) -> None:
        (sleeps if sleeps is not None else []).append(d)

    return ExaClient(
        SENTINEL,
        transport=httpx.MockTransport(handler),
        sleep=fake_sleep,
        record=records.append if records is not None else None,
        **kw,
    )


def run(coro: Any) -> Any:
    return asyncio.run(coro)


# --------------------------------------------------------------- builders


@pytest.mark.parametrize("legacy", ["fast", "instant", "deep-reasoning"])
def test_legacy_types_rejected_before_any_request(legacy: str) -> None:
    q = Queue()
    with pytest.raises(ExaRequestError):
        build_search_request("x", type=legacy)
    assert q.requests == []


@pytest.mark.parametrize("t", ["auto", "lite", "deep-lite", "deep"])
def test_allowed_types_pass(t: str) -> None:
    assert build_search_request("x", type=t)["type"] == t


@pytest.mark.parametrize(
    "kw",
    [
        {"category": "company", "start_published_date": "2026-01-01T00:00:00Z"},
        {"category": "company", "end_published_date": "2026-01-01T00:00:00Z"},
        {"category": "people", "start_published_date": "2026-01-01T00:00:00Z"},
        {"category": "people", "exclude_domains": ["x.com"]},
    ],
)
def test_forbidden_category_filter_combinations(kw: dict[str, Any]) -> None:
    with pytest.raises(ExaRequestError):
        build_search_request("x", **kw)


def test_news_with_dates_and_people_include_domains_allowed() -> None:
    body = build_search_request(
        "x", category="news", start_published_date="2026-01-01T00:00:00Z"
    )
    assert body["category"] == "news"
    assert body["startPublishedDate"] == "2026-01-01T00:00:00Z"


@pytest.mark.parametrize("n", [0, 101])
def test_num_results_bounds(n: int) -> None:
    with pytest.raises(ExaRequestError):
        build_search_request("x", num_results=n)
    for ok in (1, 100):
        assert build_search_request("x", num_results=ok)["numResults"] == ok


def test_deprecated_fields_never_built() -> None:
    search_body = build_search_request(
        "x",
        type="deep",
        category="news",
        num_results=100,
        include_domains=["a.com"],
        exclude_domains=["b.com"],
        start_published_date="2026-01-01T00:00:00Z",
        contents={"highlights": True, "text": {"maxCharacters": 500}},
        output_schema={"type": "text"},
        system_prompt="sys",
        objective="obj",
        user_identifier="abc_123",
        stream=True,
        moderation=True,
        additional_queries=["q2"],
    )
    assert DEPRECATED_FIELDS.isdisjoint(search_body), search_body
    # subpages/subpageTarget are DEPRECATED on /search but live on /contents
    contents_body = build_contents_request(
        ["https://a.com"],
        text=True,
        highlights={"query": "q"},
        summary={"query": "s"},
        extras={"links": 5},
        subpages=2,
        subpage_target=["docs"],
        max_age_hours=0,
        user_identifier="abc_123",
    )
    forbidden_on_contents = DEPRECATED_FIELDS - {"subpages"}
    assert forbidden_on_contents.isdisjoint(contents_body), contents_body


def test_contents_request_requires_some_targets() -> None:
    with pytest.raises(ExaRequestError):
        build_contents_request()
    with pytest.raises(ExaRequestError):
        build_contents_request(["https://a.com"] * 101)
    assert build_contents_request(["https://a.com"])["urls"] == ["https://a.com"]
    assert build_contents_request(ids=["d1"])["ids"] == ["d1"]


def test_search_requires_query_and_domain_list_limits() -> None:
    with pytest.raises(ExaRequestError):
        build_search_request("")
    with pytest.raises(ExaRequestError):
        build_search_request("x", include_domains=["d"] * 1201)


def test_output_schema_validated_at_build() -> None:
    from app.modules.providers.exa.schema_limits import SchemaLimitError

    with pytest.raises(SchemaLimitError):
        build_search_request("x", output_schema={"type": "array"})


def test_user_identifier_shape_and_hash() -> None:
    uid = user_identifier("ws_demo")
    assert uid != "ws_demo"
    assert len(uid) <= 64
    assert all(c.isalnum() or c in "_-" for c in uid)
    with pytest.raises(ExaRequestError):
        build_search_request("x", user_identifier="has spaces!")


# --------------------------------------------------------------- client


def test_api_key_header_sent_and_never_leaks(
    caplog: pytest.LogCaptureFixture,
) -> None:
    q = Queue(httpx.Response(200, json=ok_body()), httpx.Response(
        400, json={"requestId": "req-bad", "error": "bad request", "tag": "X"}
    ))
    records: list[ProviderCallRecord] = []
    client = make_client(q, records)
    with caplog.at_level(logging.DEBUG):
        res = run(client.search(build_search_request("acme")))
        assert res.request_id == "req-1"
        with pytest.raises(ExaRejected) as ei:
            run(client.search(build_search_request("acme")))
    sent = q.requests[0].headers["x-api-key"]
    assert sent == SENTINEL
    assert SENTINEL not in caplog.text
    assert SENTINEL not in str(ei.value)
    assert SENTINEL not in repr(ei.value)


def test_retry_429_then_200_honours_retry_after() -> None:
    q = Queue(
        httpx.Response(429, headers={"Retry-After": "2.5"},
                       json={"requestId": "r0", "error": "rl", "tag": "RATE"}),
        httpx.Response(200, json=ok_body()),
    )
    records: list[ProviderCallRecord] = []
    sleeps: list[float] = []
    client = make_client(q, records, sleeps)
    res = run(client.search(build_search_request("acme")))
    assert res.request_id == "req-1"
    assert len(q.requests) == 2
    assert sleeps == [2.5]
    assert [r.status_code for r in records] == [429, 200]


def test_503_exhausts_attempts() -> None:
    q = Queue(*[
        httpx.Response(503, json={"requestId": "rx", "error": "up", "tag": "T"})
        for _ in range(3)
    ])
    client = make_client(q, [], [], max_attempts=3)
    with pytest.raises(ExaUnavailable):
        run(client.search(build_search_request("acme")))
    assert len(q.requests) == 3


def test_timeout_is_retried_then_succeeds() -> None:
    request = httpx.Request("POST", "https://api.exa.ai/search")
    q = Queue(httpx.ReadTimeout("boom", request=request),
              httpx.Response(200, json=ok_body()))
    client = make_client(q, [], [])
    assert run(client.search(build_search_request("acme"))).request_id == "req-1"
    assert len(q.requests) == 2


@pytest.mark.parametrize(
    "status,exc",
    [(402, ExaOutOfCredits), (400, ExaRejected), (401, ExaAuth), (403, ExaAuth)],
)
def test_no_retry_errors(status: int, exc: type[Exception]) -> None:
    q = Queue(
        httpx.Response(status, json={"requestId": "rX", "error": "m", "tag": "T"})
    )
    client = make_client(q, [], [])
    with pytest.raises(exc):
        run(client.search(build_search_request("acme")))
    assert len(q.requests) == 1


def test_error_carries_request_id_and_tag() -> None:
    q = Queue(
        httpx.Response(400, json={"requestId": "rX", "error": "m", "tag": "TAG"})
    )
    client = make_client(q)
    with pytest.raises(ExaRejected) as ei:
        run(client.search(build_search_request("acme")))
    assert ei.value.request_id == "rX"
    assert ei.value.tag == "TAG"
    assert ei.value.status_code == 400


def test_success_writes_one_provider_call_row(db: Session) -> None:
    q = Queue(httpx.Response(200, json=ok_body()))

    def record(rec: ProviderCallRecord) -> None:
        db.add(
            ProviderCall(
                id="pc_test_1",
                job_id=None,
                row_id=None,
                provider=rec.provider,
                endpoint=rec.endpoint,
                status_code=rec.status_code,
                request_id=rec.request_id,
                cost_dollars=rec.cost_dollars,
                ms=rec.ms,
            )
        )

    client = ExaClient(
        SENTINEL,
        transport=httpx.MockTransport(q),
        sleep=lambda d: asyncio.sleep(0),
        record=record,
    )
    res = run(client.search(build_search_request("acme")))
    db.flush()
    rows = list(
        db.execute(
            select(ProviderCall).where(ProviderCall.id == "pc_test_1")
        ).scalars()
    )
    assert len(rows) == 1
    row = rows[0]
    assert row.provider == "exa"
    assert row.endpoint == "/search"
    assert row.status_code == 200
    assert row.request_id == "req-1"
    assert float(row.cost_dollars) == 0.005
    assert row.ms is not None and row.ms >= 0
    assert SENTINEL not in " ".join(
        str(v) for v in (
            row.provider, row.endpoint, row.request_id, row.status_code,
            row.cost_dollars, row.ms,
        )
    )
    # response model surface
    assert res.results[0].url == "https://acme.com"


def test_warnings_logged_notices_parsed(caplog: pytest.LogCaptureFixture) -> None:
    q = Queue(httpx.Response(200, json=ok_body(
        warnings=[{"code": "IGNORED_FIELD", "path": "/x", "message": "m"}],
        notices=[{"code": "N", "path": "/q", "message": "n"}],
    )))
    client = make_client(q)
    with caplog.at_level(logging.WARNING):
        res = run(client.search(build_search_request("acme")))
    assert res.warnings[0].code == "IGNORED_FIELD"
    assert res.notices[0].code == "N"
    assert "IGNORED_FIELD" in caplog.text
    assert SENTINEL not in caplog.text


def test_contents_endpoint_and_output_grounding() -> None:
    body = ok_body(
        statuses=[{"id": "https://a.com", "status": "success", "source": "cached"}],
        output={
            "content": {"values": ["x"]},
            "grounding": [
                {"field": "values", "citations": [{"url": "u", "title": "t"}],
                 "confidence": "high"}
            ],
        },
    )
    q = Queue(httpx.Response(200, json=body))
    client = make_client(q)
    res = run(client.contents(build_contents_request(["https://a.com"], text=True)))
    assert res.statuses and res.statuses[0]["status"] == "success"
    assert res.output is not None
    assert res.output.grounding[0].confidence == "high"
    assert q.requests[0].url.path == "/contents"


def test_user_identifier_in_body_not_key() -> None:
    q = Queue(httpx.Response(200, json=ok_body()))
    client = make_client(q)
    run(client.search(build_search_request("acme", user_identifier="abc-123")))
    import json as _json
    sent = _json.loads(q.requests[0].content)
    assert sent["userIdentifier"] == "abc-123"
    assert "x-api-key" not in sent
