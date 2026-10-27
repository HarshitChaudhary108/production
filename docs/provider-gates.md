# Provider gates — results log

Plan §5.3 requires gates G1–G4 to pass **before the dependent
enrichments are switched on**.

**Status: G1 not run · G2 not run · G3 PASS · G4 not run.** Every results
table below is blank for the human; hit-rate thresholds are **Q5 — not
yet set by the team**, so G1/G2/G4 may not be marked PASS until a
reviewer signs a row. G3 (the MoltSets contract gate) has no hit-rate
threshold — its pass conditions are doc-derived and are all met (see the
G3 section).

The Exa gate key is read from `EXA_API_KEY` in the environment or
`backend/.env`; the MoltSets key from `MOLTSETS_API_KEY` (`scripts/*`
call `load_dotenv()`; never commit a value).

## Sample input files

Every gate reads its sample from a CSV under
`backend/tests/fixtures/gates/` — fill these from the team's real lists
(§5.3); **do not use well-known demo companies**:

| file | columns | required rows | gate |
|---|---|---|---|
| `backend/tests/fixtures/gates/g1_domains.csv` | `domain` | >= 30 | G1 |
| `backend/tests/fixtures/gates/g2_companies.csv` | `name,domain` | >= 20 | G2 |
| `backend/tests/fixtures/gates/g4_domains.csv` | `domain` | >= 20 | G4 |

`python -m scripts.run_provider_gate <gate>` (run from `backend/`)
**refuses to run** when the CSV has fewer data rows than required —
a gate result is only meaningful against the full sample. The runner
prints the CSV's row count and sha256 prefix; paste both into the
results table so a recorded result is tied to an exact sample file.
Each row's request is identical to what the executor sends in
production, and one `.recorded.json` fixture per row lands under
`tests/fixtures/exa/<enrichment_id>/`.

---

## G1 — Exa entity resolution — status: not run

**Test (§5.3):** Exa `category: company` for 30 known domains from the
team's real lists. Hit-rate threshold set by the team (Q5, CONFIRM)
where the result URL host == the input domain.

**Executor/call:** the entity-lookup path shared by `find_snapshot`,
`find_revenue` and `find_funding` step 1 — `POST /search` with
`type: "auto"`, `category: "company"`, `includeDomains: [<domain>]`,
`numResults: 3`, `query: "<domain>"`.

**Hit rule:** at least one of the 3 returned results has a URL whose
host == the input domain (same rule as `common.host_matches_domain`).

**Command** (reads `g1_domains.csv`, makes 30 calls):

```bash
cd backend
python -m scripts.run_provider_gate g1
```

Single-record variant (one domain, via `record_provider_fixture.py` —
same request body; useful for spot checks, NOT a gate run):

```bash
python -m scripts.record_provider_fixture find_snapshot "$d" --gate g1
```

**Results:**

| date | csv rows | csv sha256 | hits | hit-rate | threshold (Q5) | reviewer | PASS/FAIL |
|------|----------|------------|------|----------|----------------|----------|-----------|
|      |          |            |      |          |                |          |           |

**What flips on PASS:** nothing — by design. `find_company_domain`,
`find_snapshot` and `find_revenue` are `status: live` in the catalog
(no `gate_g1_*` flag exists in `Settings`). G1 is a launch-confidence
gate on the Exa `category:company` entity path they share: if it fails,
pulling those three entries is a product decision, not a config toggle.

---

## G2 — Exa LinkedIn coverage — status: not run

**Test (§5.3):** `includeDomains: ["linkedin.com"]` for 20 companies.
Pass = the company's own LinkedIn page is returned for a team-set share
(Q5); else `find_linkedin_highlights` stays disabled.

**Executor/call:** `find_linkedin_highlights` — `POST /search` with
`type: "auto"`, `includeDomains: ["linkedin.com"]`,
`query: "<name> company page"`, `contents: {"highlights": true}`,
`numResults: 3`.

**Hit rule:** at least one of the 3 returned results has a URL matching
`linkedin.com/company/…` — the executor's own acceptance rule
(`/in/…` profiles and posts do not count).

**Command** (reads `g2_companies.csv`, makes 20 calls):

```bash
cd backend
python -m scripts.run_provider_gate g2
```

Single-record variant (one company — needs both name and domain):

```bash
python -m scripts.record_provider_fixture find_linkedin_highlights \
  "$d" --gate g2 --name "Acme, Inc."
```

**Results:**

| date | csv rows | csv sha256 | hits | hit-rate | threshold (Q5) | reviewer | PASS/FAIL |
|------|----------|------------|------|----------|----------------|----------|-----------|
|      |          |            |      |          |                |          |           |

**What flips on PASS:** `gate_g2_linkedin` in `Settings` (env
`GATE_G2_LINKEDIN=true`). `find_linkedin_highlights` then appears in
`GET /enrichments/catalog`; until then it stays `status: gated`.

