# Outmate — Data Enrichment Backend: Agent Prompt Pack (`prompt.md`)

**What this is:** copy-paste prompts for a coding agent (Claude Code or similar) that build the **data enrichment slice** of the backend described in `plan.md`, one phase at a time, with tests that must pass before the next phase starts.
**Derived from:** `plan.md` (`docs/plan.md`), `docs/api-contract.md`, `server/mock-api.mjs`, `server/mock-api.test.mjs`.
**Providers:** Exa and MoltSets only. **No separate LLM** (plan §4.3).
**Current status:** **P0 and P1 are complete** — the FastAPI skeleton, contract amendments A1–A12, migrations `0001_initial`/`0002_seed`, SQLAlchemy models, and the `sheets` write path already exist and pass their tests. This pack continues at **P2**.

## Scope of this pack (what is IN and what is OUT)

**In scope — the data enrichment surface only (plan §1.1, row 1; flows §9.2; engines §6, §7, §8.2, §8.4–§8.9):**

- Canonical enrichment catalog (`GET /enrichments/catalog`)
- Enrichment runs (`POST /enrichments/runs`, `GET /enrichments/runs/:runId`) with per-cell processing via Exa/MoltSets executors
- Jobs engine: durable Postgres queue, worker, pause/resume/cancel, persisted events, SSE with `Last-Event-ID` replay
- Provenance + `CellView` (§8.5), caching (§8.6), Signals derivation (§8.7), retries/error mapping (§8.8), idempotency (§8.9)
- `GET /me` (needed by the frontend shell; minimal, seeded data)

**Out of scope — do not build:**

- **Credit ledger / charging.** `modules/credits/service.py` is never created; `credit_ledger` is never written; there is no reserve/charge/release/settle and `insufficient_credits` is never raised.
- **Deployment.** No Render/IaC/service definitions, no deploy step, no `P10` hardening/deployment phase.
- **Other surfaces:** Workspace routes (§9.5), Home/research (§9.1), Copilot (§9.3), Radar (§9.4), exports/downloads. Rows for enrichment come from `sheets.service` (P1) — how rows arrive is another surface's problem, not this pack's.
- Everything already out of scope in plan §1.2 stays out.

**Endpoint inventory this pack delivers (9):** `GET /me` · `GET /jobs/:jobId` · `GET /jobs/:jobId/events` · `POST /jobs/:jobId/pause` · `POST /jobs/:jobId/resume` · `POST /jobs/:jobId/cancel` · `GET /enrichments/catalog` · `POST /enrichments/runs` · `GET /enrichments/runs/:runId`.

---

## Scope adaptations (read first — these replace plan §8.3; do not guess around them)

