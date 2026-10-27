"""find_decision_makers + find_work_email (plan §7.2, G3) — fixture-driven,
no network.

Covers: value shape [{name,title,linkedinUrl,seniority}] + Leaders drafts;
zero-people -> no_data; missing inputs -> failed/missing_input with ZERO
provider calls; find_work_email tool routing (LinkedIn URL vs name+domain);
provider-miss -> no_data/None; plan_restricted -> failed carrying the
provider's code; and the NO-GUESSED-EMAIL property test (200 name/domain
pairs, provider says not found -> never a non-null value, no "@" anywhere).
"""

import json
from collections import deque
from pathlib import Path
from typing import Any

from app.config import Settings
from app.modules.enrichment.executors.base import (
    ColumnConfig,
    ExecContext,
    ProviderCallRecord,
    RowSnapshot,
)
from app.modules.enrichment.executors.find_decision_makers import (
    DEFAULT_SENIORITY,
    FindDecisionMakers,
)
from app.modules.enrichment.executors.find_work_email import FindWorkEmail
from app.modules.providers.moltsets import models
from app.modules.providers.moltsets.errors import MoltSetsError

FIXTURES = Path(__file__).resolve().parents[2] / "fixtures" / "moltsets"


def body(tool: str, case: str) -> dict[str, Any]:
    path = FIXTURES / tool / f"{case}.synthetic.json"
    return json.loads(path.read_text(encoding="utf-8"))["response"]


def people(body_dict: dict[str, Any]) -> models.PeopleResponse:
    return models.parse_people_response(body_dict)


def email(body_dict: dict[str, Any]) -> models.EmailResponse:
    return models.parse_email_response(body_dict)


class FakeMoltSets:
    """Sync gateway matching SyncMoltSetsClient's interface; records which
    tool was called with what kwargs and replays typed responses/errors."""

    def __init__(
        self,
        responses: dict[str, deque[Any]] | None = None,
        fail: Exception | None = None,
    ) -> None:
        self.responses = responses or {}
        self.calls: list[tuple[str, dict[str, Any]]] = []
        self.fail = fail
        self.records: list[ProviderCallRecord] = []

    def _record(self, record: Any) -> None:
        if record is not None:
            rec = ProviderCallRecord(
                provider="moltsets", endpoint="t", status_code=200,
                request_id="fx", ms=1,
            )
            record(rec)
            self.records.append(rec)

    def search_people(self, record: Any = None, **kw: Any) -> models.PeopleResponse:
        self.calls.append(("search_people", kw))
        self._record(record)
        if self.fail is not None:
            raise self.fail
        return self.responses["search_people"].popleft()

    def linkedin_to_business_email(
        self, linkedin_url: str, record: Any = None, **kw: Any
    ) -> models.EmailResponse:
        self.calls.append(("linkedin_to_business_email", {"linkedin_url": linkedin_url, **kw}))
        self._record(record)
        if self.fail is not None:
            raise self.fail
        return self.responses["linkedin_to_business_email"].popleft()

    def search_business_email_by_name(
        self, record: Any = None, **kw: Any
    ) -> models.EmailResponse:
        self.calls.append(("search_business_email_by_name", kw))
        self._record(record)
        if self.fail is not None:
            raise self.fail
        return self.responses["search_business_email_by_name"].popleft()


def ctx(settings: Settings) -> ExecContext:
    return ExecContext(
        job_id="job_t", workspace_id="ws_demo", run_id="run_t", settings=settings
    )


def col(
    enrichment_id: str, col_type: str = "people", params: dict[str, Any] | None = None
) -> ColumnConfig:
    return ColumnConfig(
        id="c1", key="k", label="L", type=col_type,
        enrichment_id=enrichment_id, prompt=None, params=params,
    )


ACME = RowSnapshot(
    id="r1", data={"name": "Acme", "domain": "acme.io"},
    normalized_domain="acme.io",
)

LEADER_WITH_URL = RowSnapshot(
    id="L1",
    data={
        "name": "Ada Lovelace", "linkedinUrl": "https://www.linkedin.com/in/ada",
        "companyDomain": "acme.io",
    },
    normalized_domain=None,
)
LEADER_NAME_DOMAIN = RowSnapshot(
    id="L2",
    data={"name": "Grace Hopper", "companyDomain": "acme.io"},
    normalized_domain=None,
)