---

## G4 — Exa careers coverage — status: not run

**Test (§5.3):** `find_job_openings` on 20 domains. Pass = team review
of correctness (qualitative — the output must describe real openings on
the company domain, not an aggregator page).

**Executor/call:** `find_job_openings` — `POST /search` with
`type: "auto"`, `includeDomains: [<domain>]`,
`query: "careers open positions"`, `numResults: 5`, outputSchema
`{openRoleCount: number|null, gtmRoles: array of string}` plus the
canonical `systemPrompt`. Known limitation (§7.2): job boards on other
domains are out of scope — a company that only posts on
Greenhouse/Lever reports no coverage; note that per row rather than
counting it a call failure.

**Hit rule (script's provisional flag):** `output.content` is a dict
with non-null `openRoleCount` AND at least one grounding citation host
matches the domain — the human reviewer still judges correctness.

**Command** (reads `g4_domains.csv`, makes 20 calls):

```bash
cd backend
python -m scripts.run_provider_gate g4
```

Single-record variant (one domain):

```bash
python -m scripts.record_provider_fixture find_job_openings "$d" --gate g4
```

**Results:**

| date | csv rows | csv sha256 | hits | hit-rate | threshold (Q5) | reviewer | PASS/FAIL |
|------|----------|------------|------|----------|----------------|----------|-----------|
|      |          |            |      |          |                |          |           |

**What flips on PASS:** `gate_g4_job_openings` in `Settings` (env
`GATE_G4_JOB_OPENINGS=true`). `find_job_openings` then appears in
`GET /enrichments/catalog`.

---

## G3 — MoltSets REST contract — status: PASS

**Test (§5.3):** read the REST docs; record real responses for
`search_people` and `linkedin_to_business_email` with
`scripts/record_provider_fixture.py`. Pass = response fields mapped in
typed models; plan rate limit known; commercial-use + data-retention
terms reviewed.

**Doc facts (developer.moltsets.com + openapi.json, read 27 Oct 2026):**

- **Base URL** `https://api.moltsets.com/api/v1/tools`; every call is
  `POST /<tool>` with a JSON body.
- **Auth** `Authorization: Bearer <key>` (`ms_…` keys) plus a REQUIRED
  `User-Agent` header (any non-empty value; missing → `403 forbidden`).
- **`search_people`** request fields used: `company_domain[]`,
  `seniority[]`, `department[]`, `title` (string or list), `limit`
  (≤25), `offset`. Response: `results.results[]` persons
  (`full_name`, `title`, `seniority`, `linkedin_url`, `business_email`,
  `business_email_risk_score`, `last_updated_at`, `company{name,domain}`,
  `_score`), `results.total`, top-level `status` (`"ok"|"not_found"`),
  `metadata.fair_use` (`records_remaining_5h`/`records_reset_5h`/
  `records_remaining_1w`/`records_reset_1w`), `metadata.tokens_*`
  (token-bound accounts only).
- **`linkedin_to_business_email`** request: `linkedin_url` (single; the
  ≤100-URL batch form is P10 scope). **`search_business_email_by_name`**
  request: `name` + `company_domain`. Both respond
  `results{email, risk_score, linkedin_url}` + `status` + `metadata`.
- **Errors** `{error:{code,message}}`: `invalid_input` (422),
  `unauthorized` (401), `insufficient_tokens` (402), `forbidden` /
  `plan_restricted` / `account_inactive` (403), `tool_not_found` (404),
  `rate_limited` / `fair_use_limit_exceeded` /
  `fair_use_requests_exceeded` / `search_concurrency_exceeded` (429),
  `internal_error` (500). A miss is HTTP 200 `status:"not_found"` —
  never an error.
- **Plan rate limit:** there is NO requests/minute. Fair Use windows
  roll per account — 5-hour and 1-week, opened by the first request —
  counted in requests and in records, split into a SEARCH pool and an
  ENRICH pool, plus a per-account concurrent-search cap (429
  `search_concurrency_exceeded`, `Retry-After: 1`). Config keys
  `moltsets_*` hold the team's plan numbers (defaults = the $27/month
  tier: 500 search records / 2.5k search requests / 1k enrich records /
  2.5k requests per 5h window, 3 concurrent searches, ×
  `moltsets_budget_fraction` headroom) — **if the actual plan differs,
  update the settings; nothing is hard-coded.**

**Commands used (3 live calls, key from `MOLTSETS_API_KEY` in `backend/.env`):**

```bash
cd backend
python -m scripts.record_provider_fixture search_people notion.so --provider moltsets --case notion-so
python -m scripts.record_provider_fixture linkedin_to_business_email notion.so --provider moltsets --linkedin-url "https://linkedin.com/in/hammererik" --case hammererik
python -m scripts.record_provider_fixture search_business_email_by_name notion.so --provider moltsets --name "Ivan Zhao" --case ivan-zhao
```