| Id | Decision | Exact semantics |
|---|---|---|
| SA-1 | **No credit ledger** | `workspaces.credits_balance` stays at its seeded value. No code path reserves, charges, releases or settles credits. `modules/credits/service.py` does not exist. The `credit_ledger` table (created in P1) is never written or read. Error code `insufficient_credits` is never produced. |
| SA-2 | **Cost fields are display-only, derived — never mutated by a ledger** | `catalog.cost` stays in the catalog DTO (contract field). `cell.cost` = the catalog cost **iff** the cell ends `succeeded`, else `0` (mock semantics, unchanged). `estimatedCredits` on a run/job = Σ catalog cost over **eligible** cells (computed at creation, stored on the job/run row). `chargedCredits` = Σ `cell.cost` of succeeded cells in that run/job — a derived counter updated in the same transaction as the cell write; also equal to a read-side sum. It is informational only. |
| SA-3 | **`/me` credits are static seed values** | `GET /me` returns `{user, workspace, credits {remaining: <workspaces.credits_balance>, used: 0, reserved: 0}}`. The balance never changes in this scope. |
| SA-4 | **`provider_calls` stays as observability, not money** | Every real provider call still logs `cost_dollars` (Exa's `costDollars.total`, `requestId`, `ms`, status). This is provider-reported spend for debugging — not a ledger. |
| SA-5 | **Mock credit assertions are rewritten** | When porting `server/mock-api.test.mjs`, replace every balance/ledger assertion with the SA-2 equivalents: `chargedCredits == Σ succeeded cell catalog costs`, `cell.cost` semantics, `reserved` always absent/0. |
| SA-6 | **Cache-hit charging question (Q3) reduces to TTL only** | No credits exist to charge, so Q3 becomes "cache TTL per enrichment?" only. Cache stays OFF until TTLs are configured (PG-8). |

---

## How to use this pack

1. `docs/plan.md` already exists (created in P0). `docs/backend-paths.md` already exists — keep it current.
2. Start every new agent session with **S1 (Primer)**. Run **S2 (Preflight)** once to verify the P0/P1 state before building.
3. Run phases in the order below. Each phase = one session = one prompt block. Do not merge phases.
4. Each prompt tells the agent to read named sections of `docs/plan.md`, so the plan stays the single source of truth and the prompts only carry the phase logic, file paths, and tests.
5. A phase is done only when its **Exit gate** is green **and** all earlier phases' tests still pass.
6. When a prompt says STOP-AND-ASK, the agent must stop and use the **R2** format. You answer; then continue.

**Recommended order:** S1 → S2 → P2 → P3 → P4a (.1→.5) → P5 → P4b (when unblocked) → V1.
(P4b is skippable until MoltSets is confirmed via Q1/G3; its enrichments stay switched off.)

### Path legend (used in every file table)

| Tag | Meaning |
|---|---|
| `existing` | file already in the repo (ZIP or created in P0/P1); read it, change it only where the table says so |
| `plan` | path named in `plan.md` (§4.2 layout or §11 packets) |
| `new` | path proposed by this pack because the plan names the thing but not the file; the agent may rename it, but must update `docs/backend-paths.md` in the same commit |

All paths are relative to the **repo root** = the folder that contains `docs/api-contract.md` and `package.json`. Verified in S2.

### Phase Report (every phase ends with this, and nothing is "done" without it)

```
PHASE REPORT — <phase id>
Goal (one line):
Files created / modified (paths):
Tests added (paths) and results (counts: passed / failed / skipped):
Earlier phases' tests re-run: <command> -> <result>
Deviations from docs/plan.md (with § reference), or "none":
Open questions raised (use R2 format), or "none":
docs/backend-paths.md updated: yes / no
```

### Blockers (open questions that still matter in this scope)

| Id | Question | Blocks |
|---|---|---|
| Q1 | Is "Moldset" the MoltSets service at moltsets.com? (plan C17) | P4b |
| Q2 | Final credit prices (plan §6) — display-only now, but confirm before launch | launch |
| Q3 | Cache TTL per enrichment? (charging part is moot — SA-6) | P5 (cache stays OFF until TTLs are given) |
| Q4 | `run_max_rows` (suggested 500) | P5 |
| Q5 | Hit-rate thresholds for gates G1, G2, G4 | enabling gated items |
| Q6 | Label `find_tech_stack` as "Technologies mentioned"? | enabling that item |
| Q9 | Idempotency key reused with different body: return original (default, mock behaviour) or 409? | P2 |
| N4 | Base columns for the Leaders and Signals sheets | P5 (Signals), P4b (Leaders) |

**Assumed already answered during P0/P1:** N1 (CI provider), N2 (test Postgres provisioning), N3 (empty-edit semantics), Q11 (missing reference docs). If any is actually unresolved, S2 will surface it — treat as a blocker.

### Gaps and corrections from `plan.md` that apply in this scope

| Id | Finding | How the prompts handle it |
|---|---|---|
| PG-1 | Plan P2's "done when" uses `POST /enrichments/runs`, but that route is built in P5 | P2 uses a **test-only** run entry point; P5 swaps in the real route and re-runs the same tests unchanged |
| PG-4 | Plan says "upsert into the project's Leaders sheet" and "Signals sheet" but not how they are created | Created lazily through the sheets service; base columns need N4 |
| PG-8 | Cache TTL values were deliberately not set in the plan | Cache OFF by default; turns on only when TTLs are configured |
| PG-9 | `ExecResult` (plan §7.1) has no place for the Signals data that plan §8.7 needs | P4a adds `signals: list[SignalDraft]` (empty except news and funding step 2) |

### Hardening additions NOT in the plan (veto any by deleting the bullet)

- **H4 No secrets in logs (P2, P4a, P4b, V1):** tests assert API key values never appear in logs, error bodies or `provider_calls` rows.
- **H5 Request id (P2):** worker log lines carry `job_id` / `row_id` / provider `requestId`; API responses carry an `X-Request-Id` header. Structured logs only; no provider bodies logged.

---

# SECTION A — Setup prompts

## S1 — Primer (paste first in every new session)

> **What:** We give the AI helper a rulebook before it writes any code.
> **Why:** So it can't invent facts — it must use the plan, ask when unsure, and show proof (tests) for everything.

**Goal:** every session starts with the same non-negotiable rules from `plan.md` §0 plus this pack's scope.
**Paths:** none (read-only).

```
ROLE
You are a senior AI/backend engineer building the DATA ENRICHMENT slice of the Outmate backend (Python, FastAPI, PostgreSQL) for the existing React frontend in this repo. P0 (skeleton, contract amendments) and P1 (schema, sheets write path) are already done.

SOURCES OF TRUTH (in this order)
1. docs/plan.md                      the plan. Read the sections named in each task before coding.
2. docs/api-contract.md              the API contract including "Amendments for backend v1" (A1-A12).
3. server/mock-api.mjs and server/mock-api.test.mjs   behavioural oracle for the enrichment lifecycle.
4. Provider docs                     Exa OpenAPI: https://exa.ai/docs/exa-spec.yaml   MoltSets: https://developer.moltsets.com
5. docs/backend-paths.md             living registry of file paths. You keep it current.
6. docs/prompt.md "Scope adaptations" SA-1 to SA-6    replace plan section 8.3 for this build.
If two sources conflict, STOP and ask (format R2). Never resolve a conflict by guessing.

SCOPE (hard boundary)
- Build ONLY: GET /me, the 5 job endpoints, GET /enrichments/catalog, POST /enrichments/runs, GET /enrichments/runs/:runId, plus the worker, executors, providers, cache, signals and idempotency behind them.
- NO credit ledger: no reserve/charge/release/settle, no modules/credits/service.py, no writes to credit_ledger, never raise insufficient_credits. Cost fields follow SA-2 exactly (cell.cost = catalog cost iff succeeded else 0; chargedCredits is a derived sum, informational only).
- NO deployment artifacts, NO other surfaces (workspace, projects, copilot, radar, exports/downloads).
- Out-of-scope features stay out (docs/plan.md section 1.2), even if the UI shows a button for them.

HARD RULES (from docs/plan.md section 0)
1. Do not invent endpoints, request/response fields, prices, rate limits, scores, or data. If a fact is not in the plan, the repo, or the provider docs, STOP and ask.
2. Provider docs are the source of truth for provider shapes. Read them before writing an adapter.
3. Keep the shapes in docs/api-contract.md. Implement only the amendments A1-A12 listed in docs/plan.md section 3.
4. Port the mock server's tests before writing provider code (with the SA-5 rewrites).
5. Every non-empty cell has a provenance class and a source. An empty result is status no_data. Never guess a value.
6. Never pattern-guess an email. Provider-returned = provider_reported. Read on a cited page = verified. Otherwise the cell is empty.
7. Only the sheets module (backend/app/modules/sheets/) writes the tables sheets, columns, rows, cells, cell_sources.
8. Never commit, print or log secret values. Refer to environment variable names only.
9. If outmate_spec_v1.3.md, outmate_tech_v1.4.md or the original "plan (6).md" exist in the workspace, read them. If they conflict with docs/plan.md, STOP and ask.

WORKING RULES
- One phase per session. Do not start work that belongs to another phase.
- Before coding: restate the phase goal, list the files you will create or modify, and check them against docs/backend-paths.md.
- For logic that has a written spec in the plan, write the failing test first, then implement.
- Never call live provider APIs from tests or CI. Live calls happen only when the human has put keys in the environment and said "go", on at most 3 rows.
- Anything the plan does not specify is a STOP-AND-ASK, unless it is a pure engineering tuning value (timeouts, batch sizes, lease seconds); for those choose a sensible default, put it in config, and list it in the Phase Report as "engineering default, not in plan".
- At the end: run lint, type check, this phase's tests AND every earlier phase's tests; update docs/backend-paths.md; print the PHASE REPORT.

Reply "READY" and nothing else.
```

**Exit gate:** agent replies `READY`.

---

## S2 — Preflight (read-only, run once)

> **What:** The AI checks the project folder, the plan's file references, the finished P0/P1 work, and the machine before building anything.
> **Why:** If the land doesn't match the blueprint, every later step is wasted — better to find out now.

**Goal:** prove the repo, the oracle tests, the P0/P1 exit gates, and the environment match what the plan assumes. **No file changes.**

```
TASK: Preflight. READ-ONLY. Do not create, edit or delete any file.

1. Confirm the repo root: it contains docs/api-contract.md, docs/plan.md, docs/backend-paths.md, package.json, server/mock-api.mjs, server/mock-api.test.mjs, backend/pyproject.toml, backend/app/main.py, and backend/alembic/versions/0001_initial.py + 0002_seed.py. Print the absolute root path.
2. Run: grep -rn "fetch(\|EventSource\|axios" src/   Expected: no hits (plan section 2.1). Report any hit.
3. Run: npm run test:api   (node --test server/mock-api.test.mjs; Node >= 22). Expected: 7 tests, all passing. Report the Node version and the result.
4. Verify P0/P1 exit gates: cd backend && ruff check . && mypy app/modules && pytest -q  — all green. Then alembic upgrade head on the test database (env var from config.py) and confirm: exactly 1 workspace (credits 5000) and 1 user; tables from plan section 8.1 all present. Report versions and counts.
5. Confirm docs/api-contract.md contains "Amendments for backend v1" with A1-A12 exactly once each.
6. Environment (print yes/no or version only, never values): python3 --version; PostgreSQL availability (the DB used by backend tests); whether EXA_API_KEY is set; env var NAMES containing MOLT (names only).
7. Search the workspace for outmate_spec*, outmate_tech*, and any file named like "plan (6)". Report paths found or "none".
8. Read docs/backend-paths.md and list which paths marked for P2-P5/P4a/P4b already exist (e.g. executor or provider files that should NOT exist yet — report any surprise).

OUTPUT: a PREFLIGHT REPORT with sections: Root, Grep result, Mock tests result, P0/P1 gate status, Amendments check, Environment, Missing reference docs, Unexpected existing files, and open blockers (Q1, Q3, Q4, Q5, Q6, Q9, N4).
```

**Exit gate (you verify):** 7/7 mock tests pass · P0/P1 backend suite green · no surprise enrichment files exist · open blockers listed.

---

# SECTION B — Build phases

## P2 — Jobs engine, SSE, and `/me` (no credit ledger)

> **What:** We build the job queue, the worker that does the jobs, and live progress streaming.
> **Why:** Enrichment takes time — we need to show progress, survive crashes, and let users pause or cancel.

**Goal:** a durable job system (Postgres queue + worker + SSE with replay) proven with a fake executor before any real provider exists. **No credits are reserved or charged (SA-1/SA-2).**
**Depends on:** P1 (done). **Read in plan:** §8.2, §8.9, §11 (P2), §12; `server/mock-api.mjs` (`createRun`, `advance`, `processCell`, `settle`, `finish`, `cancelJob`, `shouldFail`) and `server/mock-api.test.mjs`. **Read in this pack:** Scope adaptations SA-1–SA-6.

| Path | Action | Tag |
|---|---|---|
| `backend/app/modules/jobs/service.py` | create job/items, state machine, pause/resume/cancel | new |
| `backend/app/modules/jobs/queue.py` | claim with `FOR UPDATE SKIP LOCKED`, leases, recovery | new |
| `backend/app/modules/jobs/events.py` | persist events, `NOTIFY` | new |
| `backend/app/modules/jobs/sse.py` | replay + live stream | new |
| `backend/app/idempotency.py` | idempotency helper over `idempotency_keys` | new |
| `backend/app/worker/main.py` | worker loop | plan |
| `backend/app/api/jobs.py` | `GET /jobs/:id`, `GET /jobs/:id/events`, `POST /jobs/:id/pause\|resume\|cancel` | plan |
| `backend/app/api/me.py` | `GET /me` | plan |
| `backend/app/logging.py` | request-id middleware + structured worker logs (H5) | new |
| `backend/tests/support/fake_executor.py` | deterministic fake (mirrors mock `shouldFail`) | new |
| `backend/tests/support/test_routes.py` | TEST-ONLY `POST /enrichments/runs` entry point (PG-1) | new |
| `backend/tests/contract/test_job_lifecycle.py` | ported mock tests 2–7 with SA-5 assertions | plan |
| `backend/tests/integration/test_sse.py`, `test_worker_recovery.py` | SSE and crash tests | new |
| `backend/tests/unit/test_idempotency.py`, `test_job_state_machine.py`, `test_cost_fields.py` | unit tests | new |

**Logic**
- **Job state machine:** `queued → running → (paused ↔ running) → succeeded | failed | cancelled`. `succeeded` if at least one item succeeded or ended `no_data`; `failed` only if every item failed.
- **Worker loop (plan §8.2, minus credits):** claim pending items of running jobs with `FOR UPDATE SKIP LOCKED`; set `running` + `lease_until`; execute under a per-provider async rate limiter and `max_concurrency`; in ONE transaction: write the cell via `sheets.service.write_enrichment_result`, insert `cell_sources`, insert `provider_calls`, set `cell.cost` (catalog cost iff `succeeded` else `0`, per SA-2) and increment the job/run `charged_credits` by that amount, mark the item done, update job progress/steps, insert `job_events`, then `NOTIFY`. Expired leases return to `pending` with `attempts+1`; after `max_attempts` the item ends with cell `failed` / `provider_unavailable`.
- **Pause:** workers skip the job; running items finish. **Cancel (C7):** pending items → `cancelled` (cell `cancelled`, cost 0); running items finish and keep `succeeded` cost semantics; then the job settles (final status + summary; NO ledger work).
- **SSE:** on connect replay `job_events` with `seq > Last-Event-ID` (header or `?lastEventId=`), then stream live. Event frame: `id: <seq>`, `event: <name>`, `data: <json>`. Names: `progress`, `step`, `cell` (A1), `token`, `done`, `error`. First event is always a `progress` snapshot; terminal jobs send snapshot + `done` and close; heartbeat comment `: ping`.
- **Idempotency (plan §8.9):** same `(workspace, Idempotency-Key)` → return the stored response with the same status. Different body with the same key: return the original and log a warning (default for Q9).
- **`/me` (SA-3):** `{user, workspace, credits {remaining: <seeded balance>, used: 0, reserved: 0}}`.
- **`estimated_credits` / `charged_credits` (SA-2):** `estimated_credits` is set at job/run creation = Σ test-catalog cost over eligible cells. `charged_credits` starts 0 and is incremented by `cell.cost` in the same transaction as each succeeded cell write. Both are informational.

```
TASK: Phase P2 — jobs engine, SSE, /me. NO credit ledger (SA-1/SA-2 in docs/prompt.md).
Read first: docs/plan.md sections 8.2, 8.9, 11 (P2), 12; docs/prompt.md scope adaptations SA-1 to SA-6; server/mock-api.mjs and server/mock-api.test.mjs in full.
NOTE (PG-1): the plan's done-when for P2 uses POST /enrichments/runs, which is built in P5. In this phase create a TEST-ONLY entry point at backend/tests/support/test_routes.py that mounts a minimal POST /enrichments/runs using the fake executor, creating job + items through the jobs service. P5 will replace it with the real route and re-run the same tests unchanged. Never register the test route in app code.

1. Implement the job state machine, queue, worker, events and SSE exactly as in docs/plan.md section 8.2, minus every credit reserve/charge/settle step (replaced by SA-2: cell.cost on succeeded + derived charged_credits, all inside the same transaction as the cell write). Use Postgres only: no Redis, Celery, Temporal, LangGraph.
2. Executor interface: define the Protocol/ABC for executors in backend/app/modules/enrichment/executors/base.py with the ExecResult shape from docs/plan.md section 7.1 (status succeeded|no_data|failed, value, provenance, confidenceLabel, sources, providerCalls, error). The worker only knows this interface.
3. API: GET /jobs/:jobId (id, type, status, progress {done,total,unit}, steps, estimatedCredits, chargedCredits, summary, error), GET /jobs/:jobId/events (text/event-stream), POST /jobs/:jobId/pause|resume|cancel (409 invalid_state when not applicable, as in the mock), GET /me per SA-3. Job type values: research, chat, enrichment, run_cells. Status "paused" exists (A2); SSE event "cell" exists (A1).
4. Job steps: one step per enrichment column; mock behaviour: meta "<done> of <total>", status running | done | completed_with_errors. Job summary: the mock's {succeeded, failed} plus noData (additive; record in docs/backend-paths.md).
5. Fake executor (backend/tests/support/fake_executor.py): deterministic scripted outcomes keyed by (enrichment_id, company name). Create the mock's five demo companies (Acme, RevenueFlow, Northwind Labs, Brightpath, Strata) through sheets.service. Scripted: (find_linkedin_highlights, Brightpath) -> no_data; (find_revenue, Strata) -> no_data; any enrichment on "Boom Corp" -> failed/provider_unavailable. Everything else succeeds with the mock's sample value. Test cost map (SA-2): find_funding 3, find_revenue 2, find_company_news 3, find_linkedin_highlights 4.
6. Logging (H5): request-id middleware sets X-Request-Id on every response; worker log lines carry job_id, row_id and provider requestId; never log secret values or provider bodies.

TESTS (write first; real PostgreSQL)
backend/tests/contract/test_job_lifecycle.py — port tests 2 to 7 of server/mock-api.test.mjs with SA-5 rewrites:
 a) a run enriches rows: 2 rows x find_funding -> both cells succeeded with cost 3; run/job view chargedCredits == 6, estimatedCredits == 6; job progress {done:2,total:2,unit:"cells"}.
 b) partial no-result: 2 rows x find_linkedin_highlights (Acme, Brightpath) -> job succeeded, summary succeeded 1 / noData 1 / failed 0; chargedCredits == 4; the Brightpath cell status no_data, cost 0.
 c) all failed: 1 row ("Boom Corp") -> job status failed; chargedCredits == 0.
 d) cancel (contract semantics, C7): 4 rows x 2 columns (estimate 20); wait for >=1 done; cancel -> status cancelled; 0 < chargedCredits < 20; pending cells status cancelled with cost 0; succeeded cells keep their cost.
 e) idempotency: same key twice -> identical response body and status; only one job exists.
 f) validation errors keep the error envelope: empty rowIds -> 422 validation_error; unknown row -> 422 unknown_row_ids with details.unknown; unknown enrichment -> 422 unknown_enrichment; duplicate column key -> 422 duplicate_column_key.
backend/tests/unit/test_cost_fields.py:
 - succeeded cell gets cost == catalog cost; no_data/failed/cancelled cells get cost 0.
 - charged_credits after settle == sum of succeeded cell costs; estimated_credits unchanged.
 - credit_ledger table has zero rows after a full run (assert count == 0 — the strongest no-ledger proof).
 - workspaces.credits_balance is unchanged after a run.
backend/tests/unit/test_job_state_machine.py: every legal transition passes; illegal ones raise invalid_state (e.g. resume a succeeded job); mixed succeeded/failed items -> succeeded; all failed -> failed.
backend/tests/integration/test_sse.py:
 - first event is a progress snapshot; events arrive in seq order; ids are the seq values.
 - reconnect with Last-Event-ID = k replays exactly events with seq > k, no duplicates, no gaps.
 - terminal job returns snapshot + done and the stream closes; done carries chargedCredits.
 - heartbeat ": ping" appears when idle (short configured interval in the test).
backend/tests/integration/test_worker_recovery.py:
 - kill the worker mid-run, restart: job completes; each cell has exactly one result; chargedCredits equals the sum of succeeded cell costs exactly once (no double count).
 - lease expiry: stuck running item returns to pending with attempts+1; after max_attempts the cell ends failed/provider_unavailable.
 - paused job's items are not claimed; resume continues.
 - two workers never process the same item twice (SKIP LOCKED).
backend/tests/unit/test_idempotency.py: replay returns stored response; different body + same key returns the original and logs a warning.
H4 check: run a full flow with a fake EXA_API_KEY set; assert the key value appears in no log line, error body or provider_calls row.

DO NOT: implement real providers, the real /enrichments/runs route, the catalog, any credit ledger code, or any route besides jobs + /me.
FINISH: all P0, P1, P2 tests green; update docs/backend-paths.md; PHASE REPORT (include engineering defaults: lease seconds, max attempts, concurrency, heartbeat interval, and the noData summary field).
```

**Exit gate:** `pytest backend/tests/contract backend/tests/unit backend/tests/integration -q` green · SSE replay and kill-worker tests green · `credit_ledger` row count is 0 and `credits_balance` unchanged in every test.

---

## P3 — Canonical enrichment catalog

> **What:** We write one official menu of every lookup we can do, with price, type and on/off switch.
> **Why:** Three screens currently show three different menus; one shared menu stops the confusion.

**Goal:** `GET /enrichments/catalog` serves the single canonical catalog from plan §6; excluded items never appear; gated items appear only when their flag is on. (`cost` stays in the DTO as contract data — display only, SA-2.)
**Depends on:** P2. **Read in plan:** §6, §3 (C1–C3), §11 (P3); `server/mock-api.mjs` `CATALOG` and `catalogView`; `server/mock-api.test.mjs` test 1.

| Path | Action | Tag |
|---|---|---|
| `backend/app/modules/catalog/registry.py` | registry (code, not a DB table) | plan |
| `backend/app/schemas/catalog.py` | `CatalogItem` DTO | new |
| `backend/app/api/enrichments.py` | `GET /enrichments/catalog` only (runs come in P5) | plan |
| `backend/app/config.py` | gate flags (G1…G4, tech-stack label) | plan |
| `backend/tests/contract/test_catalog.py` | ported test 1 + new checks | plan |

**Catalog table to implement (plan §6; prices are CONFIRM Q2, display-only):**

| id | cost | outputType | appliesTo | status |
|---|---|---|---|---|
| `find_company_domain` | 2 | link | companies | live |
| `find_snapshot` | 3 | text | companies | live |
| `find_funding` | 3 | badge | companies | live |
| `find_revenue` | 2 | text | companies | live |
| `find_company_news` | 3 | text | companies | live |
| `find_job_openings` | 3 | text | companies | gated (G4) |
| `find_social_profiles` | 2 | chips | companies | live |
| `find_core_values` | 3 | text | companies | live |
| `find_free_trial` | 2 | badge | companies | live |
| `find_pricing` | 3 | text | companies | live |
| `find_gtm_strategy` | 5 | text | companies | live |
| `find_revenue_model` | 3 | text | companies | live |
| `find_product_categories` | 2 | chips | companies | live |
| `classify_b2b_b2c` | 2 | badge | companies | live |
| `find_competitors` | 2 | chips | companies | live |
| `find_leadership_changes` | 4 | text | companies | live |
| `find_tech_stack` | 6 | chips | companies | gated (Q6) |
| `find_linkedin_highlights` | 4 | text | companies | gated (G2) |
| `find_decision_makers` | 20 | people | companies | gated (G3) |
| `find_work_email` | 3 | email | leaders | gated (G3) |
| `custom_prompt` | 3 | text | companies | live |
| `plain_value` | 0 | text | any | live |

Not in the catalog response: `website_intent`, `add_to_hubspot` (excluded). That is 17 live + 5 gated = 22 items when every gate flag is on.

```
TASK: Phase P3 — canonical enrichment catalog.
Read first: docs/plan.md sections 3 (C1, C2, C3), 6, 11 (P3); server/mock-api.mjs (CATALOG, catalogView); server/mock-api.test.mjs test "catalog exposes every enrichment as config, not an endpoint".

1. Create backend/app/modules/catalog/registry.py: a typed registry (not a DB table). Each entry: id, name, description, cost (int credits per cell — display only, SA-2), outputType (text|badge|chips|link|email|people), appliesTo (companies|leaders|any), source (exa|moltsets|user), status (live|gated), gateFlag (config key or None), requiresInputs (list), executor reference (resolved lazily; executors arrive in P4a/P4b, so unresolved executors must not break import). Implement the exact 22 entries in the table in the prompt pack for P3 / docs/plan.md section 6. Names and descriptions: reuse the mock CATALOG names/descriptions for the 12 ids the mock has; write plain descriptions for the others from the Workspace COL_TYPES descriptions in src/pages/workspace/model.ts (lines ~457-665). Do not invent marketing text.
2. Source values are the real provider: "exa", "moltsets" (find_decision_makers, find_work_email), "user" (plain_value). Never "crunchbase", "builtwith", "linkedin" (plan C3).
3. GET /enrichments/catalog returns {"data": [CatalogItem...]} with fields id, name, description, cost, outputType, appliesTo, source, status, requiresInputs (A12). Include live items always; include a gated item only when its gate flag in config is true (all false by default). Never expose executor references or any internal field.
4. Excluded items (website_intent, add_to_hubspot) are not in the registry at all.
5. Config: add boolean gate flags with default false. Names: choose and record them in docs/backend-paths.md.

TESTS (backend/tests/contract/test_catalog.py)
- Default config: response has 17 items; every item has string id, int cost >= 0, and cost > 0 for every item except plain_value (cost 0).
- All gate flags on: 22 items. Each flag turns on only its own item(s): G3 turns on both find_decision_makers and find_work_email; G2 only find_linkedin_highlights; G4 only find_job_openings; tech-stack flag only find_tech_stack.
- No item has the keys executor/sample/internal; sources are only in {exa, moltsets, user}.
- Excluded ids never appear in any configuration.
- Costs equal the table values exactly (parametrized test over all 22).
- Ids are unique; plain_value has appliesTo "any".

DO NOT: implement executors, runs, or any route besides the catalog.
FINISH: all earlier tests still green; update docs/backend-paths.md; PHASE REPORT. Remind me that every price is "CONFIRM Q2".
```

**Exit gate:** `pytest backend/tests/contract/test_catalog.py -q` green · count 17 (default) and 22 (all gates) verified.

---

## P4a — Exa adapter and Exa-based executors

> **What:** We teach the system to ask Exa questions, check the answers really are about the right company, and save the proof (links).
> **Why:** AI answers without proof can't be trusted — if there's no proof, we store "no data" instead of a guess.

**Goal:** a typed Exa client plus one tested executor per Exa-based catalog item, with citation and entity rules enforced and provider gates documented.
**Depends on:** P3. **Read in plan:** §5.1, §5.3, §7.1, §7.2, §8.7, §8.8, §11 (P4a); Exa OpenAPI `https://exa.ai/docs/exa-spec.yaml`.
**Sub-prompts:** P4a.1 client → P4a.2 entity-based → P4a.3 news/social → P4a.4 domain-scoped and AI-inferred → P4a.5 gates. Run them in order, in one phase; one Phase Report at the end of P4a.5.

**Fixture rule (applies to all P4a sub-prompts):** tests use files in `backend/tests/fixtures/exa/`. A file named `*.recorded.json` is a real response recorded by `backend/scripts/record_provider_fixture.py` (human supplies the key). A file named `*.synthetic.json` is hand-written to follow the OpenAPI schema exactly. Synthetic fixtures are allowed for unit tests but can **never** be used to claim a gate passed.

### P4a.1 — Exa client, error mapping, fixture recorder

> **What:** We build one careful phone line to Exa and decide what to do when the line is busy or breaks.
> **Why:** Every Exa lookup depends on it, so it must retry politely, never leak the key, and never send forbidden requests.

| Path | Action | Tag |
|---|---|---|
| `backend/app/modules/providers/exa/client.py` | async `search()` and `contents()` | new |
| `backend/app/modules/providers/exa/models.py` | request builders and response models | new |
| `backend/app/modules/providers/exa/errors.py` | typed errors | new |
| `backend/app/modules/providers/exa/schema_limits.py` | `outputSchema` limit validator | new |
| `backend/scripts/record_provider_fixture.py` | records real responses to `*.recorded.json` | plan |
| `backend/tests/unit/test_exa_client.py`, `test_exa_schema_limits.py` | tests | new |

**Logic (all from plan §5.1 / §8.8)**
- Base URL `https://api.exa.ai`; auth header `x-api-key` from env `EXA_API_KEY`; httpx async.
- Allowed `type`: `auto`, `lite`, `deep-lite`, `deep`. Reject `fast`, `instant`, `deep-reasoning`. Never call `/research/v1`. Never send deprecated fields (`livecrawl`, `subpages` on `/search`, `includeText`, `excludeText`, `context`, `startCrawlDate`, `endCrawlDate`).
- `category` `company` or `people` + `startPublishedDate`/`endPublishedDate` → reject locally; `people` + `excludeDomains` → reject locally; `numResults` 1–100.
- `outputSchema`: root `text` or `object`; ≤10 properties in total (nested and array-item properties count); ≤2 levels of nesting; every array defines `items`.
- Response: `results[]` (title, url, publishedDate, id, text, highlights, summary, extras, entities), `output.content` + `output.grounding[] {field, citations[{url,title}], confidence}`, `costDollars.total`, `requestId`, `warnings` (log them; never show a model), `notices`.
- Errors: 429/503/timeouts retry with exponential backoff + jitter honouring `Retry-After`; 402 no retry, job-level `provider_out_of_credits`; 400 no retry, cell `provider_rejected_request`; 401/403 no retry, job-level `provider_auth`. Plan lists 500 as an Exa error but not in the retry table: treat like 503 (retry up to `max_attempts`) and flag it in the report.
- Every call writes a `provider_calls` row (SA-4): provider, endpoint, status_code, request_id, cost_dollars, ms, job_id, row_id.
- `userIdentifier` = hash of workspace id matching `^[A-Za-z0-9_-]{1,64}$`.

```
TASK: Phase P4a.1 — Exa client, error mapping, fixture recorder.
Read first: docs/plan.md sections 5.1, 7.1 rule 6, 8.8, 11 (P4a); then the OpenAPI at https://exa.ai/docs/exa-spec.yaml (paths /search and /contents only).

Implement backend/app/modules/providers/exa/{client.py,models.py,errors.py,schema_limits.py} exactly as specified in the prompt pack section P4a.1 / docs/plan.md section 5.1 and 8.8. Do not add any Exa endpoint other than /search and /contents. Do not use the Exa Agent API, Websets, Answer, or the SDK; use httpx.
- schema_limits.validate_output_schema(schema): raise on root type other than "text"/"object"; more than 10 properties in total counting every "properties" key at every depth (including inside array items); nesting deeper than 2 hops where each object-property container or array "items" counts as one hop; any array without "items". Be conservative. If a live smoke test later shows Exa rejects a schema this validator accepted, STOP and report; do not loosen the validator.
- backend/scripts/record_provider_fixture.py: CLI taking an enrichment id and a company domain; calls the real client with the key from the environment; writes the raw JSON response to backend/tests/fixtures/exa/<enrichment_id>/<case>.recorded.json; refuses to run if EXA_API_KEY is unset; never writes the key anywhere.

TESTS (httpx.MockTransport; no network)
- Header x-api-key is sent and its value never appears in logs, exception messages or provider_calls rows (hardening H4: assert with caplog and DB).
- Each legacy type (fast, instant, deep-reasoning) is rejected before any request is made; allowed types pass.
- category "company" with startPublishedDate -> rejected locally; category "people" with excludeDomains -> rejected locally; category "news" with startPublishedDate -> allowed.
- numResults 0 and 101 rejected; 1 and 100 accepted.
- Deprecated fields are never present in any request body produced by the builders (inspect the body).
- Retry: 429 then 200 -> success after 1 retry with a fake sleep; Retry-After value is honoured; 503 x max_attempts -> ExaUnavailable; 402 -> ExaOutOfCredits with 0 retries; 400 -> ExaRejected with 0 retries; 401 and 403 -> ExaAuth with 0 retries.
- A successful call writes one provider_calls row with status_code, request_id and cost_dollars from costDollars.total.
- test_exa_schema_limits.py: a schema with 10 properties passes, 11 fails; nesting depth 2 passes, 3 fails; array without items fails; root type "string" fails. Also assert every outputSchema defined later in P4a passes this validator (the later tests import all executor schemas).

DO NOT: write any executor yet.
FINISH: tests green; update docs/backend-paths.md; short sub-report (full PHASE REPORT is at the end of P4a.5).
```

### P4a.2 — Entity-based executors: `find_company_domain`, `find_snapshot`, `find_revenue`, `find_funding`

> **What:** We build the first lookups (website, snapshot, revenue, funding) from Exa's ready-made company profiles.
> **Why:** These are the safest to start with, and they teach the system the shared rules: right company, proof, or "no data".

| Path | Action | Tag |
|---|---|---|
| `backend/app/modules/enrichment/executors/base.py` | `ExecContext`, `ExecResult` incl. `signals: list[SignalDraft]` (PG-9) | plan |
| `backend/app/modules/enrichment/executors/common.py` | host matching, `format_usd_short`, citation rule, `missing_input` guard | new |
| `backend/app/modules/enrichment/executors/find_company_domain.py`, `find_snapshot.py`, `find_revenue.py`, `find_funding.py` | executors | plan |
| `backend/tests/unit/executors/test_entity_executors.py` | tests | new |
| `backend/tests/fixtures/exa/<id>/…` | fixtures | plan |

**Shared executor rules (plan §7.1) — apply to every executor from here on**
1. Missing required input (usually `domain`) → `failed` with `error.code="missing_input"` and **zero** provider calls.
2. Entity check: a result is used as evidence about the company only if its URL host equals the row's normalized domain or is a subdomain of it — except executors that are explicitly third-party searches (news, competitors, leadership).
3. `verified` executors: a value with no grounding citation becomes `no_data`. `ai_inferred` executors keep the value and store citations when present.
4. Every `outputSchema` call sends the exact `systemPrompt` from config: "Use only facts stated in the sources. If the requested information is not stated, return null for that field."
5. `userIdentifier` = hash of workspace id.

**Per-executor logic**

| Executor | Call | Value | Provenance |
|---|---|---|---|
| `find_company_domain` | `/search` `category: company`, `type: auto`, query `"<name> <loc>"`, `numResults: 5` | Exactly one candidate whose entity name matches the row name after normalization → its host. Several matching candidates → `no_data` + provenance `conflicting` (candidates in `sources`). None → `no_data` | `provider_reported` / `conflicting` |
| `find_snapshot` | `/search` `includeDomains:[domain]`, `category: company`, `numResults: 3`; take entity whose result host == domain | `"{description} · {workforce.total} employees · {headquarters.city}, {headquarters.country}"`, dropping missing parts; all missing → `no_data` | `provider_reported` |
| `find_revenue` | same entity lookup | `financials.revenueAnnual` as `"$28M (estimated)"`; null → `no_data`; **no model fallback** | `estimated` |
| `find_funding` | step 1 entity `financials.fundingLatestRound` → `"{name} — ${amount}"` (+ date). Step 2 only if step 1 is null: `category: news`, query `"<name> raises funding round"`, `startPublishedDate` = now − funding window (730 days, config), schema `{roundName, amountUsd, announcedDate, leadInvestor}` | step 2 requires a citation | step 1 `provider_reported`; step 2 `verified` |

```
TASK: Phase P4a.2 — entity-based executors.
Read first: docs/plan.md sections 7.1, 7.2 (find_company_domain, find_snapshot, find_revenue, find_funding), 8.7, 5.1 (company entity fields). Use the Exa client from P4a.1.

1. backend/app/modules/enrichment/executors/base.py: complete the ExecContext and ExecResult from docs/plan.md section 7.1. Add signals: list[SignalDraft] to ExecResult (PG-9) where SignalDraft = {type, detail, source_host, detected_at, confidence_label}; it is empty for every executor except find_funding step 2 (type "Funding") and, in P4a.3, find_company_news (type "News"). Record this addition in docs/backend-paths.md.
2. common.py: host_matches_domain(url, normalized_domain) (equal or subdomain; "evil-acme.io" must NOT match "acme.io"); format_usd_short(n) (28_000_000 -> "$28M", 1_500_000 -> "$1.5M", 4_000_000 -> "$4M", 950_000 -> "$950K"; the plan gives only the "$28M" example, so keep the rule minimal and tested); require_inputs(row, ["domain"]) -> ExecResult failed/missing_input; apply_citation_rule(result, mode).
3. Implement the four executors exactly per the prompt pack table. Name normalization for find_company_domain: case-fold, strip punctuation, drop legal suffixes from the config list.
4. Register each executor with the catalog registry by id.

TESTS (fixtures: *.synthetic.json is fine; schema-faithful; one directory per executor id)
For EACH executor: (a) succeeded, (b) no_data, (c) failed (Exa 503 after retries -> failed/provider_unavailable) — plus:
- missing domain -> failed with error.code "missing_input" and the Exa client was called 0 times (assert call count).
- find_company_domain: single matching candidate -> succeeded with the host; two matching candidates -> no_data with provenance "conflicting" and both hosts in sources; zero candidates -> no_data; "Acme, Inc." matches entity "ACME" after normalization.
- find_snapshot: all parts present -> exact string; missing workforce -> that part dropped with no stray separators; all missing -> no_data; an entity whose host is a different domain is ignored (entity check).
- find_revenue: revenueAnnual 28000000 -> "$28M (estimated)" provenance "estimated"; null -> no_data; assert the executor never issues an outputSchema call (no model fallback).
- find_funding: step 1 present -> no step 2 call (assert call count 1); step 1 null and step 2 grounded -> succeeded provenance "verified" and ExecResult.signals has one item type "Funding"; step 2 without a citation -> no_data and signals empty; request for step 2 has startPublishedDate = now - 730 days (freeze time).
- host_matches_domain: "https://www.acme.io/x" and "https://docs.acme.io" match "acme.io"; "https://evil-acme.io" does not.
- format_usd_short: the four cases above.
- Every outputSchema used here passes schema_limits.validate_output_schema.
- Every succeeded result with provenance "verified" has >= 1 source.

DO NOT: touch the worker, routes or other executors.
FINISH: tests green; update docs/backend-paths.md.
```

### P4a.3 — News, leadership, and social executors: `find_company_news`, `find_leadership_changes`, `find_social_profiles`

> **What:** We build the lookups that depend on dates and news stories, plus the company's social links.
> **Why:** News is only useful with a date and a link, so these get stricter proof rules (and feed the Signals sheet).

| Executor | Call | Value | Provenance |
|---|---|---|---|
| `find_company_news` | `/search` `category: news`, query `"<name>"`, `startPublishedDate` = now − 90 days (config), `numResults: 10`, `contents.highlights: true` | Keep results whose title or highlights contain the company name or domain. Newest kept: `"{title} ({publishedDate})"`; `sources` = that URL; emits one `SignalDraft(type="News")`. None kept → `no_data` | `verified` |
| `find_leadership_changes` | `category: news`, query `"<name> appoints OR hires OR joins as chief OR VP OR head"`, last 90 days (config); schema `{changes: array of {person, role, type: hire\|departure, date}}`; citations required | `"New {role}: {person} ({date})"` joined by `; `. Empty → `no_data` | `verified` |
| `find_social_profiles` | Exa `/contents` for `https://{domain}` with `extras.links: 100` | Links whose host is in the config list (`linkedin.com/company`, `x.com`, `twitter.com`, `youtube.com`, `facebook.com`, `instagram.com`); no model involved | `verified` (source = homepage URL) |

```
TASK: Phase P4a.3 — news, leadership and social executors.
Read first: docs/plan.md sections 7.2 (find_company_news, find_leadership_changes, find_social_profiles) and 8.7. Reuse base.py/common.py from P4a.2.

Implement the three executors exactly per the prompt pack table. News and leadership are explicitly third-party searches: the host==domain entity check does NOT apply to them; instead keep a result only if the company name or domain appears in its title or highlights (news) or in the cited text (leadership). find_social_profiles uses /contents (not /search), never a model, and filters links by the host list from config.

TESTS
- find_company_news: result mentioning the name -> succeeded, value "<title> (<date>)", one News signal with source_host = host of the cited URL and detected_at = publishedDate; results not mentioning the company are discarded; all discarded -> no_data with no signals; startPublishedDate = now - 90 days (freeze time); highlights requested.
- find_leadership_changes: one grounded hire -> "New VP Sales: Jane Doe (2026-09-01)"; two changes joined with "; "; null/empty changes -> no_data; change without a citation is dropped; the outputSchema passes validate_output_schema.
- find_social_profiles: homepage links include linkedin.com/company/acme, x.com/acme, an unrelated blog link -> value contains only the two social URLs; no social links -> no_data; request is /contents with extras.links = 100 and NO outputSchema; source = the homepage URL; assert no LLM/outputSchema call was made.
- All three: missing domain -> failed/missing_input with 0 calls (news also requires the company name); Exa 503 exhausted -> failed/provider_unavailable.

DO NOT: touch other executors or any route.
FINISH: tests green; update docs/backend-paths.md.
```

### P4a.4 — Domain-scoped and AI-inferred executors

> **What:** We build lookups that read a company's own website (pricing, trials, values) or need careful thinking (competitors, strategy).
> **Why:** Website facts need a cited page; thinking-based answers are clearly labelled as AI guesses, never as facts.

| Executor | Call and schema | Provenance |
|---|---|---|
| `find_core_values` | `/search` `includeDomains:[domain]`, `type: auto`, `numResults: 5`; schema `{values: array of string}` | `verified` / `ai_inferred` |
| `find_free_trial` | same; schema `{offersFreeTrial: boolean\|null, trialLength: string\|null}`. Value `"Free trial available (14 days)"` or `"No free trial found"` (only if `false` is cited); `null` → `no_data` | `verified` |
| `find_pricing` | same; schema `{pricingPublished: boolean\|null, startingPrice: string\|null, pricingModel: string\|null}` | `verified` |
| `find_job_openings` (gated G4) | `includeDomains:[domain]`, query `"careers open positions"`; schema `{openRoleCount: number\|null, gtmRoles: array of string}`; value `"{n} open roles; GTM: {roles}"` | `verified` |
| `find_gtm_strategy`, `find_revenue_model` | `type: deep-lite`, query = catalog prompt + `"Company: <name> (<domain>)"`, `outputSchema {type:"text"}` | `ai_inferred` |
| `find_product_categories` | `deep-lite`; schema `{categories: array of string}` | `ai_inferred` |
| `classify_b2b_b2c` | `deep-lite`; schema `{model: "B2B"\|"B2C"\|"Both"\|null}` | `ai_inferred` |
| `find_competitors` | `deep-lite`; schema `{competitors: array of string}` capped at 3 | `ai_inferred` |
| `find_tech_stack` (gated) | `/search` query `"<name> technology stack tools integrations"`; schema `{technologies: array of string}`. **Mentions in public sources, not script detection** | `ai_inferred` |
| `find_linkedin_highlights` (gated G2) | `includeDomains:["linkedin.com"]`, query `"<name> company page"`, `contents.highlights: true`, `numResults: 3`; accept only a `linkedin.com/company/…` URL; value = up to 3 highlights joined | `verified` |
| `custom_prompt` | `deep-lite`; query `"<user prompt>. Company: <name> (<domain>)"`; `outputSchema {type:"text"}`; prompt text is part of the cache key | `ai_inferred` |

`plain_value` has no executor. Running it returns 422 `not_runnable` (P5 enforces).

```
TASK: Phase P4a.4 — domain-scoped and AI-inferred executors.
Read first: docs/plan.md sections 7.1, 7.2 (core values, free trial, pricing, job openings, gtm, revenue model, product categories, b2b/b2c, competitors, tech stack, linkedin highlights, custom_prompt).

Implement the executors exactly per the prompt pack table. Rules:
- Domain-scoped executors use includeDomains:[domain]; apply the entity check to returned URLs; citations required (verified mode).
- AI-inferred executors keep the value, store citations when present, and mark provenance "ai_inferred" (never "verified").
- Column prompt: when a column has its own prompt, use it as the query text; otherwise use the catalog description.
- find_competitors caps the list at 3 after parsing. classify_b2b_b2c accepts only the enum values.
- find_tech_stack is gated (Q6) and its UI label must say "mentioned in public sources" - put that wording in the catalog description only if the human confirmed Q6; otherwise leave the catalog text as in P3 and mention it in the report.
- All outputSchema objects must pass schema_limits.validate_output_schema.

TESTS (for every executor: succeeded / no_data / failed; plus)
- find_free_trial: false without a citation -> no_data (never "No free trial found"); true with citation and "14 days" -> "Free trial available (14 days)"; null -> no_data.
- find_pricing / find_core_values / find_job_openings: result from another domain discarded; no citation -> no_data (verified mode).
- find_competitors: 5 returned -> 3 kept; classify_b2b_b2c: value "Both" accepted; any other string -> no_data.
- AI-inferred executors: a value without citations still succeeds with provenance "ai_inferred" and sources empty; none of them ever returns provenance "verified".
- find_linkedin_highlights: result URL not matching linkedin.com/company/ -> no_data; at most 3 highlights.
- custom_prompt: the user prompt appears in the query; two different prompts produce different cache-key inputs (assert via the prompt-hash function that P5 will use; define it in common.py as prompt_hash(prompt, params)).
- All outputSchemas pass validate_output_schema (import them all in one test).
- Hardening H4 again: the Exa key never appears in any ExecResult or error.

DO NOT: add routes or worker changes.
FINISH: tests green; update docs/backend-paths.md.
```

### P4a.5 — Provider gates G1, G2, G4 (documentation + human-run procedures)

> **What:** We write the checklist for testing Exa on real companies and leave the results blank.
> **Why:** Fake test data can't prove real-world quality, so people run the real test and nobody gets to pretend it passed.

| Path | Action | Tag |
|---|---|---|
| `docs/provider-gates.md` | gate procedures + results table | plan |
| `backend/scripts/record_provider_fixture.py` | reused | plan |

```
TASK: Phase P4a.5 — provider gates documentation.
Read first: docs/plan.md section 5.3 (G1, G2, G4) and 11 (P4a).

Create docs/provider-gates.md with, for each of G1, G2, G4:
- the exact test from docs/plan.md section 5.3 (inputs, how many companies, which executor/Exa call),
- the command(s) the human runs (using backend/scripts/record_provider_fixture.py) with EXA_API_KEY set in the environment,
- a results table to fill in: date, sample size, hits, hit-rate, reviewer, PASS/FAIL, and a blank "threshold (Q5)" cell for the human,
- what flips when the gate passes (config flag name from P3).
Do NOT run live calls. Do NOT mark any gate as passed. Do NOT invent thresholds (Q5). Add a section "Live smoke test for P5" with the manual steps for a 3-row run (keys in env), to be filled in during P5.

FINISH: print the full PHASE REPORT for P4a (all five sub-prompts): list executors implemented (names), tests counts per executor, engineering defaults, deviations, and the 500-status retry decision.
```

**Exit gate (P4a):** every Exa executor has passing succeeded/no_data/failed tests · `schema_limits` test imports every schema and passes · no test uses the network · `docs/provider-gates.md` exists with blank results.

---

## P5 — Enrichment runs (Flow 2: catalog → run → fill cells)

> **What:** We build the real "Run" logic: check the request, estimate the cost, queue one task per cell, and fill them in.
> **Why:** This is the heart of the product — the one engine every surface calls.

**Goal:** `POST/GET /enrichments/runs` backed by the real executors, cache (off until TTLs exist), and Signals derivation; the P2 contract tests pass unchanged against the real route. **No credit reservation — `estimatedCredits` is informational (SA-2).**
**Depends on:** P2, P3, P4a. **Read in plan:** §8.6, §8.7, §9.2, §11 (P5), §12; §8.3 **only for the eligibility/estimate definitions — ignore the ledger verbs** (SA-1/SA-2).

| Path | Action | Tag |
|---|---|---|
| `backend/app/modules/enrichment/service.py` | validate, estimate, create run + job + items | new |
| `backend/app/modules/enrichment/cache.py` | cache read/write by key | new |
| `backend/app/modules/enrichment/signals.py` | derive Signals rows (§8.7) | new |
| `backend/app/api/enrichments.py` | add `POST /enrichments/runs`, `GET /enrichments/runs/:runId` | plan |
| `backend/app/schemas/enrichment.py` | request/response DTOs, `CellView` | new |
| `backend/tests/support/test_routes.py` | **delete** (replaced by the real route) | existing |
| `backend/tests/contract/test_job_lifecycle.py` | re-run unchanged | existing |
| `backend/tests/integration/test_enrichment_runs.py`, `test_cache.py`, `test_signals.py` | tests | new |
| `docs/provider-gates.md` | fill "Live smoke test" steps | plan |

**Logic (plan §9.2, §8.6, §8.7; §8.3 adapted by SA-1/SA-2)**
- Request: `{target:{sheetId,rowIds}, columns:[{key,label?,type?,enrichmentId,prompt?}], refresh?, overwriteEdited?}` with `Idempotency-Key`.
- Validation: non-empty `rowIds` (`422 validation_error`); non-empty `columns`; every rowId exists **in that sheet** (`422 unknown_row_ids`, `details.unknown`); unique column keys (`422 duplicate_column_key`); known enrichment (`422 unknown_enrichment`); catalog `appliesTo` matches sheet kind (`422 validation_error`); row count ≤ `run_max_rows` (config, Q4); an existing column key must have the same `enrichmentId`, else `422 validation_error`; `plain_value` → `422 not_runnable`; gated-off enrichment → `422 unknown_enrichment`. **No credit check exists; `insufficient_credits` is never raised (SA-1).**
- Column key that doesn't exist on the sheet is created (via `sheets.add_column`).
- Eligible cells: not `user_edited` (unless `overwriteEdited`), not `running`. `estimatedCredits` = Σ catalog cost per eligible cell (SA-2, informational). Create `enrichment_runs` + job `type: enrichment` + one item per eligible cell; mark those cells `pending`. Return `202 {runId, jobId, estimatedCredits, status:"queued"}`.
- Worker: for each item check cache first (key `(normalized_domain, enrichment_id, sha256(prompt+params), executor_version)`); on miss call the executor. Cache is **off** unless a TTL is configured for that enrichment (PG-8); `refresh:true` bypasses. On a cache hit the cell gets `cost` per SA-2 and `provider_calls` records zero spend for it.
- Run view: `{id, jobId, sheetId, status, columns, estimatedCredits, chargedCredits, cells:[CellView]}` where `CellView` = `{rowId, columnKey, enrichmentId, status(pending|running|succeeded|no_data|failed|cancelled), value, provenance, source, sources[], confidence(null), confidenceLabel, userEdited, stale, fetchedAt, cost, error}` (A4/A6/A8).
- Signals (§8.7): each `SignalDraft` from an executor creates a row in the project's Signals sheet (`kind: signals`), linked via `company_row_id`; fields `{companyName, type, detail, source (host of cited URL), detectedAt (publishedDate), confidence(label)}`; `freshness` and `relevance` stay null. The Signals sheet is created lazily through the sheets service; base columns need N4 (PG-4).

```
TASK: Phase P5 — enrichment runs (Flow 2). NO credit ledger (SA-1/SA-2 in docs/prompt.md).
Read first: docs/plan.md sections 8.6, 8.7, 9.2, 11 (P5), 12 and 8.3 for eligibility/estimate definitions only (ignore reserve/charge/settle); docs/prompt.md scope adaptations; docs/api-contract.md "Data enrichment" section; server/mock-api.mjs (validateRun, createRun, runView, cellView). Ask N4 (Signals base columns) if unanswered, and Q4 (run_max_rows).

1. Implement POST /enrichments/runs and GET /enrichments/runs/:runId exactly as in the prompt pack section P5 / docs/plan.md section 9.2 with the SA adaptations. Idempotency-Key honoured via backend/app/idempotency.py.
2. Wire the worker to the real executors through the catalog registry (resolve executor by enrichmentId). Providers' typed errors map to cell/job outcomes per docs/plan.md section 8.8.
3. Implement cache.py with the key from section 8.6; default behaviour with no TTL configured = never read from or write to the cache. refresh:true bypasses. executor_version is part of the key (take it from each executor module).
4. Implement signals.py per section 8.7. Create the Signals sheet lazily via sheets.service.create_sheet with kind "signals". Use base columns from the human's N4 answer; if unanswered, STOP and ask.
5. Delete backend/tests/support/test_routes.py and point backend/tests/contract/test_job_lifecycle.py at the real route. Do not change the assertions of tests a-f except the fixtures plumbing. If an assertion cannot pass, STOP and report; do not edit the assertion.
6. Fill the "Live smoke test for P5" section of docs/provider-gates.md: the manual 3-row steps, which keys to set, and what the human should see. Do not run live calls.

TESTS (backend/tests/integration/…; fake or fixture-backed executors; real PostgreSQL)
- All contract tests a-f from P2 pass against the REAL route (same test ids).
- Validation matrix: one test per error code in the prompt pack list (empty rowIds, empty columns, row from another sheet, duplicate key, unknown enrichment, wrong appliesTo, over run_max_rows, plain_value -> not_runnable, gated-off enrichment, existing key with a different enrichmentId).
- Eligibility: a user_edited cell is skipped and its value unchanged; with overwriteEdited true it runs; a running cell is skipped.
- Estimates: estimatedCredits equals the sum of catalog costs of eligible cells; chargedCredits after completion equals the sum of succeeded cell costs (SA-2); credit_ledger row count remains 0.
- Cell semantics: no_data cell has cost 0; failed cell cost 0; succeeded cell has cost == catalog cost, provenance not null, and for provenance "verified" >= 1 source.
- Cache (test_cache.py): TTL unset -> second identical run calls the executor again (call count 2); TTL set -> second run calls it once, the cell still gets catalog cost, provider_calls shows no new spend; refresh:true bypasses; changing the column prompt or executor_version misses the cache.
- Signals (test_signals.py): a find_company_news success creates one Signals row linked to the company row with type "News", source = host of the cited URL, detectedAt = publishedDate, freshness and relevance null; a no_data news result creates none; a find_funding step-2 success creates a "Funding" signal.
- GET /enrichments/runs/:runId returns every cell with the CellView fields; statuses are only from the allowed set; unknown run -> 404 not_found.
- Idempotency: replay returns the same runId/jobId and creates no new job.

DO NOT: add any other route, any credit ledger code, or any enrichment executor.
FINISH: all earlier tests green; update docs/backend-paths.md; PHASE REPORT (note PG-4 resolution and the Signals sheet base columns you used).
```

**Exit gate:** `pytest backend/tests -q` green · P2's six lifecycle tests pass against the real route · cache OFF test passes · live smoke steps written (human may run them with ≤3 rows).

---

## P4b — MoltSets adapter and people/email executors (blocked until Q1 and G3)

> **What:** We connect MoltSets to find decision makers and their work emails — only if MoltSets actually returns them.
> **Why:** Emails are sensitive and easy to get wrong; we never guess one, and we first read MoltSets' real rules, limits, and data terms.

**Goal:** typed MoltSets client + `find_decision_makers` and `find_work_email` executors, with Leaders-sheet upserts and a hard guarantee that no email exists without a provider response.
**Depends on:** P5, answers Q1, N4; gate G3 (human reads MoltSets terms). **Read in plan:** §5.2, §5.3 (G3), §7.2, §8.8, §11 (P4b).

| Path | Action | Tag |
|---|---|---|
| `backend/app/modules/providers/moltsets/client.py`, `models.py`, `errors.py`, `rate_limit.py` | client, typed models, limiter | new |
| `backend/app/modules/enrichment/executors/find_decision_makers.py`, `find_work_email.py` | executors | plan |
| `backend/tests/fixtures/moltsets/…` | `*.recorded.json` / `*.synthetic.json` | plan |
| `backend/tests/unit/executors/test_moltsets_executors.py`, `test_moltsets_client.py`, `test_moltsets_rate_limit.py` | tests | new |
| `docs/provider-gates.md` | G3 section filled | plan |

**Logic**
- `find_decision_makers`: MoltSets `search_people` with `company_domain: [domain]`, `seniority` default `["C Suite","VP","Head","Director","Owner"]`, optional `department` / `title` from column params, `limit` default 10 (max 25). Value = list of people (exact source fields mapped after G3). Side effect: upsert each person into the project's **Leaders** sheet (link `company_row_id`; dedupe by LinkedIn URL, else name + company). Company cell summary: `"{first} + {n-1} more"`. Provenance `provider_reported`.
- `find_work_email` (on a Leaders row): `linkedin_to_business_email` if `linkedinUrl`; else `search_business_email_by_name` with name + company domain; else `failed/missing_input`. Found → value = email, `provider_reported`. Not found → `no_data` (cost 0). **Never construct an email from a name pattern.**
- Rate limit comes from the team's actual MoltSets plan (config), never hard-coded.

```
TASK: Phase P4b — MoltSets adapter and executors.
PRECONDITIONS — STOP-AND-ASK (R2) for any item that is not satisfied; do not start coding until all are true:
 a) Q1 confirmed: the provider is MoltSets (moltsets.com).
 b) You have read https://developer.moltsets.com (REST reference, auth, error codes, rate limits) and quoted in your first message: base URL, auth header/format, the exact request path and parameter names and the exact response field names for the three capabilities used (people search by company domain, LinkedIn URL -> business email, name + domain -> business email), the name of the API-key environment variable, and the plan rate limit.
 c) The human has confirmed commercial-use and data-retention terms were reviewed (gate G3).
 d) N4 answered: base columns of the Leaders sheet.
Plan facts you may rely on (docs/plan.md section 5.2): capability names search_people, linkedin_to_business_email, search_business_email_by_name; search_people filters company_domain[], seniority[], department[], title[], limit (max 25), offset; seniority values Intern, Entry, Senior, Manager, Director, VP, Head, C Suite, Owner, Partner; tokens are charged only when data is found. Everything else comes from the MoltSets docs, not from memory.

Then implement exactly the logic in the prompt pack section P4b / docs/plan.md section 7.2. Record real responses with backend/scripts/record_provider_fixture.py only if the human supplies the key; otherwise use *.synthetic.json fixtures that match the docs and label gate G3 as "not passed".
- Leaders sheet: create lazily via sheets.service (kind "leaders") with the N4 base columns; upsert is idempotent.
- Error mapping per docs/plan.md section 8.8: not found -> no_data; plan_restricted/auth -> failed with the provider's code, no retry; rate limit -> backoff retry like Exa.
- Rate limiter: async token bucket reading the plan limit from config.

TESTS
- Client: key never logged (H4); request bodies contain only documented fields; limit above 25 is capped to 25; default seniority list exactly ["C Suite","VP","Head","Director","Owner"].
- find_decision_makers: succeeded with N people -> value list + summary "{first} + {n-1} more"; Leaders rows upserted with company_row_id; running it twice creates no duplicates (dedupe by LinkedIn URL, else name + company); zero people -> no_data; missing domain -> failed/missing_input with 0 provider calls.
- find_work_email: linkedinUrl present -> uses the LinkedIn-URL capability (assert which call was made); no URL but name + domain -> uses the name+domain capability; neither -> failed/missing_input and 0 calls; provider found -> value = provider email, provenance provider_reported, cell cost == catalog cost (SA-2); provider not found -> no_data, value None, cost 0.
- NO-GUESSED-EMAIL property test: for 200 generated (name, domain) pairs with the provider mocked to "not found", the executor never returns a non-null value, and no string containing "@" appears in the result or the cell.
- plan_restricted response -> failed with the provider code and 0 retries.
- Rate limiter: with a fake clock and limit L per minute, L+1 calls in one window -> the (L+1)th waits until the next window; never exceeds L per window.
- Gate flag: with the G3 flag OFF these two enrichments are absent from the catalog and /enrichments/runs rejects them.

DO NOT: use validation, phone, or hashed-email capabilities; do not add batching (out of scope for this pack).
FINISH: all earlier tests green; update docs/backend-paths.md and docs/provider-gates.md (G3 status); PHASE REPORT.
```

**Exit gate:** property test "no guessed email" green · limiter test green · G3 status recorded (passed only if recorded fixtures + human sign-off).

---

# SECTION C — Release verification

## V1 — Data-enrichment release verification (no new features)

> **What:** One last checkup: every scoped endpoint exists, every honesty promise is tested, and nothing fake slipped in.
> **Why:** Individual phases can pass while the whole still breaks; this catches the gaps before real users do.

**Goal:** prove the finished enrichment backend matches this pack's endpoint inventory (9 endpoints), plan §8.5 honesty rules, and §12 test strategy. Derived from plan §12 (not a plan packet).
**Depends on:** P2, P3, P4a, P5 (and P4b if enabled). **Paths:** `backend/tests/contract/test_endpoint_inventory.py` (new), `backend/tests/integration/test_honesty_rules.py` (new), `docs/release-report.md` (new).

```
TASK: V1 — data-enrichment release verification. No new features. Fix only test or documentation problems; if a real defect is found, STOP and report it with the phase it belongs to.

1. Endpoint inventory test (backend/tests/contract/test_endpoint_inventory.py): compare app.openapi() paths+methods (under /api/v1, plus /health at root) with this exact list of 9 + health; fail on any missing or extra:
 GET /me | GET /jobs/{jobId} | GET /jobs/{jobId}/events | POST /jobs/{jobId}/pause | POST /jobs/{jobId}/resume | POST /jobs/{jobId}/cancel
 GET /enrichments/catalog | POST /enrichments/runs | GET /enrichments/runs/{runId}

2. Honesty tests (backend/tests/integration/test_honesty_rules.py), run over a full end-to-end scenario with fixture-backed providers (add rows via sheets.service -> run enrichments -> read run view -> SSE stream):
 - The literal "Guessed" never appears in any API response body, DB cell value, schema, or catalog.
 - Every cell with provenance "verified" has >= 1 row in cell_sources.
 - Every non-empty enrichment cell has a provenance and a source; every empty result has status no_data (value null) and cost 0.
 - No email-shaped value exists in any cell unless it came from a provider fixture response (compare against the fixtures).
 - Only backend/app/modules/sheets writes sheet tables (re-run the boundary test).
 - No catalog item has source other than exa, moltsets, user; excluded items absent.
 - No-ledger invariants after the whole scenario (SA-1/SA-2): credit_ledger row count == 0; workspaces.credits_balance == seeded value; for every run and job, chargedCredits == sum of cell.cost over its succeeded cells; every succeeded cell's cost == its catalog cost; estimatedCredits >= chargedCredits.
 - Secret redaction: with fake provider keys set, no key value appears in any log line, error body, SSE frame, or DB column; X-Request-Id header present on API responses.

3. Full suite: ruff, mypy (strict on app/modules), pytest (all directories). Report counts.
4. Write docs/release-report.md: phases completed, test counts, open questions still unresolved (Q2, Q3, Q5, Q6 ... with their current defaults), gates passed/not passed (G1-G4), hardening additions kept (H4, H5), scope boundaries honoured (9 endpoints, no ledger), and a list of what remains OUT of scope for later packs (workspace, projects, copilot, radar, exports, deployment, real credit charging).
```

**Exit gate:** inventory test (9) green · honesty tests green · `docs/release-report.md` exists · every unresolved Q has an explicit default or owner.

---

# SECTION D — Recovery prompts

## R1 — Resume after a lost session

> **What:** The AI reads our notes and test results to figure out exactly where we stopped.
> **Why:** Sessions end and memory fades; this stops it from redoing or skipping work.

```
TASK: resume. Do not write code yet.
1. Read docs/plan.md headings and docs/backend-paths.md. List which phases (P2, P3, P4a.1-.5, P5, P4b, V1) have all their files present.
2. Run the full test suite and print pass/fail counts per directory (backend/tests/unit, contract, integration).
3. Find the earliest phase whose exit gate is not green. State: phase id, what is missing, which tests fail.
4. List any open questions (Q*/N*) that block it.
5. Propose the single next prompt from the prompt pack to run. Wait for my approval.
```

## R2 — STOP-AND-ASK format (agent must use this when blocked)

> **What:** A short, fixed form for asking me a question instead of guessing.
> **Why:** Guessing is how wrong facts sneak into production; a clear question takes me 30 seconds to answer.

```
STOP-AND-ASK
Phase: <id>
Blocked on: <one sentence>
What the plan says (section): <quote or §>
What I found elsewhere (file:line or doc URL): <...>
Options: A) <...>  B) <...>
My recommendation and why: <one sentence>
I will not continue until you answer.
```

---

# Appendix A — Path registry for this pack (already merged into `docs/backend-paths.md`; keep it current)

Columns: `path | purpose | phase | status (planned / created / renamed→new path)`.

| Path | Purpose | Phase | Tag |
|---|---|---|---|
| `docs/plan.md` | the plan | P0 (done) | existing |
| `docs/api-contract.md` | API contract (+ amendments A1–A12) | P0 (done) | existing |
| `docs/backend-paths.md` | living registry | P0 (done) | existing |
| `docs/provider-gates.md` | gates G1–G4 procedures and results | P4a | plan |
| `docs/release-report.md` | final report | V1 | new |
| `server/mock-api.mjs`, `server/mock-api.test.mjs` | oracle (read-only) | all | existing |
| `backend/pyproject.toml`, `backend/alembic.ini`, `backend/alembic/versions/0001_initial.py`, `0002_seed.py` | project, migrations | P0–P1 (done) | existing |
| `backend/app/main.py`, `config.py`, `db.py`, `ids.py`, `errors.py`, `auth.py` | core | P0 (done) | existing |
| `backend/app/idempotency.py` | idempotency helper | P2 | new |
| `backend/app/logging.py` | request-id + structured worker logs (H5) | P2 | new |
| `backend/app/api/me.py`, `jobs.py`, `enrichments.py` | thin routes (enrichment scope only) | P2–P5 | plan |
| `backend/app/schemas/` (`catalog.py`, `enrichment.py`) | DTOs | P3–P5 | new |
| `backend/app/modules/core/models.py` | workspaces, users, idempotency_keys | P1 (done) | existing |
| `backend/app/modules/sheets/` (`models.py`, `service.py`, `normalize.py`) | the only sheet writer | P1 (done) | existing |
| `backend/app/modules/jobs/` (`models.py`, `service.py`, `queue.py`, `events.py`, `sse.py`) | queue, events, SSE | P2 | plan |
| `backend/app/modules/credits/models.py` | `credit_ledger` model — **table exists, never used (SA-1)** | P1 (done) | existing |
| `backend/app/modules/catalog/registry.py` | canonical catalog | P3 | plan |
| `backend/app/modules/enrichment/` (`models.py`, `service.py`, `cache.py`, `signals.py`, `executors/…`) | runs and executors | P4a–P5 | plan |
| `backend/app/modules/providers/exa/` (`client.py`, `models.py`, `errors.py`, `schema_limits.py`) | Exa adapter | P4a | plan |
| `backend/app/modules/providers/moltsets/` (`client.py`, `models.py`, `errors.py`, `rate_limit.py`) | MoltSets adapter | P4b | plan |
| `backend/app/modules/providers/models.py` | `provider_calls` (observability only, SA-4) | P1 (done) | existing |
| `backend/app/worker/main.py` | worker loop | P2 | plan |
| `backend/scripts/record_provider_fixture.py` | provider fixture recorder | P4a | plan |
| `backend/tests/{unit,contract,integration,fixtures}/…`, `backend/tests/support/{fake_executor.py,test_routes.py}` | tests | all | plan / new |

**Rule for the agent:** if you rename or add a file, change `docs/backend-paths.md` in the same commit. If a prompt names a path that no longer exists, trust the registry, not the prompt. If a prompt names a path marked "done", do not recreate it — extend it only as the phase says.