# ------------------------------------------------------ find_decision_makers


def test_decision_makers_succeeds_with_people(settings: Settings) -> None:
    fake = FakeMoltSets({
        "search_people": deque([people(body("search_people", "example-com"))])
    })
    res = FindDecisionMakers(fake).execute(
        ACME, col("find_decision_makers"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.provenance == "provider_reported"
    assert isinstance(res.value, list) and len(res.value) == 3
    # plan-exact value shape
    assert res.value[0] == {
        "name": "Ada Lovelace",
        "title": "Chief Executive Officer",
        "linkedinUrl": "https://www.linkedin.com/in/ada-lovelace-example",
        "seniority": "C Suite",
    }
    # the UI renders "{first} + {n-1} more" from this list
    assert res.value[0]["name"] == "Ada Lovelace" and len(res.value) - 1 == 2
    # one LeaderDraft per person, linked via the caller's company row
    assert len(res.leaders) == 3
    ada = res.leaders[0]
    assert ada.name == "Ada Lovelace"
    assert ada.linkedin_url == "https://www.linkedin.com/in/ada-lovelace-example"
    assert ada.email == "ada.lovelace@example.com"  # provider-returned
    assert ada.status == "Verified"
    assert ada.company_domain == "example.com"
    assert res.leaders[1].email is None and res.leaders[1].status is None
    # request shape: the documented filters
    tool, kw = fake.calls[0]
    assert tool == "search_people"
    assert kw["company_domain"] == ["acme.io"]


def test_decision_makers_default_seniority_exact(settings: Settings) -> None:
    fake = FakeMoltSets({
        "search_people": deque([people(body("search_people", "example-com"))])
    })
    FindDecisionMakers(fake).execute(ACME, col("find_decision_makers"), ctx(settings))
    assert fake.calls[0][1]["seniority"] == [
        "C Suite", "VP", "Head", "Director", "Owner",
    ]
    assert DEFAULT_SENIORITY == ["C Suite", "VP", "Head", "Director", "Owner"]


def test_decision_makers_params_limit_capped_and_filters(settings: Settings) -> None:
    fake = FakeMoltSets({
        "search_people": deque([people(body("search_people", "example-com"))])
    })
    params = {"limit": 99, "department": ["Sales"], "title": "vp sales", "offset": 5}
    FindDecisionMakers(fake).execute(
        ACME, col("find_decision_makers", params=params), ctx(settings)
    )
    kw = fake.calls[0][1]
    assert kw["limit"] == 25
    assert kw["department"] == ["Sales"]
    assert kw["title"] == "vp sales"
    assert kw["offset"] == 5


def test_decision_makers_zero_people_no_data(settings: Settings) -> None:
    fake = FakeMoltSets({
        "search_people": deque([people(body("search_people", "no-match"))])
    })
    res = FindDecisionMakers(fake).execute(
        ACME, col("find_decision_makers"), ctx(settings)
    )
    assert res.status == "no_data"
    assert res.value is None
    assert res.leaders == []


def test_decision_makers_missing_domain_zero_calls(settings: Settings) -> None:
    fake = FakeMoltSets()
    row = RowSnapshot(id="r9", data={"name": "Acme"}, normalized_domain=None)
    res = FindDecisionMakers(fake).execute(
        row, col("find_decision_makers"), ctx(settings)
    )
    assert res.status == "failed"
    assert res.error is not None and res.error.code == "missing_input"
    assert fake.calls == []


def test_decision_makers_provider_error_failed_code(settings: Settings) -> None:
    fake = FakeMoltSets(
        fail=MoltSetsError("search_people", 403, "plan_restricted", "not on plan")
    )
    res = FindDecisionMakers(fake).execute(
        ACME, col("find_decision_makers"), ctx(settings)
    )
    assert res.status == "failed"
    assert res.error is not None and res.error.code == "plan_restricted"


# ----------------------------------------------------------- find_work_email


def test_work_email_uses_linkedin_url_capability(settings: Settings) -> None:
    fake = FakeMoltSets({
        "linkedin_to_business_email": deque([
            email(body("linkedin_to_business_email", "found"))
        ])
    })
    res = FindWorkEmail(fake).execute(
        LEADER_WITH_URL, col("find_work_email", "email"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.value == "ada.lovelace@example.com"
    assert res.provenance == "provider_reported"
    assert [c[0] for c in fake.calls] == ["linkedin_to_business_email"]
    assert fake.calls[0][1]["linkedin_url"] == "https://www.linkedin.com/in/ada"


def test_work_email_uses_name_domain_capability(settings: Settings) -> None:
    fake = FakeMoltSets({
        "search_business_email_by_name": deque([
            email(body("search_business_email_by_name", "found"))
        ])
    })
    res = FindWorkEmail(fake).execute(
        LEADER_NAME_DOMAIN, col("find_work_email", "email"), ctx(settings)
    )
    assert res.status == "succeeded"
    assert res.value == "ada.lovelace@example.com"
    tool, kw = fake.calls[0]
    assert tool == "search_business_email_by_name"
    assert kw == {"name": "Grace Hopper", "company_domain": "acme.io"}


def test_work_email_neither_input_zero_calls(settings: Settings) -> None:
    fake = FakeMoltSets()
    row = RowSnapshot(id="L3", data={"title": "CEO"}, normalized_domain=None)
    res = FindWorkEmail(fake).execute(
        row, col("find_work_email", "email"), ctx(settings)
    )
    assert res.status == "failed"
    assert res.error is not None and res.error.code == "missing_input"
    assert fake.calls == []


def test_work_email_provider_miss_no_data(settings: Settings) -> None:
    fake = FakeMoltSets({
        "linkedin_to_business_email": deque([
            email(body("linkedin_to_business_email", "not-found"))
        ])
    })
    res = FindWorkEmail(fake).execute(
        LEADER_WITH_URL, col("find_work_email", "email"), ctx(settings)
    )
    assert res.status == "no_data"
    assert res.value is None
    assert res.provenance == "provider_reported"


def test_work_email_plan_restricted_failed_provider_code(
    settings: Settings,
) -> None:
    fake = FakeMoltSets(
        fail=MoltSetsError(
            "linkedin_to_business_email", 403, "plan_restricted", "not on plan"
        )
    )
    res = FindWorkEmail(fake).execute(
        LEADER_WITH_URL, col("find_work_email", "email"), ctx(settings)
    )
    assert res.status == "failed"
    assert res.error is not None
    assert res.error.code == "plan_restricted"  # provider's own code, verbatim


# ------------------------------------------- NO-GUESSED-EMAIL property test


def test_no_guessed_email_property(settings: Settings) -> None:
    """200 generated (name, domain) pairs with the provider returning
    ``not_found`` — the executor must NEVER return a non-null value and no
    string containing "@" may appear anywhere in the result."""
    miss = deque()
    for _ in range(200):
        miss.append(email(body("search_business_email_by_name", "not-found")))
        miss.append(email(body("linkedin_to_business_email", "not-found")))
    fake = FakeMoltSets({
        "search_business_email_by_name": miss,
        "linkedin_to_business_email": miss,
    })
    executor = FindWorkEmail(fake)
    first_names = [
        "Ada", "Grace", "Alan", "Edsger", "Barbara", "Donald", "Radia",
        "Margaret", "Katherine", "Anita",
    ]
    last_names = [
        "Lovelace", "Hopper", "Turing", "Dijkstra", "Liskov", "Knuth",
        "Perlman", "Hamilton", "Johnson", "Borg",
    ]
    for i in range(200):
        name = f"{first_names[i % 10]} {last_names[(i // 10) % 10]}"
        row = RowSnapshot(
            id=f"pg{i}",
            data={"name": name, "companyDomain": f"d{i}.example.com"},
            normalized_domain=None,
        )
        if i % 2:  # alternate: half take the linkedin_url path
            row = RowSnapshot(
                id=f"pg{i}",
                data={
                    "name": name,
                    "linkedinUrl": f"https://www.linkedin.com/in/p{i}",
                    "companyDomain": f"d{i}.example.com",
                },
                normalized_domain=None,
            )
        res = executor.execute(row, col("find_work_email", "email"), ctx(settings))
        assert res.status == "no_data", f"pair {i}: status {res.status}"
        assert res.value is None, f"pair {i}: guessed {res.value!r}"
        serialized = json.dumps(
            {
                "value": res.value,
                "sources": [s.__dict__ for s in res.sources],
                "error": res.error.__dict__ if res.error else None,
            }
        )
        assert "@" not in serialized, f"pair {i}: '@' leaked into result"
    assert len(fake.calls) == 200