**Results (fixtures under `backend/tests/fixtures/moltsets/<tool>/`):**

| date | tool | case | response `status` | records | reviewer |
|------|------|------|-------------------|---------|----------|
| 2026-10-27 | `search_people` | `notion-so.recorded.json` | `ok` | 10 people, `total` 117 | human |
| 2026-10-27 | `linkedin_to_business_email` | `hammererik.recorded.json` | `not_found` | 0 | human |
| 2026-10-27 | `search_business_email_by_name` | `ivan-zhao.recorded.json` | `not_found` | 0 | human |

Both email lookups returned a genuine `not_found` (uncharged; the tool
was reachable — a plan restriction would be `403 plan_restricted`, not a
200 miss). The found-path field mapping is verified by the spec-shaped
`*.synthetic.json` fixtures in the same directories; the `ok`/
`not_found` envelope and person fields are verified against real
responses above.

**Terms:** commercial-use + data-retention terms reviewed by the human —
confirmed 2026-10-27.

**What flips on PASS:** `gate_g3_moltsets` in `Settings` (env
`GATE_G3_MOLTSETS=true`). `find_decision_makers` and `find_work_email`
then appear in `GET /enrichments/catalog`; until the flag is set they
stay `status: gated` and `POST /enrichments/runs` rejects them
(`unknown_enrichment`). The flag defaults to `false`; the human sets it
in the deployment env when ready.

---

## Live smoke test for P5

P5's done-when includes "a live smoke test on 3 rows (manual, keys in
env)" (§11). To be run and filled in during P5 — do not run early.
Status: **not run** (no live calls during the build).

**Keys to set** (env or `backend/.env`):

- `DATABASE_URL` — normal app env (e.g. `postgresql+psycopg://…/outmate`).
- `EXA_API_KEY` — the live Exa key; this is the only provider the smoke
  uses.
- `MOLTSETS_API_KEY` — required by `Settings` to boot even though no
  smoke column calls MoltSets; any placeholder string works.
- Optional: `CACHE_TTL_SECONDS='{"find_company_news": 3600}'` if you
  want to see the cache path; leave unset for the default (cache fully
  off — every run calls Exa).

**Steps:**

1. `cd backend && alembic upgrade head` (fresh DB) — migrations create
   `enrichment_runs`, `enrichment_cache` and `credit_ledger` (ledger
   stays empty; SA-1).
2. Start API + worker:
   `uvicorn app.main:create_app --factory` and, in a second shell,
   `python -m app.worker.main`.
3. Via the app UI (or SQL through the sheets service only), create a
   `companies` sheet and seed **3 real company rows** (name + domain).
4. `POST /api/v1/enrichments/runs` over those 3 `rowIds` with a small
   set of live catalog columns (suggested: `find_snapshot`,
   `find_pricing`, `find_company_news` — one entity-resolution, one
   verified-domain, one third-party/news path). Expect `202` with
   `{runId, jobId, estimatedCredits, status:"queued"}` and
   `estimatedCredits` = sum of the catalog costs for those columns.
5. Watch the job's SSE stream (`GET /api/v1/jobs/{jobId}/events`)
   until a terminal `job` event (`succeeded` or `failed`); `cell`
   events arrive per completed cell.
6. `GET /api/v1/enrichments/runs/{runId}` — check every cell: `status`
   in `succeeded|no_data|failed`, `value` populated only on success,
   `provenance` + `sources` non-null on non-empty cells, `cost` equal
   to the catalog cost on success and `0` otherwise; run-level
   `chargedCredits` = sum of succeeded cell costs.
7. `find_company_news` successes should have produced `News` rows in a
   lazily created `signals` sheet (columns: companyName, type, detail,
   source, detectedAt, confidence, freshness, relevance — last two
   null) linked via `company_row_id`.
8. `provider_calls` rows show real Exa spend per executed cell;
   `credit_ledger` must still be empty.
9. Record results below.

| date | rows | columns run | cells succeeded | cells no_data | cells failed | costDollars observed | reviewer | notes |
|------|------|-------------|-----------------|---------------|--------------|----------------------|----------|-------|
|      | 3    |             |                 |               |              |                      |          |       |

---

## Exploratory runs — NOT gate evidence

Live Exa calls made while verifying plumbing — recorded for reference
only. Fixtures live under `backend/tests/fixtures/exa/exploratory/`.

| date | sample source | sample size | hits | hit-rate | Exa calls |
|------|---------------|-------------|------|----------|-----------|
| 2026-10-27 | agent-picked demo companies | 1 (notion.so) | 1 | 100% | 1× `/search` |

Biased sample (well-known companies); do not use for enabling gates.
