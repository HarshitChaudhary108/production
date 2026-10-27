# Outmate — Enrichment Backend: Agent Prompt Pack v2 (`prompt.md`)

**What this is:** copy-paste prompts for a coding agent that build the enrichment backend described in `docs/plan.md`, one phase per session, each with the exact implementation logic and the tests that must pass before moving on.
**Source of truth:** `docs/plan.md`, `docs/api-contract.md`, `server/mock-api.mjs`, `server/mock-api.test.mjs` (repo `outmate-home-main`, commit `fa2967a`).
**Providers:** Exa and MoltSets only. No separate LLM (plan §4.3).

### What changed from v1

| Change | Effect |
|---|---|
| **Credits / cost ledger removed from this release** | No reservation, charging, release, balance checks, `409 insufficient_credits`, estimates, or `/me`. See "Scope boundary" below |
| **Deployment removed** | No Render service definitions, no cost report |
| **P0 and P1 are done** | Replaced by a read-only checkpoint **C0** that records the real names later phases depend on |
| **P2 rewritten and split** (P2.0 → P2.3) | Exact queue, fencing, event-sequencing, LISTEN/NOTIFY and SSE logic, plus a triage step for the code already written |
| Endpoint inventory | 45 endpoints (plan §10 minus `/me`) |

---

## Scope boundary (read before every phase)

**Do not build in this release:**
- Credit reservation, charging, release, settlement; any write to `credit_ledger`; any read of `workspaces.credits_balance`; error `insufficient_credits`.
- Estimates of any kind: `estimatedCredits`, `chargedCredits`, `estimatedOnly`, discovery price per company.
- Cost reporting, provider-dollar accounting.
- `GET /me` (its payload is user + credits; deferred with credits).
- Deployment configuration of any kind.
- Everything already out of scope in plan §1.2 (auth, notifications, integrations/CRM, purchases, search, pages, saved lists, workflows/templates, imports, sharing, saved views, sheet create/rename/delete, row delete, live Radar detection, website-visitor intent, phone enrichment, email validation, other providers).

**Already exists from P0/P1 — keep, do not delete, do not use:** the `credit_ledger` table, `workspaces.credits_balance`, `provider_calls.cost_dollars` (leave NULL), any price/credit values in `backend/app/config.py`.

**Kept on purpose:** the catalog's `cost` field (plan §6 table) as **static display metadata only**. No code path reads it.

**Response fields omitted in this release** (recorded as contract amendment **A13** in P2.3): `estimatedCredits`, `chargedCredits` (job, run), cell `cost`, project `creditsUsed`, workspace `credits`. If a request sends `estimatedOnly: true`, reply `422 not_supported` (never run a job the client thinks is an estimate).

---

## How to use this pack

1. Start every agent session with **S1 (Primer)**.
2. Run **C0** once (read-only) to record what P0/P1 actually produced.
3. Run phases in order, one prompt block per session. Do not merge phases.
4. A phase is done only when its **Exit gate** is green and all earlier tests still pass.
5. When a prompt says STOP-AND-ASK, the agent uses the **R2** format and waits.

**Order:** S1 → C0 → P2.0 → P2.1 → P2.2 → P2.3 → P3 → P4a.1 → P4a.2 → P4a.3 → P4a.4 → P4a.5 → P5 → P6 → P7 → P8 → P9 → P4b (when unblocked) → P10 → V1.
(P9 depends only on P1 and the P2.2 routes pattern, so it can be done earlier. P4b stays blocked until Q1 and G3 are cleared; its two enrichments stay switched off until then.)

### Path legend

| Tag | Meaning |
|---|---|
| `existing` | already in the repo (ZIP or created in P0/P1); change only as the table says |
| `plan` | path named in `docs/plan.md` |
| `new` | proposed here because the plan names the thing but not the file; the agent may rename it but must update `docs/backend-paths.md` in the same commit |

Paths are relative to the repo root (the folder with `docs/api-contract.md` and `package.json`). If `docs/backend-paths.md` and a prompt disagree on a path, **the registry wins**.

### Phase Report (every phase ends with this)

```
PHASE REPORT — <phase id>
Goal (one line):
Files created / modified (paths):
Tests added (paths) and results (passed / failed / skipped):
Earlier phases' tests re-run: <command> -> <result>
Deviations from docs/plan.md (with § reference), or "none":
Decisions used from this pack (D-ids), or "none":
Open questions raised (R2 format), or "none":
docs/backend-paths.md updated: yes / no
```

### Open questions that still block something

| Id | Question | Blocks | Default until answered |
|---|---|---|---|
| Q1 | Is "Moldset" the MoltSets service at moltsets.com? | P4b | P4b blocked |
| Q3 | Cache TTL per enrichment | P5 caching | cache OFF |
| Q4 | `research_default_count` (suggested 25), `run_max_rows` (suggested 500) | P5, P7 | suggested values, flagged |
| Q5 | Hit-rate thresholds for gates G1, G2, G4 | enabling gated items | gates stay OFF |
| Q6 | Label `find_tech_stack` as "Technologies mentioned in public sources"? | enabling that item | gated OFF |
| Q9 | Same idempotency key with a different body: return original (mock) or 409? | P2.3 | return original + log warning |
| Q11 | Do `outmate_spec_v1.3.md`, `outmate_tech_v1.4.md`, the original `plan (6).md` exist and override the plan? | any | STOP if found and conflicting |
| N4 | Base columns of the Leaders and Signals sheets | P4b, P5 | STOP-AND-ASK |
| N5 | Radar list responses as `{data, nextCursor, preview:true}`? | P9 | that wrapper |

### Gaps in `docs/plan.md` and how this pack resolves them

| Id | Gap | Resolution in this pack |
|---|---|---|
| PG-1 | Plan's P2 "done when" uses `POST /enrichments/runs`, which is built in P5 | P2.3 uses a test-only entry point; P5 replaces it and re-runs the same tests unchanged |
| PG-2 | §10 names a `projects` module that §4.2 does not list | P7 creates `backend/app/modules/projects/` |
| PG-3 | §9.1 lists `linkedin` and `industry` as fillable base columns; Exa's company entity (§5.1) has neither | created hidden, never filled by discovery |
| PG-4 | Leaders/Signals sheets: creation and base columns unspecified | lazy creation via sheets service; columns from N4 |
| PG-6 | A12 `preview:true` vs the contract's bare-array `/radar/signal-mix` | N5 default wrapper |
| PG-7 | "Run empty cells" is per cell; run targets are per row | supported via client-sent `rowIds`; multi-column behaviour reported |
| PG-8 | Cache TTL values intentionally not set | cache OFF until configured |
| PG-9 | `ExecResult` (§7.1) has no field for Signals data (§8.7) | add `signals: list[SignalDraft]` |
| PG-10 | Reference docs from earlier recommendation still missing | rule 10 in S1 |

### Implementation decisions this pack makes (veto by editing the line)

| Id | Decision | Why |
|---|---|---|
| D1 | A cell already `pending` or `running` is not queued again by a second run | the plan excludes `running`; a `pending` cell is already queued, so re-queueing would process it twice |
| D2 | A run with zero eligible cells returns `422 validation_error`, `details {reason:"no_eligible_cells", skipped:{userEdited, inProgress}}`; no job is created | an empty job is confusing and the plan is silent |
| D3 | The cache stores only `succeeded` results | caching `no_data` would hide data that appears later |
| D4 | Signals dedupe on `(company_row_id, type, cited URL)`; Leaders dedupe on LinkedIn URL, else normalized name + company row | re-runs must not duplicate rows |
| D5 | An unexpected executor exception ends the cell `failed` with code `internal_error` (stack trace logged, never returned) | the plan defines provider errors only |
| D6 | Exa HTTP 500 is retried like 503 | plan lists 500 as an Exa error but not in the retry table |
| D7 | `NOTIFY` payload is the job id only; listeners re-read events from the DB; a poll fallback covers missed notifications | Postgres NOTIFY payloads are size-limited and not durable; the DB is the source of truth |

### Hardening additions not in the plan (veto by deleting)

- **H2** (P6, P8): exported CSV/XLSX text cells starting with `=`, `+`, `-`, `@` get a leading `'` (cell values come from web content).
- **H3** (P8): Copilot router alternatives match on word boundaries ("sector" must not match `cto`).
- **H4** (P2.1 onward): tests assert API key values never appear in logs, error bodies, or DB rows.

---

# SECTION A — Setup

## S1 — Primer (paste first in every new session)

> **What:** We hand the AI helper a short rulebook before it writes any code.  
> **Why:** So it uses only the plan and the docs, asks when something is missing, and proves every step with tests.

**Goal:** every session starts with the same non-negotiable rules. **Paths:** none.

```
ROLE
You are a senior AI/backend engineer building the Outmate enrichment backend (Python, FastAPI, PostgreSQL) in backend/ for the existing React frontend in this repo.

SOURCES OF TRUTH (in this order)
1. docs/plan.md               the plan. Read the sections named in each task before coding.
2. docs/api-contract.md       the API contract; its shapes win unless docs/plan.md section 3 (A1-A12) or A13 says otherwise.
3. server/mock-api.mjs, server/mock-api.test.mjs   behavioural oracle for the enrichment lifecycle.
4. Provider docs              Exa OpenAPI https://exa.ai/docs/exa-spec.yaml ; MoltSets https://developer.moltsets.com
5. docs/backend-paths.md      living path registry. If a prompt and the registry disagree on a path, the registry wins.
If two sources conflict, STOP and ask (R2 format). Never resolve a conflict by guessing.

SCOPE BOUNDARY FOR THIS RELEASE
- Do NOT build credits or costs: no reservation, charging, release, balance checks, insufficient_credits, estimates, estimatedOnly, /me, cost reports. Do not write to credit_ledger. Leave existing credit tables/columns/config untouched.
- Do NOT build deployment configuration.
- The catalog's cost field is static display metadata; no code may read it.
- Out-of-scope list in docs/plan.md section 1.2 still applies.

HARD RULES (docs/plan.md section 0)
1. Do not invent endpoints, request/response fields, rate limits, scores, or data. Missing fact = STOP and ask.
2. Provider docs are the source of truth for provider shapes.
3. Keep contract shapes; implement only amendments A1-A12 (plan section 3) and A13 (credit fields omitted).
4. Every non-empty cell has a provenance class and a source. An empty result is status no_data with value null. Never guess.
5. Never pattern-guess an email. Provider-returned = provider_reported; read on a cited page = verified; otherwise empty.
6. Only backend/app/modules/sheets/ writes sheets, columns, rows, cells, cell_sources. Everyone else calls its service functions.
7. Never commit, print or log secret values; refer to env var names only.
8. If outmate_spec_v1.3.md, outmate_tech_v1.4.md or the original "plan (6).md" appear and conflict with docs/plan.md, STOP and ask.

WORKING RULES
- One phase per session; do not start another phase's work.
- Before coding: restate the phase goal and list the files you will create/modify, checked against docs/backend-paths.md.
- Write the failing test first for any logic the plan specifies, then implement.
- No live provider calls in tests or CI. Live calls only if the human set keys in the environment and said "go", max 3 rows.
- Follow the DB session style already in backend/app/db.py (sync or async). Never introduce a second style.
- Unspecified product behaviour = STOP-AND-ASK. Pure engineering tuning values (timeouts, batch sizes, intervals) = choose a default, put it in config, report it as "engineering default, not in plan".
- Finish every phase: lint, type check, this phase's tests AND all earlier tests; update docs/backend-paths.md; print the PHASE REPORT.

Reply "READY" and nothing else.
```

**Exit gate:** agent replies `READY`.

---

## C0 — Checkpoint: record what P0 and P1 produced (read-only)

> **What:** The AI reads what's already built and writes down the real file and function names.  
> **Why:** Later prompts call these functions; if a name differs, the agent must use the real one instead of guessing.

**Goal:** a verified inventory of P0/P1 outputs that P2+ rely on. **No code changes**; only `docs/backend-paths.md` may be updated.

```
TASK: Checkpoint C0. Do not change code. You may only update docs/backend-paths.md.

1. Run from backend/: the lint, type-check and test commands defined in P0. Print counts.
2. Confirm these exist and print their real paths: app/main.py, app/config.py, app/db.py, app/ids.py, app/errors.py, app/auth.py, alembic migrations 0001_initial and 0002_seed.
3. Print the DB session style used in app/db.py (sync or async, driver name).
4. List every public function in backend/app/modules/sheets/service.py with its signature. Confirm functions exist for: create_sheet, add_base_rows, add_column, edit_base_field, edit_cell, write_enrichment_result, clear_column_results, remove_column. List any read helpers already present.
5. List the columns of these tables as they exist after migrations (query information_schema): jobs, job_items, job_events, cells, cell_sources, enrichment_runs, enrichment_cache, provider_calls, idempotency_keys, projects, sheets, columns, rows, conversations, messages, radar_signal_actions, download_tokens. Compare with docs/plan.md section 8.1 and list differences (do not fix).
6. Confirm the sheets boundary test exists and passes (no module outside modules/sheets imports the sheets models).
7. Record in docs/backend-paths.md: real file names, real sheets service function names, session style, and any table differences.
8. List any code under backend/ that touches credit_ledger or credits_balance (paths + function names). Do not change it.

OUTPUT: C0 REPORT with sections: Test results, Core files, Session style, Sheets service API, Schema differences vs plan 8.1, Boundary test, Credit-related code found, Registry updated (yes/no).
```

**Exit gate:** tests green · sheets service API recorded · schema differences (if any) known before P2.1.

---

# SECTION B — Build phases

## P2 — Jobs engine and live progress (no credits)

> **What:** The engine that queues every enrichment task, runs it once, and streams progress to the screen.  
> **Why:** Every flow (Home, Workspace, Copilot) runs on it, so it has to survive crashes and never lose or repeat work.

**Phase goal:** a durable Postgres job queue with a worker, correct state machine, crash recovery, gap-free event log, and SSE streaming with replay — proven with a fake executor before any provider exists.
**Read in plan:** §8.2, §8.9, §11 (P2), §12; `server/mock-api.mjs` (`createRun`, `advance`, `processCell`, `finish`, `cancelJob`, `shouldFail`) and `server/mock-api.test.mjs`.

| Path | Purpose | Tag |
|---|---|---|
| `backend/app/modules/jobs/service.py` | create job + items, transitions, finalize | new |
| `backend/app/modules/jobs/queue.py` | claim, complete (fenced), recovery sweep | new |
| `backend/app/modules/jobs/events.py` | append events with per-job `seq` | new |
| `backend/app/modules/jobs/listener.py` | one LISTEN connection per API process, fan-out | new |
| `backend/app/modules/jobs/sse.py` | SSE generator (snapshot, replay, live, heartbeat) | new |
| `backend/app/modules/enrichment/executors/base.py` | `ExecContext`, `ExecResult` (+ `signals`), executor Protocol | plan |
| `backend/app/worker/main.py` | worker loop + `process_available()` | plan |
| `backend/app/idempotency.py` | insert-first idempotency | new |
| `backend/app/api/jobs.py` | `GET /jobs/:id`, `GET /jobs/:id/events`, `POST /jobs/:id/pause|resume|cancel` | plan |
| `backend/tests/support/fake_executor.py` | deterministic fake executor | new |
| `backend/tests/support/test_routes.py` | TEST-ONLY `POST /enrichments/runs` (PG-1) | new |
| `backend/tests/unit/test_job_state_machine.py`, `test_events_seq.py`, `test_idempotency.py` | unit tests | new |
| `backend/tests/integration/test_queue_claim.py`, `test_worker_recovery.py`, `test_sse.py` | integration tests | new |
| `backend/tests/contract/test_job_lifecycle.py` | ported mock tests (no credit assertions) | plan |
| `docs/api-contract.md` | add A13 | existing |

---

### P2.0 — Triage the P2 code already written (read-only)

> **What:** Before fixing anything, the AI compares what's already written for P2 against the new, credit-free spec.  
> **Why:** Rewriting blindly wastes the work that's correct; triage tells us exactly what to keep, change, or unhook.

```
TASK: P2.0 — triage existing P2 work. READ-ONLY: do not edit code.
Read first: prompt pack sections P2.1, P2.2, P2.3 (the spec), docs/plan.md sections 8.2, 8.9.

1. List every file under backend/app/modules/jobs/, backend/app/modules/credits/, backend/app/worker/, backend/app/api/jobs.py, backend/app/idempotency.py (if present) and backend/tests/ that belongs to P2. For each: one line on what it does.
2. Run the P2 tests that exist. Print each failing test with the first error line.
3. Map the existing code to the spec items below and mark each KEEP / MODIFY / MISSING:
   S1 job create (queued) + items in one transaction
   S2 claim with FOR UPDATE OF job_items SKIP LOCKED (not locking jobs rows)
   S3 claim marks cells running via the sheets service, commits before executing
   S4 executor called outside any DB transaction
   S5 completion transaction: lock job row, fenced update on (status running AND attempts = claimed attempts)
   S6 cell write via sheets.write_enrichment_result + cell_sources in the same transaction
   S7 events appended with seq = max(seq)+1 under the job row lock
   S8 pg_notify inside the transaction (delivered on commit)
   S9 finalize exactly once under the job row lock
   S10 pause / resume / cancel semantics (cancel: pending -> cancelled; running items finish and are stored)
   S11 recovery sweep (expired lease -> pending with attempts+1; at max_attempts -> cell failed provider_unavailable)
   S12 process_available() for deterministic tests
   S13 LISTEN listener (one connection per API process, payload = job id)
   S14 SSE: subscribe before replay, snapshot without id, replay seq > Last-Event-ID, live, heartbeat, close after done
   S15 idempotency insert-first in the same transaction
   S16 job routes and 409 invalid_state
4. List every place where the job path calls credit code (reserve, charge, release, settle, balance). These must be unhooked in P2.1/P2.3.
5. List any test that asserts credit values. These become skipped with reason "credits deferred" in P2.3.

OUTPUT: TRIAGE REPORT with: file list, failing tests, S1-S16 table (KEEP/MODIFY/MISSING + file:line), credit calls to unhook, credit assertions to skip, and the recommended order of fixes. Then stop and wait.
```

**Exit gate:** you have the S1–S16 table and agree with the fix order.

---

### P2.1 — Queue, worker, state machine, recovery (no credits)

> **What:** We build the to-do list in the database and the worker that safely picks up one task at a time.  
> **Why:** Many tasks run in parallel and workers can crash; this design guarantees each cell is done exactly once.

**Exact logic**

1. **Job creation** (`jobs.service.create_job`, called later by runs, research and chat): one transaction inserts the job (`status='queued'`, `progress={done:0,total:N,unit}`, `steps`), inserts all `job_items` (`status='pending'`, `attempts=0`), marks the target cells `pending` through the sheets service, appends the first `progress` event, calls `pg_notify('job_items', '')`, commits.
2. **Claim** (`queue.claim(limit)`), one short transaction:
   ```
   WITH picked AS (
     SELECT i.id
     FROM job_items i JOIN jobs j ON j.id = i.job_id
     WHERE i.status = 'pending' AND j.status IN ('queued','running')
       AND <reply guard: P8 adds it; until then TRUE>
     ORDER BY j.created_at, i.id
     FOR UPDATE OF i SKIP LOCKED
     LIMIT :limit)
   UPDATE job_items SET status='running', lease_until = now() + :lease
   WHERE id IN (SELECT id FROM picked)
   RETURNING id, job_id, kind, row_id, column_id, payload, attempts;
   ```
   `FOR UPDATE OF i` locks only item rows (without `OF`, Postgres would also lock the joined `jobs` rows and block other workers). In the same transaction: `jobs` with `status='queued'` among the claimed → `running`; cells of claimed `cell` items → `running` via the sheets service. Commit **before** executing.
3. **Execute** outside any transaction, with a timeout. Executor exceptions → `ExecResult(status='failed', error={code:'internal_error'})`, stack logged (D5).
4. **Complete** (`queue.complete(item, claimed_attempts, result)`), one transaction:
   - `SELECT … FROM jobs WHERE id=:job_id FOR UPDATE` (serializes all completions and events of one job).
   - Fenced update: `UPDATE job_items SET status='done', result=:r WHERE id=:id AND status='running' AND attempts=:claimed_attempts`. If 0 rows → the lease expired and the item was reclaimed: roll back, log, discard.
   - Cell write via `sheets.write_enrichment_result` (it already skips user-edited cells), `cell_sources` via the sheets service, a `provider_calls` row per call (no cost).
   - Update `jobs.progress` (`done` = finished items with status succeeded, no_data or failed), the column's step (`meta "<done> of <total>"`, `status running | done | completed_with_errors`), and `summary {succeeded, failed, noData}`.
   - Append events in order: `cell`, `progress`, `step` (only if changed) (P2.2 `append_events`).
   - If no item of the job is `pending` or `running` → **finalize** (step 6).
   - `SELECT pg_notify('job_events', :job_id)` (delivered on commit). Commit.
5. **Pause / resume / cancel** (each locks the job row):
   - pause: `queued|running → paused`. Running items finish; nothing new is claimed (claim requires `queued|running`).
   - resume: `paused → running`, `pg_notify('job_items','')`.
   - cancel: `queued|running|paused → cancelled`; pending items → `cancelled`, their cells → `cancelled` via the sheets service; running items finish and their results are stored (plan C7). If nothing is running → finalize now.
   - Any other transition → `ApiError(409, 'invalid_state')`.
6. **Finalize** (only inside a transaction holding the job row lock, only once): if status is `cancelled` keep it; else if any item ended `succeeded` or `no_data` → `succeeded`; else → `failed`. A paused job with remaining pending items is not finalized. Write `result` (per job type; for enrichment `{runId}`), append `done {status, summary, result}`.
7. **Recovery sweep** (worker start + every `recovery_interval_seconds`), job row lock per affected job:
   - expired (`status='running' AND lease_until < now()`) and `attempts + 1 < max_attempts` → `status='pending', attempts=attempts+1, lease_until=NULL`; cell back to `pending`.
   - expired and `attempts + 1 >= max_attempts` → item `done`, cell `failed` with `provider_unavailable`, events, maybe finalize.
   - Incrementing `attempts` here is what makes the fenced update in step 4 reject a late completion from a crashed or slow worker.
8. **Worker loop:** LISTEN `job_items`; wake on notification or every `poll_interval_seconds`; claim up to free slots (`max_concurrency`); run executions as asyncio tasks; on SIGTERM stop claiming, wait up to `shutdown_grace_seconds`, leave the rest to the recovery sweep.
9. **Config validation at startup:** `lease_seconds` must exceed the slowest executor timeout × provider retry attempts + margin; otherwise refuse to start.
10. **Testability:** `worker.process_available(limit=None)` claims and processes until nothing is claimable, synchronously from the test's point of view.

```
TASK: P2.1 — queue, worker, state machine, recovery. NO CREDITS.
Read first: prompt pack P2.0 triage report, the "Exact logic" list for P2.1 in the prompt pack, docs/plan.md sections 8.2 and 7.1, server/mock-api.mjs (advance, processCell, finish, cancelJob).

Implement steps 1-10 exactly as written in the prompt pack for P2.1, in backend/app/modules/jobs/{service.py,queue.py}, backend/app/worker/main.py and backend/app/modules/enrichment/executors/base.py.
- Unhook every credit call listed in the P2.0 report from the job path. Do not delete credit files.
- ExecResult fields (docs/plan.md 7.1): status (succeeded|no_data|failed), value, provenance, confidenceLabel, sources [{url,title}], providerCalls [{provider, endpoint, requestId, statusCode, ms}] (no cost), error {code,message}|None, plus signals: list[SignalDraft] (PG-9). SignalDraft = {type, detail, sourceUrl, detectedAt, confidenceLabel}.
- Cell statuses used: pending, running, succeeded, no_data, failed, cancelled (A4).
- Cell writes, cell status changes and cell_sources ONLY through the sheets service. If a needed function (e.g. mark_cells_running, mark_cells_cancelled, add_cell_sources) does not exist, add it to backend/app/modules/sheets/service.py with tests; do not write those tables elsewhere.
- Fake executor (backend/tests/support/fake_executor.py): outcomes keyed by (enrichment_id, company name). (find_linkedin_highlights, "Brightpath") -> no_data; (find_revenue, "Strata") -> no_data; any enrichment on "Boom Corp" -> failed provider_unavailable; a "Slow Co" row sleeps for a configurable delay (for cancel/crash tests); everything else succeeds with the mock's sample value. Companies are created through sheets.service.add_base_rows.

TESTS (write first; real PostgreSQL)
test_job_state_machine.py
- every legal transition succeeds; illegal ones raise 409 invalid_state (resume a succeeded job, pause a cancelled job, cancel a failed job).
- finalize: mix succeeded+failed -> succeeded; all no_data -> succeeded; all failed -> failed; cancelled stays cancelled; paused job with pending items is not finalized.
test_queue_claim.py
- two concurrent claimers on 50 items: union of claimed ids has 50 unique ids, intersection empty.
- claiming does not block when another transaction holds a lock on the jobs row (proves FOR UPDATE OF i).
- items of paused or cancelled jobs are never claimed.
- claim sets cells running via the sheets service (assert cell status running).
- fenced completion: claim (attempts=0), simulate recovery (attempts -> 1), call complete with claimed_attempts=0 -> discarded, cell not written.
- job progress, step meta "<done> of <total>" and summary {succeeded, failed, noData} match DB after process_available().
test_worker_recovery.py
- expired lease (set lease_until in the past via SQL in the test) -> sweep -> pending with attempts+1; at max_attempts -> cell failed with error.code provider_unavailable and job finalized.
- crash: start processing with "Slow Co", kill the worker task mid-execution, run the sweep after expiry, process again -> every cell has exactly one final result; no item processed twice to completion.
- cancel with one running ("Slow Co") and several pending: pending -> cancelled; the running item finishes and its value is stored; job ends cancelled with exactly one done event.
- startup config validation rejects lease_seconds below the executor timeout budget.
- H4: run with a fake key in env; key value absent from logs and DB.

DO NOT: implement events/SSE beyond calling a stub append_events (P2.2), routes (P2.3), credits, or any provider.
FINISH: all P0, P1 and new tests green; update docs/backend-paths.md; PHASE REPORT.
```

**Exit gate:** concurrency test (no double claim), fencing test, crash test and cancel test green.

---

### P2.2 — Event log, LISTEN fan-out, SSE

> **What:** We record every progress update in order and stream it live to the browser, with replay after a dropped connection.  
> **Why:** Users watch cells fill in real time; if the Wi-Fi blips, they must get back exactly what they missed — no gaps, no repeats.

**Exact logic**

1. **`events.append_events(session, job_id, [(name, data), …])`** — caller must hold the job row lock (step 4 of P2.1). `seq` = `COALESCE(MAX(seq),0) + 1` for the job, incremented per event in the list. PK `(job_id, seq)` makes a violation impossible to miss. The only writer of `job_events`.
2. **Event payloads:** `progress {done,total,unit}` · `step {key,label,status,meta}` · `cell` CellView (A1, A8; no `cost`) · `token {messageId, delta}` (P8) · `done {status, summary, result}` · `error {code, message}`.
3. **Listener** (`listener.py`): one dedicated DB connection per API process running `LISTEN job_events`; payload = job id only (D7); in-memory map `job_id → set[asyncio.Event]`; wake every subscriber of that job. Reconnect with backoff if the connection drops; on reconnect wake all subscribers (they re-read from the DB).
4. **SSE generator** (`sse.stream(job_id, last_event_id)`):
   1. Register the subscriber **before** reading the DB (no window where an event is missed).
   2. `cursor` = `Last-Event-ID` header, else `?lastEventId=`, else 0 (non-integer → 0).
   3. Send a `progress` snapshot from the current job row **without an `id:` line** (so the browser's last id is not moved by a synthetic event).
   4. Loop: read events `seq > cursor ORDER BY seq LIMIT 500`; send each as `id: <seq>` / `event: <name>` / `data: <json>`; set `cursor`; if a `done` was sent → stop. Otherwise wait for the subscriber event, the heartbeat timeout (send `: ping`), or `poll_interval_seconds` (re-query anyway).
   5. If the job is terminal and nothing is left after `cursor` → send snapshot + a `done` built from the job row (no `id:`), then close.
   6. On client disconnect: unregister in `finally`.
5. **HTTP response headers:** `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `X-Accel-Buffering: no`.

```
TASK: P2.2 — event log, LISTEN fan-out, SSE.
Read first: the "Exact logic" list for P2.2 in the prompt pack; docs/plan.md section 8.2 (SSE); server/mock-api.mjs (sse handling, sendEvent).

Implement backend/app/modules/jobs/{events.py,listener.py,sse.py} exactly per that list, and replace the P2.1 stub so every completion/transition appends events through events.append_events and issues pg_notify('job_events', job_id) inside the same transaction. Start/stop the listener with the FastAPI lifespan. Do not add Redis or any broker.

TESTS
test_events_seq.py
- 3 concurrent completions on one job produce seq 1..N with no gaps and no duplicates.
- append_events refuses to run without the job row lock (assert or documented precondition test).
test_sse.py (test the generator directly for live/replay; one HTTP test for framing)
- first message is a progress snapshot with no id line.
- events arrive in seq order with id = seq.
- reconnect with Last-Event-ID = k replays exactly seq > k (no duplicates, no gaps); ?lastEventId works the same; invalid value behaves as 0.
- race: an event appended between subscribe and the first DB read is delivered exactly once.
- missed notification: disable the listener, append events, the poll fallback still delivers them within poll_interval.
- terminal job: snapshot then done, stream closes; reconnect after done: snapshot + done (no id) and close.
- heartbeat ": ping" sent when idle (short interval in test).
- HTTP framing test against a terminal job via the ASGI app: correct headers and "id:/event:/data:" frames.
- disconnect unregisters the subscriber (subscriber count back to 0).

DO NOT: add routes other than what tests need through the generator; routes come in P2.3.
FINISH: all tests green; update docs/backend-paths.md; PHASE REPORT.
```

**Exit gate:** seq gap test, replay test, race test and poll-fallback test green.

---

### P2.3 — Job routes, idempotency, test-only run entry, ported lifecycle tests, A13

> **What:** We expose the job endpoints, make "send twice" safe, and replay the mock server's tests against the real engine.  
> **Why:** The mock's tests are our definition of correct; passing them proves the engine behaves the way the frontend expects.

**Exact logic**

1. **Routes:** `GET /jobs/:jobId` → `{id, type, status, progress, steps, summary, result, error, createdAt, updatedAt}` (no credit fields, A13); `GET /jobs/:jobId/events` → `sse.stream`; `POST /jobs/:jobId/pause|resume|cancel` → transitions from P2.1; unknown job → 404 `not_found`; invalid → 409 `invalid_state`.
2. **Idempotency (insert-first, same transaction as the creation):**
   - `INSERT INTO idempotency_keys (workspace_id, key, route, request_hash) VALUES (…) ON CONFLICT DO NOTHING RETURNING key`.
   - Row returned → do the work, then store `response` (status + body) in that row, commit.
   - No row → another request owns the key; Postgres makes this insert wait until the other transaction commits, so then `SELECT response` and return it with the stored status. Different `request_hash` → still return the original and log a warning (Q9 default).
3. **Test-only run entry (PG-1):** `backend/tests/support/test_routes.py` mounts a minimal `POST /enrichments/runs` only in tests: validates like the mock (`validateRun`), creates the job through `jobs.service.create_job`, uses the fake executor. Never registered by app code. P5 deletes it.
4. **A13** in `docs/api-contract.md`, under "Amendments for backend v1": "Credit fields deferred in this release: `estimatedCredits`, `chargedCredits`, cell `cost`, project `creditsUsed`, workspace `credits`, `GET /me`, `estimatedOnly` (422 `not_supported` if true), `insufficient_credits`."
5. **Credit tests from the earlier attempt:** mark them `skip(reason="credits deferred")`; do not delete.

```
TASK: P2.3 — job routes, idempotency, test-only run entry, ported lifecycle tests, A13.
Read first: the "Exact logic" list for P2.3 in the prompt pack; docs/plan.md sections 8.9, 9.2 (validation rules), 12; server/mock-api.test.mjs in full.

Implement backend/app/api/jobs.py, backend/app/idempotency.py, backend/tests/support/test_routes.py and the A13 doc change exactly per that list.

TESTS
backend/tests/contract/test_job_lifecycle.py — port mock tests 2-7, dropping every credit assertion:
 a) run enriches rows: 2 rows x find_funding -> both cells succeeded with values; progress {done:2,total:2,unit:"cells"}; job succeeded; summary {succeeded:2, failed:0, noData:0}.
 b) partial no-result: rows Acme and Brightpath x find_linkedin_highlights -> job succeeded; Brightpath cell no_data with value null; summary {succeeded:1, failed:0, noData:1}.
 c) all failed: "Boom Corp" -> job failed; cell failed with error.code provider_unavailable.
 d) cancel: 4 rows (one "Slow Co") x 2 columns; cancel after >=1 done -> status cancelled; pending cells cancelled; the running cell's result stored; exactly one done event.
 e) idempotency: same Idempotency-Key twice -> identical body and status; one job in DB. Concurrent duplicate (two tasks at once) -> still one job.
 f) validation keeps the envelope: empty rowIds -> 422 validation_error; unknown row -> 422 unknown_row_ids with details.unknown; unknown enrichment -> 422 unknown_enrichment; duplicate column key -> 422 duplicate_column_key; estimatedOnly true -> 422 not_supported.
backend/tests/unit/test_idempotency.py: replay returns stored status+body; different body + same key returns original and logs a warning.
Route tests: GET unknown job -> 404 not_found; pause a succeeded job -> 409 invalid_state; job view contains no estimatedCredits/chargedCredits keys.
Doc test: docs/api-contract.md contains A13 exactly once under "Amendments for backend v1".

DO NOT: build the real /enrichments/runs (P5), the catalog (P3), credits, or /me.
FINISH: all tests green (credit tests skipped with reason); update docs/backend-paths.md; PHASE REPORT for the whole of P2 (P2.1-P2.3).
```

**Exit gate (P2):** `pytest backend/tests -q` green · ported tests a–f green · no route returns a credit field.

---

## P3 — Canonical enrichment catalog

> **What:** One official menu of every lookup we can do, with its type and on/off switch.  
> **Why:** Today three screens show three different menus; one shared menu stops the mismatch.

**Goal:** `GET /enrichments/catalog` serves plan §6 exactly; excluded items never appear; gated items appear only when their flag is on.
**Read in plan:** §6, §3 (C1–C3), §11 (P3); `server/mock-api.mjs` `CATALOG`, `catalogView`; `server/mock-api.test.mjs` test 1; `src/pages/workspace/model.ts` `COL_TYPES` (~lines 457–665).

| Path | Purpose | Tag |
|---|---|---|
| `backend/app/modules/catalog/registry.py` | typed registry (code, not a table) | plan |
| `backend/app/schemas/catalog.py` | `CatalogItem` DTO | new |
| `backend/app/api/enrichments.py` | `GET /enrichments/catalog` only | plan |
| `backend/app/config.py` | gate flags (default false) | existing |
| `backend/tests/contract/test_catalog.py` | tests | plan |

**Catalog (plan §6; `cost` is display metadata only)**

| id | cost | outputType | appliesTo | source | status |
|---|---|---|---|---|---|
| `find_company_domain` | 2 | link | companies | exa | live |
| `find_snapshot` | 3 | text | companies | exa | live |
| `find_funding` | 3 | badge | companies | exa | live |
| `find_revenue` | 2 | text | companies | exa | live |
| `find_company_news` | 3 | text | companies | exa | live |
| `find_job_openings` | 3 | text | companies | exa | gated (G4) |
| `find_social_profiles` | 2 | chips | companies | exa | live |
| `find_core_values` | 3 | text | companies | exa | live |
| `find_free_trial` | 2 | badge | companies | exa | live |
| `find_pricing` | 3 | text | companies | exa | live |
| `find_gtm_strategy` | 5 | text | companies | exa | live |
| `find_revenue_model` | 3 | text | companies | exa | live |
| `find_product_categories` | 2 | chips | companies | exa | live |
| `classify_b2b_b2c` | 2 | badge | companies | exa | live |
| `find_competitors` | 2 | chips | companies | exa | live |
| `find_leadership_changes` | 4 | text | companies | exa | live |
| `find_tech_stack` | 6 | chips | companies | exa | gated (Q6) |
| `find_linkedin_highlights` | 4 | text | companies | exa | gated (G2) |
| `find_decision_makers` | 20 | people | companies | moltsets | gated (G3) |
| `find_work_email` | 3 | email | leaders | moltsets | gated (G3) |
| `custom_prompt` | 3 | text | companies | exa | live |
| `plain_value` | 0 | text | any | user | live |

Excluded (not in the registry): `website_intent`, `add_to_hubspot`. Default response = 17 items; all gates on = 22.

```
TASK: P3 — canonical enrichment catalog.
Read first: docs/plan.md sections 3 (C1-C3), 6, 11 (P3); server/mock-api.mjs CATALOG and catalogView; server/mock-api.test.mjs test 1; src/pages/workspace/model.ts COL_TYPES.

1. backend/app/modules/catalog/registry.py: typed entries with id, name, description, cost (display only), outputType, appliesTo, source, status (live|gated), gateFlag (config key or None), requiresInputs (["domain"] for company enrichments that need it, ["name"] for find_company_domain, ["linkedinUrl or name+companyDomain"] described as a structured list for find_work_email, [] for plain_value), executor reference resolved lazily (executors arrive in P4a/P4b; an unresolved executor must not break import or the catalog route).
2. Implement exactly the 22 rows of the prompt pack P3 table. Names/descriptions: reuse the mock CATALOG text for its 12 ids (find_company_news, find_funding, find_tech_stack, find_revenue, find_job_openings, find_linkedin_highlights, find_social_profiles, find_gtm_strategy, find_core_values, find_free_trial, find_snapshot, find_decision_makers); for the others reuse the descriptions in Workspace COL_TYPES. Do not write new marketing text.
3. GET /enrichments/catalog -> {"data":[CatalogItem]} with id, name, description, cost, outputType, appliesTo, source, status, requiresInputs. Live items always; a gated item only when its flag is true. Never expose executor references or internal fields.
4. Gate flags in config, default false; record their names in docs/backend-paths.md.
5. Provide registry helpers used later: get(id) (raises unknown_enrichment), is_enabled(id), runnable(id) (false for plain_value).

TESTS (backend/tests/contract/test_catalog.py)
- default config -> 17 items; all flags on -> 22; each flag enables only its own item(s) (G3 enables find_decision_makers AND find_work_email).
- parametrized: every id has exactly the table's cost, outputType, appliesTo, source.
- sources only in {exa, moltsets, user}; no item has keys executor/sample/internal.
- excluded ids never appear in any configuration; ids unique.
- get("nope") raises unknown_enrichment; runnable("plain_value") is false.
- no module other than catalog reads the cost field (ast scan of backend/app for ".cost" attribute access on catalog entries outside modules/catalog and schemas/catalog.py).

DO NOT: implement executors or runs.
FINISH: all tests green; update docs/backend-paths.md; PHASE REPORT.
```

**Exit gate:** 17 / 22 counts verified · cost-field ast test green.

---

## P4a — Exa adapter and Exa-based executors

> **What:** We connect Exa and build one tested lookup per Exa-based menu item.  
> **Why:** Each lookup must find the right company and attach proof, or honestly say "no data".

**Phase goal:** a typed Exa client plus one tested executor per Exa-based catalog item, with entity and citation rules enforced and gates documented.
**Read in plan:** §5.1, §5.3, §7.1, §7.2, §8.7, §8.8, §11 (P4a); Exa OpenAPI `https://exa.ai/docs/exa-spec.yaml`.
**Fixture rule:** tests use `backend/tests/fixtures/exa/<enrichment_id>/<case>.recorded.json` (real responses recorded by `backend/scripts/record_provider_fixture.py` with the human's key) or `<case>.synthetic.json` (hand-written, schema-faithful). Synthetic fixtures may back unit tests but never a gate result.

### P4a.1 — Exa client, error mapping, fixture recorder

> **What:** One careful phone line to Exa, and clear rules for what to do when the line is busy or broken.  
> **Why:** Every Exa lookup goes through it, so it must retry politely, never leak the key, and never send forbidden requests.

| Path | Purpose | Tag |
|---|---|---|
| `backend/app/modules/providers/exa/client.py` | async `search()`, `contents()` | new |
| `backend/app/modules/providers/exa/models.py` | request builders + response models | new |
| `backend/app/modules/providers/exa/errors.py` | typed errors | new |
| `backend/app/modules/providers/exa/schema_limits.py` | `outputSchema` limits validator | new |
| `backend/app/modules/providers/service.py` | `record_provider_call()` (only writer of `provider_calls`) | new |
| `backend/scripts/record_provider_fixture.py` | records `*.recorded.json` | plan |
| `backend/tests/unit/test_exa_client.py`, `test_exa_schema_limits.py` | tests | new |

**Exact logic (plan §5.1, §8.8)**
- Base URL `https://api.exa.ai`; header `x-api-key` from env `EXA_API_KEY`; httpx async client, one per process, connection pooling, explicit timeouts from config.
- Builders reject locally (no request sent): `type` other than `auto`, `lite`, `deep-lite`, `deep` (so `fast`, `instant`, `deep-reasoning` are rejected); `category` `company`/`people` with `startPublishedDate`/`endPublishedDate`; `category` `people` with `excludeDomains`; `numResults` outside 1–100; more than 1,200 domains in `includeDomains`/`excludeDomains`; any invalid `outputSchema`.
- Deprecated fields are never emitted: `livecrawl`, `subpages` on `/search`, `includeText`, `excludeText`, `context`, `startCrawlDate`, `endCrawlDate`. `/research/v1` is never called.
- `outputSchema` limits: root `text` or `object`; ≤10 properties in total (nested and array-item properties count); ≤2 nesting hops (each object-properties container or array `items` counts one hop); every array has `items`.
- Response model: `results[]` (`title, url, publishedDate, id, text, highlights, summary, extras, entities`), `output.content`, `output.grounding[] {field, citations[{url,title}], confidence}`, `requestId`, `warnings` (logged).
- Errors: 429, 503, 500 (D6), network timeout → retry with exponential backoff + jitter, honour `Retry-After`, up to `exa_max_attempts`; 402 → `ExaOutOfCredits` (job-level `provider_out_of_credits`, no retry); 400 → `ExaRejected` (cell `provider_rejected_request`, no retry); 401/403 → `ExaAuth` (job-level `provider_auth`, no retry).
- Each HTTP call → one `provider_calls` row via `providers.service.record_provider_call` (provider, endpoint, status_code, request_id, ms, job_id, row_id; `cost_dollars` stays NULL).
- `userIdentifier` = hash of workspace id matching `^[A-Za-z0-9_-]{1,64}$`.

```
TASK: P4a.1 — Exa client, error mapping, fixture recorder.
Read first: docs/plan.md sections 5.1, 7.1 (rule 6), 8.8; the Exa OpenAPI (/search and /contents only); the "Exact logic" list for P4a.1 in the prompt pack.

Implement the files in the P4a.1 table exactly per that logic, with httpx (no Exa SDK, no Agent API, no Websets, no /answer). backend/scripts/record_provider_fixture.py takes an enrichment id + company domain (+ name), calls the real client, writes the raw response JSON to backend/tests/fixtures/exa/<enrichment_id>/<case>.recorded.json, refuses to run without EXA_API_KEY, never writes the key.
Job-level errors (402, 401/403) must reach the worker as typed exceptions so P5 can fail the job and stop claiming its items.

TESTS (httpx.MockTransport; no network)
- x-api-key header sent; its value absent from logs, exception text and provider_calls (H4).
- each rejected type/category/filter/numResults/domain-count combination raises before any request (transport call count 0); category news + startPublishedDate allowed.
- request bodies never contain a deprecated field (inspect every builder's output).
- 429 then 200 -> 1 retry, Retry-After honoured (fake sleep); 503 and 500 x exa_max_attempts -> ExaUnavailable; 402 -> ExaOutOfCredits with 0 retries; 400 -> ExaRejected with 0 retries; 401/403 -> ExaAuth with 0 retries; timeout retried.
- success writes exactly one provider_calls row with status_code and request_id, cost_dollars NULL.
- schema limits: 10 properties pass / 11 fail; depth 2 pass / 3 fail; array without items fails; root "string" fails.

DO NOT: write executors.
FINISH: tests green; update docs/backend-paths.md; short sub-report.
```

### P4a.2 — Entity-based executors: `find_company_domain`, `find_snapshot`, `find_revenue`, `find_funding`

> **What:** The first lookups — website, company snapshot, revenue, funding — from Exa's ready-made company profiles.  
> **Why:** They're the safest place to lock in the shared rules: right company, proof attached, or "no data".

**Shared executor rules (plan §7.1) — apply to every executor from here on**
1. Missing required input → `failed`, `error.code="missing_input"`, **zero** provider calls.
2. Entity check: a result counts as evidence about the company only if its URL host equals the row's normalized domain or is a subdomain (`evil-acme.io` ≠ `acme.io`) — except third-party searches (news, leadership, competitors).
3. `verified` executors: no grounding citation → `no_data`. `ai_inferred` executors keep the value and store citations when present; they never return `verified`.
4. Every `outputSchema` call sends the exact config `systemPrompt`: "Use only facts stated in the sources. If the requested information is not stated, return null for that field."
5. Each executor module exposes `EXECUTOR_VERSION` (int, used by the P5 cache key) and its schemas (for the limits test).

| Executor | Call | Value | Provenance |
|---|---|---|---|
| `find_company_domain` | `/search` `category: company`, `type: auto`, query `"<name> <loc>"`, `numResults: 5` | one candidate whose entity name equals the row name after normalization → its host; several → `no_data` + `conflicting` (candidates in `sources`); none → `no_data` | `provider_reported` / `conflicting` |
| `find_snapshot` | `/search` `includeDomains:[domain]`, `category: company`, `numResults: 3`; entity whose result host == domain | `"{description} · {workforce.total} employees · {headquarters.city}, {headquarters.country}"`, missing parts dropped; all missing → `no_data` | `provider_reported` |
| `find_revenue` | same entity lookup | `financials.revenueAnnual` → `"$28M (estimated)"`; null → `no_data`; no model fallback | `estimated` |
| `find_funding` | 1) entity `financials.fundingLatestRound` → `"{name} — ${amount}"` (+ date). 2) only if 1 is null: `category: news`, query `"<name> raises funding round"`, `startPublishedDate` = now − 730 days (config), schema `{roundName, amountUsd, announcedDate, leadInvestor}` | step 2 requires a citation and emits one `SignalDraft(type="Funding")` | 1 `provider_reported`; 2 `verified` |

```
TASK: P4a.2 — entity-based executors.
Read first: docs/plan.md sections 5.1 (company entity fields), 7.1, 7.2, 8.7; the shared rules and table for P4a.2 in the prompt pack.

1. backend/app/modules/enrichment/executors/common.py: host_matches_domain(url, domain); format_usd_short(n) (28_000_000 -> "$28M", 1_500_000 -> "$1.5M", 4_000_000 -> "$4M", 950_000 -> "$950K"); require_inputs(row, keys); apply_citation_rule(result, mode); prompt_hash(prompt, params) (sha256 of a canonical JSON; used by P5).
2. One module per executor: find_company_domain.py, find_snapshot.py, find_revenue.py, find_funding.py, each with EXECUTOR_VERSION and registered in the catalog registry.
3. Name matching for find_company_domain uses the normalized-name function from P1 (legal suffix list in config).

TESTS (backend/tests/unit/executors/test_entity_executors.py; fixtures per executor)
For each: succeeded, no_data, failed (Exa 503 exhausted -> failed provider_unavailable), missing input -> failed missing_input with 0 client calls. Plus:
- find_company_domain: one match -> host; two matches -> no_data + provenance conflicting + both hosts in sources; "Acme, Inc." matches entity "ACME".
- find_snapshot: exact string with all parts; missing workforce -> no stray separators; entity from another domain ignored.
- find_revenue: 28000000 -> "$28M (estimated)" provenance estimated; null -> no_data; no outputSchema request ever made.
- find_funding: step 1 present -> exactly 1 request; step 1 null + grounded step 2 -> verified + one Funding signal; step 2 without citation -> no_data + no signal; startPublishedDate = now - 730 days (frozen clock).
- host_matches_domain and format_usd_short cases above.
- every verified result has >= 1 source; every schema passes validate_output_schema.

FINISH: tests green; update docs/backend-paths.md.
```

### P4a.3 — News, leadership, social: `find_company_news`, `find_leadership_changes`, `find_social_profiles`

> **What:** Lookups that depend on dated news stories, plus the company's social links.  
> **Why:** News is only useful with a date and a link, so these get strict proof rules and feed the Signals sheet.

| Executor | Call | Value | Provenance |
|---|---|---|---|
| `find_company_news` | `/search` `category: news`, query `"<name>"`, `startPublishedDate` = now − 90 days (config), `numResults: 10`, `contents.highlights: true` | keep results whose title or highlights contain the name or domain; newest kept → `"{title} ({publishedDate})"`, source = its URL, one `SignalDraft(type="News")`; none → `no_data` | `verified` |
| `find_leadership_changes` | `category: news`, query `"<name> appoints OR hires OR joins as chief OR VP OR head"`, last 90 days (config), schema `{changes: array of {person, role, type: "hire"\|"departure", date}}`, citations required | `"New {role}: {person} ({date})"` joined by `; `; empty → `no_data` | `verified` |
| `find_social_profiles` | `/contents` for `https://{domain}`, `extras.links: 100`; no model | links whose host matches the config list (`linkedin.com/company`, `x.com`, `twitter.com`, `youtube.com`, `facebook.com`, `instagram.com`) | `verified` (source = homepage) |

```
TASK: P4a.3 — news, leadership, social executors.
Read first: docs/plan.md sections 7.2 and 8.7; the P4a.3 table in the prompt pack. Reuse common.py.

Implement the three executors per the table. News and leadership are third-party searches: no host==domain check; instead keep a result only if the company name or domain appears in its title/highlights (news) or cited text (leadership). find_social_profiles uses /contents only, never outputSchema.

TESTS
- news: mention -> value "<title> (<date>)", one News signal (sourceUrl = cited URL, detectedAt = publishedDate); non-mentions discarded; all discarded -> no_data, no signals; startPublishedDate = now - 90 days; highlights requested.
- leadership: one grounded hire -> "New VP Sales: Jane Doe (2026-09-01)"; two joined with "; "; uncited change dropped; empty -> no_data; schema passes limits.
- social: linkedin.com/company/acme + x.com/acme + unrelated link -> only the two social URLs; none -> no_data; request is /contents with extras.links 100 and no outputSchema.
- all three: missing input -> failed missing_input, 0 calls; Exa 503 exhausted -> failed provider_unavailable.

FINISH: tests green; update docs/backend-paths.md.
```

### P4a.4 — Domain-scoped and AI-inferred executors

> **What:** Lookups that read a company's own website (pricing, trials, values) or need careful reasoning (competitors, strategy).  
> **Why:** Website facts need a cited page; reasoning-based answers are labelled as AI interpretations, never as facts.

| Executor | Call and schema | Provenance |
|---|---|---|
| `find_core_values` | `/search` `includeDomains:[domain]`, `type: auto`, `numResults: 5`; `{values: array of string}` | `verified` |
| `find_free_trial` | same; `{offersFreeTrial: boolean\|null, trialLength: string\|null}` → `"Free trial available (14 days)"`, or `"No free trial found"` only if `false` is cited; `null` → `no_data` | `verified` |
| `find_pricing` | same; `{pricingPublished: boolean\|null, startingPrice: string\|null, pricingModel: string\|null}` | `verified` |
| `find_job_openings` (gated G4) | `includeDomains:[domain]`, query `"careers open positions"`; `{openRoleCount: number\|null, gtmRoles: array of string}` → `"{n} open roles; GTM: {roles}"` | `verified` |
| `find_gtm_strategy`, `find_revenue_model` | `type: deep-lite`, query = column prompt or catalog description + `"Company: <name> (<domain>)"`, `outputSchema {type:"text"}` | `ai_inferred` |
| `find_product_categories` | `deep-lite`; `{categories: array of string}` | `ai_inferred` |
| `classify_b2b_b2c` | `deep-lite`; `{model: "B2B"\|"B2C"\|"Both"\|null}` | `ai_inferred` |
| `find_competitors` | `deep-lite`; `{competitors: array of string}`, keep first 3 | `ai_inferred` |
| `find_tech_stack` (gated Q6) | `/search` query `"<name> technology stack tools integrations"`; `{technologies: array of string}` — mentions in public pages, not script detection | `ai_inferred` |
| `find_linkedin_highlights` (gated G2) | `includeDomains:["linkedin.com"]`, query `"<name> company page"`, `contents.highlights: true`, `numResults: 3`; only a `linkedin.com/company/…` URL; up to 3 highlights | `verified` |
| `custom_prompt` | `deep-lite`; query `"<user prompt>. Company: <name> (<domain>)"`; `outputSchema {type:"text"}` | `ai_inferred` |

`plain_value` has no executor.

```
TASK: P4a.4 — domain-scoped and AI-inferred executors.
Read first: docs/plan.md sections 7.1 and 7.2; the P4a.4 table in the prompt pack.

Implement each executor per the table, one module each, with EXECUTOR_VERSION, registered in the catalog. Domain-scoped executors apply the entity check and the verified citation rule. AI-inferred executors never return "verified". Query text = the column prompt if set, else the catalog description. Do not change catalog text for find_tech_stack unless Q6 is answered.

TESTS (succeeded / no_data / failed for every executor, plus)
- free trial: false without citation -> no_data; true + "14 days" cited -> "Free trial available (14 days)"; null -> no_data.
- pricing/core values/job openings: other-domain result discarded; no citation -> no_data.
- competitors: 5 returned -> 3 kept; b2b/b2c: "Both" accepted, other strings -> no_data.
- every AI-inferred executor: value without citations still succeeds as ai_inferred with empty sources.
- linkedin highlights: non /company/ URL -> no_data; max 3 highlights.
- custom_prompt: the user prompt is in the query; prompt_hash differs for different prompts.
- one test imports every executor schema and passes validate_output_schema; H4 key check on results and errors.

FINISH: tests green; update docs/backend-paths.md.
```

### P4a.5 — Provider gates G1, G2, G4 (procedures only)

> **What:** We write the checklist for testing Exa on real companies and leave the results blank.  
> **Why:** Fake test data can't prove real-world quality, so people run the real check and nobody can pretend it passed.

```
TASK: P4a.5 — provider gates documentation. No live calls.
Read first: docs/plan.md section 5.3.

Create docs/provider-gates.md. For each of G1 (entity resolution, 30 known domains), G2 (LinkedIn coverage, 20 companies), G4 (careers coverage, 20 domains):
- the exact test from docs/plan.md 5.3, the commands to run with backend/scripts/record_provider_fixture.py (EXA_API_KEY set), a results table (date, sample size, hits, hit-rate, reviewer, PASS/FAIL), an empty "threshold (Q5)" cell, and which config flag flips on PASS.
Add a section "Live smoke test for P5" with blank steps to be filled in during P5.
Never mark a gate as passed.

FINISH: PHASE REPORT for all of P4a (executors implemented, test counts per executor, engineering defaults, D6 note).
```

**Exit gate (P4a):** all Exa executors pass succeeded/no_data/failed/missing_input tests · schema-limit test covers every schema · no test touches the network · `docs/provider-gates.md` exists with blank results.

---

## P5 — Enrichment runs (Flow 2: catalog → column → cells)

> **What:** The real "Run" logic: validate the request, queue exactly one task per eligible cell, fill each cell with proof, and reuse cached answers when allowed.  
> **Why:** Home, Workspace and Copilot all use this one engine, so it must be correct, race-free and repeatable.

**Goal:** `POST /enrichments/runs` and `GET /enrichments/runs/:runId` on real executors; cache (off until TTLs); Signals derivation; P2 lifecycle tests pass unchanged against the real route.
**Read in plan:** §8.6, §8.7, §9.2, §11 (P5), §12; `server/mock-api.mjs` (`validateRun`, `createRun`, `runView`, `cellView`).

| Path | Purpose | Tag |
|---|---|---|
| `backend/app/modules/enrichment/service.py` | validate + create run atomically | new |
| `backend/app/modules/enrichment/runner.py` | worker-side: cache → executor → result | new |
| `backend/app/modules/enrichment/cache.py` | cache read/write | new |
| `backend/app/modules/enrichment/signals.py` | `SignalDraft` → Signals rows via sheets service | new |
| `backend/app/modules/sheets/service.py` | add `queue_cells_for_run()`, `upsert_signal_rows()` | existing |
| `backend/app/api/enrichments.py` | add the two run routes | plan |
| `backend/app/schemas/enrichment.py` | DTOs, `CellView` | new |
| `backend/tests/support/test_routes.py` | **delete** | new |
| `backend/tests/integration/test_enrichment_runs.py`, `test_cache.py`, `test_signals.py` | tests | new |

**Exact logic**

1. **Request:** `{target:{sheetId,rowIds}, columns:[{key,label?,type?,enrichmentId,prompt?,params?}], refresh?, overwriteEdited?}` + `Idempotency-Key`.
2. **One transaction** (`enrichment.service.create_run`):
   1. idempotency insert-first (P2.3);
   2. validate in this order, each with the envelope: `estimatedOnly:true` → 422 `not_supported`; empty `rowIds` → 422 `validation_error`; empty `columns` → 422 `validation_error`; more rows than `run_max_rows` → 422 `validation_error`; duplicate keys → 422 `duplicate_column_key`; unknown or disabled enrichment → 422 `unknown_enrichment`; `plain_value` → 422 `not_runnable`; catalog `appliesTo` ≠ sheet kind → 422 `validation_error`; rowIds not in this sheet → 422 `unknown_row_ids` (`details.unknown`); existing key with another `enrichmentId` → 422 `validation_error`;
   3. create missing columns via `sheets.add_column` (key as given);
   4. `sheets.queue_cells_for_run(sheet, row_ids, column_ids, overwrite_edited)`: a single `INSERT … ON CONFLICT (row_id, column_id) DO UPDATE SET status='pending', … WHERE cells.status NOT IN ('pending','running') AND (NOT cells.user_edited OR :overwrite) RETURNING row_id, column_id` — this atomically decides eligibility and marks cells pending (D1), with no read-then-write race;
   5. zero returned → 422 `validation_error` with `details {reason:"no_eligible_cells", skipped:{userEdited, inProgress}}` and roll back (D2);
   6. insert `enrichment_runs`; `jobs.service.create_job(type='enrichment', items=returned cells)`; `job.result = {runId}`;
   7. store the idempotent response, commit (the job creation already did `pg_notify`).
   8. Response `202 {runId, jobId, status:"queued"}`.
3. **Worker side** (`runner.execute_item`): load row + column + catalog entry → if a TTL is configured for this enrichment and `refresh` is false, look up `(normalized_domain, enrichment_id, prompt_hash, EXECUTOR_VERSION)` with `created_at > now() − ttl` → hit returns the stored result with zero provider calls; miss → executor. Typed job-level errors (`ExaOutOfCredits`, `ExaAuth`) → cancel the job's pending items and finalize the job `failed` with `error {code}`; cell-level errors → cell `failed`.
4. **In the completion transaction** (P2.1 step 4): if `succeeded` and caching is on → upsert cache (D3); each `SignalDraft` → `sheets.upsert_signal_rows` (lazy Signals sheet `kind:'signals'`, N4 columns, dedupe D4, `freshness`/`relevance` null).
5. **Run view** `GET /enrichments/runs/:runId` → `{id, jobId, sheetId, status, columns, cells:[CellView]}`; `CellView` = `{rowId, columnKey, enrichmentId, status, value, provenance, source, sources, confidence:null, confidenceLabel, userEdited, stale, fetchedAt, error}` (no `cost`). Unknown → 404.

```
TASK: P5 — enrichment runs.
Read first: docs/plan.md sections 8.6, 8.7, 9.2, 11 (P5), 12; the "Exact logic" list for P5 in the prompt pack; server/mock-api.mjs validateRun/createRun/runView/cellView. N4 must be answered (Signals base columns); otherwise STOP.

Implement the files in the P5 table exactly per that logic. Add queue_cells_for_run and upsert_signal_rows to the sheets service (only writer). Then delete backend/tests/support/test_routes.py and run backend/tests/contract/test_job_lifecycle.py against the real route without changing assertions (only fixture plumbing). If an assertion cannot pass, STOP and report.
Fill "Live smoke test for P5" in docs/provider-gates.md with manual steps (3 rows). Do not run live calls.

TESTS
- P2 lifecycle tests a-f pass against the real route (same test ids).
- validation matrix: one test per error in step 2.ii, in order (a request with two errors returns the first one listed).
- eligibility: user_edited skipped (value unchanged) unless overwriteEdited; running AND pending cells skipped (D1); zero eligible -> 422 with reason and counts, no run/job rows (D2).
- race: two concurrent runs on the same cells -> each cell has exactly one pending item across both jobs.
- job-level provider error (fake raises ExaOutOfCredits) -> job failed with error.code provider_out_of_credits, remaining items cancelled.
- cache: TTL unset -> executor called twice for two identical runs; TTL set -> once; refresh true bypasses; prompt change or EXECUTOR_VERSION change misses; no_data never cached (D3).
- signals: news success -> one Signals row (type News, source = cited host, detectedAt = publishedDate, freshness/relevance null); rerun -> still one row (D4); no_data -> none; funding step-2 -> Funding row.
- run view: CellView keys exactly as listed (no cost); verified cells have >= 1 source; unknown run -> 404.
- idempotency replay -> same runId/jobId.

FINISH: all tests green; update docs/backend-paths.md; PHASE REPORT.
```

**Exit gate:** P2 tests green on the real route · race test green · cache-off default verified.

---

## P6 — Workspace and research sheets (Flow 5: read → edit → run → export)

> **What:** Everything the spreadsheet screen needs: read, search, sort, filter, edit, add/remove columns, run cells, export, and the side panel.  
> **Why:** This is where people work with their data every day, so it must be fast with big sheets, safe to edit, and exportable with proof included.

**Goal:** Workspace endpoints from plan §10 (rows 16–28 without estimates/credits), efficient queries, streaming export.
**Read in plan:** §8.4, §8.5, §9.5, §10, §11 (P6); `docs/api-contract.md` "Workspace"; `src/pages/workspace/components/table/gridUtils.ts`.

| Path | Purpose | Tag |
|---|---|---|
| `backend/app/api/workspace.py` | Workspace routes | plan |
| `backend/app/api/downloads.py` | `GET /downloads/:token` | plan |
| `backend/app/modules/sheets/query.py` | search/filter/sort/hide/keyset pagination | new |
| `backend/app/modules/sheets/service.py` | add read functions (project view, sheets, rows, context) | existing |
| `backend/app/modules/exports/service.py` | streaming CSV, write-only XLSX, tokens | plan |
| `backend/app/schemas/workspace.py` | DTOs | new |
| `backend/tests/integration/test_workspace_read.py`, `test_workspace_edit.py`, `test_workspace_run.py`, `test_exports.py`, `test_workspace_context.py` | tests | new |

**Exact logic**

- `GET /workspace/projects/:id` → `{id, name, sheets:[{id,key,name,kind,rowCount}]}`; `GET /workspace/projects/:id/sheets` → the same list.
- `GET /workspace/sheets/:id/rows?query&filter&sort&hidden&cursor&limit` → `{sheet, title, counts{total}, columns, rows:[{id, …base fields, cells:{key:CellView}}], nextCursor}`:
  - `query`: case-insensitive match on name and domain (indexable expression; no full scan of cells).
  - `filter` = `key:empty|not_empty|failed|no_data`, comma = AND. `empty` = no cell or value null; `not_empty` = value not null; `failed`/`no_data` = cell status. Implemented as `LEFT JOIN cells` per filtered column.
  - `sort` = `key:asc|desc`; base field → `rows.data->>key` (`emp` cast to integer); enrichment column → joined cell value as text; default `created_at asc`; `row.id` as tie-breaker.
  - Keyset pagination: cursor = base64 JSON `[sort_value, row_id]`; `limit` default 50, max from config.
  - Cells for the page loaded in **one** query (`WHERE row_id = ANY(:ids)`), not per row.
  - `hidden` keys removed from `columns` and `cells`.
- `PATCH /workspace/sheets/:id/rows/:rowId {cells:{key:value}, expectedRevision?}` → `sheets.edit_base_field` / `sheets.edit_cell` (P1 rules); unknown or non-editable key → 422 `not_editable`.
- `PATCH /workspace/sheets/:id/columns {order, hidden}`; A9 `DELETE …/columns/:key`; A10 `POST …/columns/:key/clear` → P1 service functions (409 when a job runs on the column).
- `POST /workspace/sheets/:id/columns {name, type, prompt, enrichmentId?, applyTo}`: no `enrichmentId` + `prompt` → `custom_prompt`; neither → `plain_value` (A3). `applyTo:"none"` (default) → `201 {column, jobId:null}`; `"all"` → calls `enrichment.service.create_run` over all rows → `202 {column, runId, jobId}`.
- `POST /workspace/sheets/:id/rows/run {rowIds, columnKeys, overwriteEdited?}` → `create_run` with job type `run_cells`; `estimatedOnly:true` → 422 `not_supported`; `plain_value` → 422 `not_runnable`; `202 {runId, jobId, status}`.
- `GET /workspace/sheets/:id/exports?format=csv|xlsx&rowIds=&columnKeys=` → token (`secrets.token_urlsafe(32)`, TTL from config) → `{url:"/api/v1/downloads/<token>", expiresAt}`. `GET /downloads/:token` streams: CSV via a generator reading keyset pages; XLSX via openpyxl write-only workbook. Columns = visible columns in order; per enrichment column add `"<label> — provenance"` and `"<label> — source URL"` (first source). H2 applied to every text cell. Expired/unknown token → 404 `not_found`.
- `GET /workspace/sheets/:id/context?rowIds=` → `{overview, signals, enrichment, sources}` from stored rows, cells, `cell_sources`; zero provider calls.
- `GET /workspace/projects/:id/runs/:runId` → run view + job view.

```
TASK: P6 — Workspace and research sheets.
Read first: docs/plan.md sections 8.4, 8.5, 9.5, 10, 11 (P6); docs/api-contract.md "Workspace"; the "Exact logic" list for P6 in the prompt pack.

Implement exactly that logic. All sheet reads/writes through backend/app/modules/sheets/service.py (add read functions there). Runs always delegate to enrichment.service.create_run. No credits, no estimates. Out of scope: imports, shares, saved views, row delete, sheet create/rename/delete.
PG-7: "run empty cells" is supported only through client rowIds; report multi-column behaviour.

TESTS
read: query on name and domain; sort asc/desc on base field, emp numeric, and cell value; default order; each filter value; two filters ANDed; hidden removes column and cells; keyset pagination over 120 rows returns each row exactly once; cells loaded in one query (count SQL statements per request with an event listener); unknown sheet -> 404.
edit: allowed fields; not_editable; revision_conflict; domain edit -> stale true on that row's enrichment cells, values unchanged; plain_value edit -> userEdited true, source "user", provenance null; running cell -> 409 cell_running; column order/hidden persisted; delete/clear rules incl. 409.
run: 202 with job type run_cells; estimatedOnly true -> 422 not_supported; plain_value -> 422 not_runnable; user-edited skipped; add column applyTo none -> 201 jobId null; applyTo all -> 202; A3 defaults; duplicate label -> key suffix _2; one-column "empty cells" rerun creates items only for empty rows.
exports: CSV header = visible columns + provenance + source URL columns; hidden excluded; rowIds respected; XLSX opens with openpyxl, same header; 5,000-row export is streamed (response body is an iterator and rows are fetched in several keyset pages: assert more than one page query); H2 for = + - @ in CSV and XLSX; expired/unknown token -> 404.
context: overview/signals/enrichment/sources from stored data only (0 provider calls); runs/:runId returns run + job view.

FINISH: all tests green; update docs/backend-paths.md; PHASE REPORT (PG-7, token TTL default, H2).
```

**Exit gate:** pagination, statement-count and export streaming tests green · plan §9.5 acceptance shown.

---

## P7 — Home and research (Flow 1: prompt → project → results)

> **What:** The Home page brain: describe the companies you want, it searches the web and builds a sourced table.  
> **Why:** One sentence in, a real list with links out — and every row proves where it came from.

**Goal:** `POST /projects` runs a discovery job (Exa company search) into a `Target Companies` sheet, optionally chaining enrichments; project CRUD; `POST /projects/:id/columns`.
**Read in plan:** §9.1, §10 (rows 10–15), §11 (P7); `docs/api-contract.md` "Home" (`Project`).

| Path | Purpose | Tag |
|---|---|---|
| `backend/app/modules/projects/service.py` | CRUD, counts (PG-2) | new |
| `backend/app/modules/research/parser.py` | `requestedCount` | plan |
| `backend/app/modules/research/discover.py` | discover item executor | plan |
| `backend/app/api/projects.py` | routes | plan |
| `backend/app/schemas/projects.py` | DTOs | new |
| `backend/tests/unit/test_research_parser.py`, `backend/tests/integration/test_projects.py`, `test_discover.py` | tests | new |

**Exact logic**

1. `POST /projects {prompt, agentId, toolIds, connectorIds, enrichments}` + `Idempotency-Key`. Validate: prompt 1–2000 chars; each enrichment id enabled and `appliesTo: companies`.
2. `requestedCount` = first match of `(\d[\d,]*)\s+(companies|accounts|businesses|startups|brands)` (commas removed); default `research_default_count`; capped at 100 (`capped=true`).
3. One transaction: project (`status:"Live"`, `type:"GTM Research"`, stored `agentId/toolIds/connectorIds`, no effect), sheet `Target Companies` (`kind:"companies"`; base columns company, domain, emp, loc visible; `linkedin`, `industry` hidden and never filled — PG-3), job `type:"research"` with one `discover` item (payload `{query: prompt, requestedCount, excludeDomains: []}`), plus the requested enrichment columns (created now, filled later). `202 {project, jobId}`.
4. Discover item: Exa `/search` `category: company`, `type: auto`, `numResults: requestedCount`, `contents.highlights: true`, `excludeDomains` from payload (≤1,200). Per result: host → domain (skip if no host); entity → name, `workforce.total` → emp, `headquarters` → loc. In the completion transaction: `sheets.add_base_rows` (dedupe by domain; returns inserted ids + duplicate count), sources = result URL, provenance `provider_reported`, source `exa`; then, if enrichment columns exist, `sheets.queue_cells_for_run` for the inserted rows and add those cell items to the **same job** (progress total grows; unit `items`). Step events: `discover` (`meta "<n> companies"`), then one step per enrichment column.
5. Finalize: project `status:"Complete"`, `lastRunAt` set; `done.summary {companies, duplicatesRemoved, skippedNoHost, capped}`.
6. `GET /projects` / `GET /projects/:id`: `Project` shape without `creditsUsed`; `counts {companies, leaders, signals, enriched}` from rows and succeeded cells. `PATCH`: `name`; `status:"Paused"` pauses the active job; `status:"Live"` resumes. `DELETE`: cancel active jobs, soft delete. `POST /projects/:id/columns {enrichmentId | prompt, label?}` → add column on the companies sheet, then `create_run` over all rows → `202 {column, runId, jobId}`.

```
TASK: P7 — Home and research.
Read first: docs/plan.md sections 9.1, 10, 11 (P7); docs/api-contract.md "Home"; the "Exact logic" list for P7 in the prompt pack.
PG-2: create backend/app/modules/projects/ (the plan's section 10 names it; section 4.2 does not list it).

Implement exactly that logic. The discover executor uses the P4a Exa client and writes only through the sheets service. Runs reuse enrichment.service. No credits. Out of scope: workflows, templates, saved lists, /projects/:id/runs.

TESTS
parser: "Find 30 B2B SaaS companies in India" -> 30; "Find 1,200 startups" -> 100 capped; "find some companies" -> default; only the listed plural nouns count.
projects (fixture of 30 results: 3 share one domain, 2 lack a host): rows == 26; summary duplicatesRemoved == 2, skippedNoHost == 2; every row provider_reported, source exa, >= 1 source URL; linkedin/industry hidden and empty; Exa request has category company, type auto, numResults 30, highlights true.
- idempotent POST -> same project + job; prompt "" and 2001 chars -> 422; unknown/disabled enrichment -> 422 unknown_enrichment; find_work_email (appliesTo leaders) -> 422 validation_error.
- chained enrichment: enrichments ["find_snapshot"] -> one cell item per inserted row in the same job; progress total grows; final counts.enriched equals succeeded cells.
- PATCH Paused/Live pauses/resumes the job; DELETE cancels and hides; counts equal DB; no creditsUsed key.
- POST /projects/:id/columns -> 202 {column, runId, jobId}; same validation as /enrichments/runs.
- Exa 402 during discover -> job failed provider_out_of_credits; 503 exhausted -> job failed provider_unavailable; project not left "Live".

FINISH: all tests green; update docs/backend-paths.md; PHASE REPORT (PG-2, PG-3).
```

**Exit gate:** plan §9.1 acceptance with fixtures · no credit fields anywhere in responses.

---

## P8 — Copilot (Flow 3: conversation → streaming → results)

> **What:** A chat helper that understands simple requests, runs the right job, and answers using only real numbers from the database.  
> **Why:** Typing "find decision makers" is faster than menus — but the helper must never make up a number or a fact.

**Goal:** conversations/messages, deterministic intent router, chat jobs reusing P7/P5, template replies streamed as `token` events, results/export/feedback/regenerate, company context, Workspace conversation endpoints.
**Read in plan:** §4.3, §9.3, §10 (rows 29–40), §11 (P8); `src/pages/home/model.ts` `askPlan` (~322–391); `src/pages/workspace/model.ts` `send` (~3475).

| Path | Purpose | Tag |
|---|---|---|
| `backend/app/modules/copilot/router.py` | `IntentRouter` Protocol + rule implementation | new |
| `backend/app/modules/copilot/service.py` | conversations, messages, chat jobs | new |
| `backend/app/modules/copilot/templates.py` | reply templates | new |
| `backend/app/modules/jobs/queue.py` | add the reply guard to the claim query | existing |
| `backend/app/api/copilot.py` | Copilot, Workspace conversations, `/companies/:id` | plan |
| `backend/app/schemas/copilot.py` | DTOs | new |
| `backend/tests/unit/test_intent_router.py`, `backend/tests/integration/test_copilot_*.py` | tests | new |

**Router (plan §9.3, in order; case-insensitive, word boundaries — H3)**

| # | Words | Condition | Action |
|---|---|---|---|
| 1 | more, additional, another | has companies | `find_more`: discover with `excludeDomains` = existing domains (first 1,200) |
| 2 | cmo, cto, cro, cfo, decision maker, leader, head of, founder, director, vp, people, contact | has companies | run `find_decision_makers` on all company rows |
| 3 | email | has leaders | run `find_work_email` on all leader rows |
| 4 | fund, funded, funding, series, raise | has companies | run `find_funding` |
| 5 | news | has companies | run `find_company_news` |
| 6 | hiring, jobs, open roles | has companies | run `find_job_openings` |
| 7 | tech stack, technolog… | has companies | run `find_tech_stack` |
| 8 | add column, add a column | has companies | `custom_prompt` column with the remaining text as prompt |
| 9 | compan…, account, startup, business, brand — or no companies yet | — | `discover` into this conversation's project |
| 10 | anything else | — | `unsupported` |

Also `unsupported`: phone requests; filter/sort requests (reply points to table controls); an enrichment whose gate is off (reply names it).

**Exact logic**
1. `POST /copilot/conversations {text, agentId, toolIds, enrichmentIds, attachmentIds}` → one transaction: conversation (title = first 60 chars), bound empty project (`type:"Copilot Research"`), user message, assistant message (`status:"streaming"`, `intent` stored), job `type:"chat"` with items: the action items (a `discover` item, or cell items via `queue_cells_for_run`) **and one `reply` item**. Non-empty `attachmentIds` → 422 `not_supported`. `202 {conversationId, messageId, jobId}`. `POST …/messages` = same on an existing conversation. Idempotency-Key honoured.
2. **Reply guard** in the claim query: a `reply` item is claimable only when `NOT EXISTS (SELECT 1 FROM job_items o WHERE o.job_id = i.job_id AND o.kind <> 'reply' AND o.status IN ('pending','running'))`. Because a `discover` item adds its cell items in its own completion transaction, the reply can never start early.
3. **Reply item:** build text from `templates.py` using only counts read from the DB for this job: discover → `"Found {n} companies ({d} duplicates removed). Next: find decision makers, funding or news."`; enrichment → `"Ran {label} on {rows} rows: {ok} filled, {nodata} no data, {failed} failed."`; unsupported → list of supported requests. In its completion transaction: save message content + `status:"complete"`, append `token` events (chunks of `token_chunk_words`, config) then let finalize append `done`.
4. **Regenerate:** new chat job with only a `reply` item built from the stored job result; no provider calls; returns the job envelope.
5. **Feedback** `{rating: up|down}` stored. **Results** `?sheet=target-companies|leaders|signals` → P6 reader on the bound project (`target-companies` → kind `companies`). **Exports** → P6 exports. **`GET /companies/:id`** (companies-sheet row id) → overview, signals, people (Leaders rows), social (`find_social_profiles` cell), stack (`find_tech_stack` cell); stored data only.
6. **Workspace conversations:** `GET /workspace/conversations?projectId=` lists that project's conversations; `POST /workspace/conversations` = create bound to an existing project.

```
TASK: P8 — Copilot.
Read first: docs/plan.md sections 4.3, 9.3, 10, 11 (P8); src/pages/home/model.ts askPlan; src/pages/workspace/model.ts send; the router table and "Exact logic" for P8 in the prompt pack.

Implement exactly that. No LLM. route(text, state) is a pure function behind an IntentRouter Protocol, state = {hasCompanies, hasLeaders, columns, enabledEnrichments}. Actions reuse P7 discover and P5 create_run logic; Copilot never writes sheet tables. Add the reply guard to backend/app/modules/jobs/queue.py.

TESTS
router (pure unit): one test per row 1-10; precedence (rows 2 and 4 both match -> 2); no companies + "find decision makers" -> discover (row 9, literal plan behaviour); H3 false positives: "energy sector" not row 2, "microsoft" not row 2; "raised $20M" does not match row 4 under word boundaries -> record this in the Phase Report, do not add words; phone -> unsupported; "sort by revenue" -> unsupported with pointer; gate off -> unsupported naming it; router has no I/O.
flow: create -> 202 ids, title 60 chars, bound project type "Copilot Research"; attachments -> 422; idempotent replay.
- "Find 20 fintech companies in London" (fixture) -> reply equals the template with n and d equal to DB counts.
- follow-up decision makers with gate off -> unsupported reply; with gate on (fake executor) -> run over all company rows, reply counts equal cell statuses.
- reply item is claimed only after all other items finish (event seq order); discover adding cell items never lets the reply start early.
- SSE reconnect mid-tokens -> remaining tokens replayed in order; joined tokens == saved content.
- regenerate -> 0 provider_calls rows added; new content equals template from stored result.
- feedback stored; invalid rating -> 422; results for each sheet value; unknown sheet -> 422; exports stream with H2; /companies/:id uses stored data only; workspace conversations filtered by project.
- generic helper: every number in every reply equals a DB count.

FINISH: all tests green; update docs/backend-paths.md; PHASE REPORT.
```

**Exit gate:** router tests (10 rules + false positives) · reply-guard test · "numbers equal DB counts" helper green.

---

## P9 — Revenue Radar preview (Flow 4, fixture-backed)

> **What:** The Radar screen's sample data is copied into JSON files and served by six endpoints, clearly marked "Preview".  
> **Why:** The screen needs real endpoints now, but live signal detection isn't in scope — so we're honest that it's sample data.

**Goal:** six Radar endpoints map fixture data per plan §9.4; `preview: true` everywhere; dismiss persisted.
**Read in plan:** §9.4, §10 (rows 41–46), §11 (P9); `src/pages/radar/model.ts`; `docs/api-contract.md` "Radar".

| Path | Purpose | Tag |
|---|---|---|
| `backend/scripts/extract_radar_fixtures.mjs` | slice literals → JSON | plan |
| `backend/app/modules/radar/fixtures/{accounts,feed,drawer,answers,mix}.json` | committed fixtures | plan |
| `backend/app/modules/radar/service.py` | mapping, filters, actions | new |
| `backend/app/api/radar.py` | six routes | plan |
| `backend/app/schemas/radar.py` | DTOs | new |
| `backend/tests/unit/test_radar_mapping.py`, `test_extract_radar_fixtures.py`, `backend/tests/integration/test_radar_api.py` | tests | new |

**Mapping (plan §9.4)**
- Account `id` = `cmp_` + slug(name); `zone` omitted (client computes).
- Signal `id` = `sig_<fixture id>`; `company.id` by name match else null; `source` = text after the **last** `·` in `meta`; `detectedAt` = fixture load time − parsed `time` (`"Nh ago"`, `"N days ago"`, `"Yesterday"` = 24 h, `"Today"` = 0 h; else null); `recommendation` ← `recommend`.
- Drawer: Acme → `DRAWER` (`recs` → `recommendations`); others → `{id, name, whyNow:null, timeline:[own FEED items as {when, occurredAt, title, source, hot}], people:[], stack:[], recommendations:[]}`.
- Filters: `types` (accounts by `types[]`, signals by `type`); `range` on `detectedAt` (null kept); `weight` ignored.
- Actions upsert one row per `(workspace_id, signal_id)`; dismissed excluded from the feed.
- Questions: trimmed, case-insensitive exact match → answer (rows get `accountId` by name or null); else `{summary:"Preview: only the sample question is answered with sample data.", rows:[]}`.
- Signal mix `[{label, value}]` (drop `pct`), range ignored.
- Lists `{data, nextCursor:null, preview:true}`; objects include `preview:true` (N5).

```
TASK: P9 — Revenue Radar preview.
Read first: docs/plan.md sections 9.4, 10, 11 (P9); src/pages/radar/model.ts; docs/api-contract.md "Radar"; the P9 mapping list in the prompt pack.

1. extract_radar_fixtures.mjs (Node >= 22): find ACCOUNTS, FEED, DRAWER, ANSWERS, MIX by name, slice each literal with bracket matching, evaluate only the literal, write JSON. Exit non-zero if any is missing or fails. Idempotent. Expected: 10, 8, drawer keys whyNow/timeline/people/stack/recs, 1 answer, 8.
2. Commit the JSON; runtime never reads frontend source.
3. Implement service + routes per the mapping list; fixture load time captured once, injectable clock in tests.

TESTS
- script: counts as expected; second run no diff; renamed constant in a temp copy -> non-zero exit.
- mapping: slug ids stable; "Hiring signal · LinkedIn" -> LinkedIn; "Sarah Chen · VP Sales · LinkedIn" -> LinkedIn; "Competitor activity · Public pricing" -> Public pricing; "2h ago", "3 days ago", "Yesterday", "Today", unparsable -> null.
- drawer: Acme full; other account derived; unknown id -> 404.
- API: counts 10/8/8; types and range filters; weight ignored; preview true on every response.
- actions: dismiss hides; review keeps; second action overwrites (one row).
- questions: case/space variants of the sample -> answer; anything else -> rows [] (never invented rows).
- 0 provider_calls rows in all Radar tests.

FINISH: all tests green; update docs/backend-paths.md; PHASE REPORT (N5).
```

**Exit gate:** script idempotent · all Radar tests green · `preview` on every response.

---

## P4b — MoltSets adapter and people/email executors (blocked until Q1 and G3)

> **What:** Connect MoltSets to find decision makers and their work emails — only when MoltSets actually returns them.  
> **Why:** Emails are personal and easy to get wrong; we never guess one, and we read MoltSets' real rules and terms first.

**Goal:** typed MoltSets client, `find_decision_makers` (+ Leaders upsert), `find_work_email`, and a hard guarantee of no email without a provider response.
**Read in plan:** §5.2, §5.3 (G3), §7.2, §8.8, §11 (P4b).

| Path | Purpose | Tag |
|---|---|---|
| `backend/app/modules/providers/moltsets/{client,models,errors,rate_limit}.py` | client, models, limiter | new |
| `backend/app/modules/enrichment/executors/find_decision_makers.py`, `find_work_email.py` | executors | plan |
| `backend/app/modules/sheets/service.py` | add `upsert_leader_rows()` | existing |
| `backend/tests/fixtures/moltsets/…` | fixtures | plan |
| `backend/tests/unit/test_moltsets_client.py`, `test_moltsets_rate_limit.py`, `backend/tests/unit/executors/test_moltsets_executors.py` | tests | new |
| `docs/provider-gates.md` | G3 section | plan |

**Exact logic**
- `find_decision_makers`: `search_people` with `company_domain:[domain]`, `seniority` default `["C Suite","VP","Head","Director","Owner"]`, optional `department`/`title` from column params, `limit` default 10, capped at 25. Value = people list (fields mapped from the real response after G3). In the completion transaction: `sheets.upsert_leader_rows` (lazy Leaders sheet `kind:'leaders'`, N4 columns, `company_row_id`, dedupe D4). Company cell summary `"{first} + {n-1} more"`. Provenance `provider_reported`.
- `find_work_email` (Leaders row): `linkedinUrl` → LinkedIn-URL → business-email capability; else name + company domain → name-based capability; else `failed/missing_input`, 0 calls. Found → email, `provider_reported`. Not found → `no_data`. **No email is ever constructed.**
- Rate limiter: async token bucket; limit from config (the team's actual plan), never hard-coded.

```
TASK: P4b — MoltSets adapter and executors.
PRECONDITIONS — STOP-AND-ASK (R2) for any that is not true:
 a) Q1 confirmed: provider is MoltSets (moltsets.com).
 b) You read https://developer.moltsets.com and quoted in your first message: base URL, auth header, exact paths and parameter names and response field names for (1) people search by company domain, (2) LinkedIn URL -> business email, (3) name + domain -> business email; the API-key env var name; the plan rate limit; error codes for not-found and plan restriction.
 c) The human confirmed commercial-use and data-retention terms were reviewed (G3).
 d) N4 answered (Leaders base columns).
Plan facts you may rely on (docs/plan.md 5.2): capability names search_people, linkedin_to_business_email, search_business_email_by_name; search_people filters company_domain[], seniority[], department[], title[], limit (max 25), offset; seniority values Intern, Entry, Senior, Manager, Director, VP, Head, C Suite, Owner, Partner. Everything else comes from the docs, never from memory.

Implement per the P4b "Exact logic" list. Record real fixtures only with a key from the human; otherwise synthetic fixtures and G3 "not passed". Error mapping: not found -> no_data; plan restriction / auth -> failed with provider code, no retry; rate limit -> backoff retry. Each call -> provider_calls row (no cost).

TESTS
- client: key never logged (H4); only documented fields sent; limit > 25 capped; default seniority list exact.
- decision makers: N people -> list + summary; Leaders rows linked; rerun -> no duplicates; zero -> no_data; missing domain -> missing_input, 0 calls.
- work email: URL present -> URL capability used; else name+domain capability; neither -> missing_input, 0 calls; found -> provider_reported; not found -> no_data, value null.
- property test: 200 random (name, domain) with provider "not found" -> never a value, never an "@" anywhere in result or cell.
- plan restriction -> failed with code, 0 retries.
- limiter with fake clock: never more than L calls per window.
- gate off -> both enrichments absent from catalog and rejected by runs.

FINISH: all tests green; update docs/backend-paths.md and docs/provider-gates.md (G3 status); PHASE REPORT.
```

**Exit gate:** "no guessed email" property test · limiter test · G3 status recorded honestly.

---

## P10 — Reliability hardening (no deployment, no cost reporting)

> **What:** We stress the system: big runs, repeated crashes, and checks that secrets never leak — then tune limits from real call logs.  
> **Why:** Working once isn't enough; this proves it keeps working under load and failure before real users depend on it.

**Goal:** a 200-row × 3-column run completes unattended through crashes; logs are structured and secret-free; MoltSets batching (if P4b done).
**Read in plan:** §8.8, §11 (P10, minus deployment and cost report), §12.

| Path | Purpose | Tag |
|---|---|---|
| `backend/app/logging.py` | JSON logs with request/job/row/provider request ids | new |
| `backend/app/main.py` | request-id middleware (`X-Request-Id`) | existing |
| `backend/app/modules/providers/moltsets/client.py` | batching ≤100 URLs (only if P4b done) | new |
| `backend/tests/integration/test_scale_run.py`, `test_chaos_worker.py`, `test_log_redaction.py`, `test_moltsets_batching.py` | tests | new |

```
TASK: P10 — reliability hardening. No deployment configuration. No cost reporting.
Read first: docs/plan.md sections 8.8, 11 (P10), 12.

1. Structured JSON logging: request id on every API log line and response header X-Request-Id; worker lines carry job id, item id, row id, provider request id. Never log secrets or full provider bodies (H4).
2. Rate-limit tuning: produce a short table from provider_calls (per provider: calls, p50/p95 latency, 429 count, 5xx count) on the test data; adjust only config values; report changes.
3. MoltSets batching (only if P4b is done): up to 100 LinkedIn URLs per call; results mapped back per cell; a missing URL fails/no_data only its own cell.

TESTS
- test_scale_run.py: 200 rows x 3 columns (600 cells), fixture-backed executors with mixed outcomes -> completes with process_available(); exactly one final result per cell; events seq strictly increasing without gaps; job summary equals DB cell status counts; no cell left pending/running.
- test_chaos_worker.py: the same run with the worker killed and restarted 3 times (sweeps after lease expiry) -> same invariants; no item completed twice (fencing).
- test_log_redaction.py: full flow with fake keys in env -> key values absent from logs, error bodies, DB; X-Request-Id present and in matching log lines.
- test_moltsets_batching.py (if P4b): 250 URLs -> 3 calls (100, 100, 50); one not found -> only its cell no_data.

FINISH: all tests green; update docs/backend-paths.md; PHASE REPORT.
```

**Exit gate:** scale, chaos and redaction tests green.

---

# SECTION C — Release verification

## V1 — Release verification (no new features)

> **What:** One final checkup: every endpoint exists, every promise in the plan is tested, and nothing fake or out-of-scope slipped in.  
> **Why:** Phases can each pass while the whole still has gaps; this catches them before real users do.

**Goal:** prove the backend matches plan §10 (45 endpoints in this release), the honesty rules of §8.5 and the test strategy of §12, with credits and deployment absent.
**Paths:** `backend/tests/contract/test_endpoint_inventory.py`, `backend/tests/integration/test_honesty_rules.py`, `docs/release-report.md` (new).

```
TASK: V1 — release verification. No new features. Fix only tests/docs; a real defect -> STOP and report it with its phase.

1. Endpoint inventory (backend/tests/contract/test_endpoint_inventory.py): app.openapi() paths+methods under /api/v1 (plus /health at root) must equal exactly these 45; fail on missing or extra:
 GET /jobs/{jobId} | GET /jobs/{jobId}/events | POST /jobs/{jobId}/pause | POST /jobs/{jobId}/resume | POST /jobs/{jobId}/cancel
 GET /enrichments/catalog | POST /enrichments/runs | GET /enrichments/runs/{runId}
 GET /projects | POST /projects | GET /projects/{id} | PATCH /projects/{id} | DELETE /projects/{id} | POST /projects/{id}/columns
 GET /workspace/projects/{id} | GET /workspace/projects/{id}/sheets | GET /workspace/sheets/{id}/rows | PATCH /workspace/sheets/{id}/rows/{rowId} | POST /workspace/sheets/{id}/columns | PATCH /workspace/sheets/{id}/columns | DELETE /workspace/sheets/{id}/columns/{key} | POST /workspace/sheets/{id}/columns/{key}/clear | POST /workspace/sheets/{id}/rows/run | GET /workspace/sheets/{id}/exports | GET /downloads/{token} | GET /workspace/sheets/{id}/context | GET /workspace/projects/{id}/runs/{runId} | GET /workspace/conversations | POST /workspace/conversations
 GET /copilot/conversations | POST /copilot/conversations | GET /copilot/conversations/{id} | PATCH /copilot/conversations/{id} | POST /copilot/conversations/{id}/messages | POST /copilot/messages/{id}/feedback | POST /copilot/messages/{id}/regenerate | GET /copilot/conversations/{id}/results | POST /copilot/conversations/{id}/exports | GET /companies/{id}
 GET /radar/accounts | GET /radar/accounts/{id} | GET /radar/signals | POST /radar/signals/{id}/actions | POST /radar/questions | GET /radar/signal-mix
 Also assert GET /me is NOT present.

2. Honesty and scope tests (backend/tests/integration/test_honesty_rules.py) over an end-to-end fixture scenario (discover -> enrich -> Copilot follow-up -> export):
 - "Guessed" never appears in any response, cell, schema or catalog.
 - every provenance "verified" cell has >= 1 cell_sources row; every non-empty enrichment cell has provenance and source; every empty result is no_data with value null.
 - no email-shaped value in any cell unless present in a provider fixture response.
 - every number in every Copilot reply equals a DB count.
 - Radar: unknown question -> rows []; preview true everywhere.
 - sheets boundary test passes; catalog sources only exa/moltsets/user; excluded items absent.
 - scope: no response body contains estimatedCredits, chargedCredits, creditsUsed, a cell "cost" key, or a workspace "credits" key; credit_ledger has 0 rows after the scenario; no deployment config files were added.

3. Full suite: lint, type check, pytest (all dirs). Report counts.
4. docs/release-report.md: phases completed, test counts, unresolved questions with current defaults (Q3, Q4, Q5, Q6, Q9, N5), gates passed/not passed (G1-G4), decisions in use (D1-D7), hardening kept (H2-H4), deferred scope (credits, /me, deployment), and the frontend wiring list from docs/plan.md section 13 (not implemented).
```

**Exit gate:** 45-endpoint inventory green · honesty + scope tests green · release report written.

---

# SECTION D — Recovery

## R1 — Resume after a lost session

> **What:** The AI reads our notes and test results to find exactly where we stopped.  
> **Why:** Sessions end and context is lost; this prevents redoing or skipping work.

```
TASK: resume. Do not write code yet.
1. Read docs/plan.md headings, docs/backend-paths.md, and the scope boundary in the prompt pack.
2. Run the full test suite; print pass/fail/skip counts per directory.
3. Find the earliest phase (P2.1 ... V1) whose exit gate is not green: phase id, what is missing, failing tests.
4. List open questions (Q*/N*) blocking it.
5. Propose the single next prompt to run and wait for approval.
```

## R2 — STOP-AND-ASK format

> **What:** A short fixed form the AI uses to ask a question instead of guessing.  
> **Why:** Guessing is how wrong facts reach production; a clear question takes seconds to answer.

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

# Appendix A — Path registry for this release (merge into `docs/backend-paths.md`)

| Path | Purpose | Phase | Tag |
|---|---|---|---|
| `docs/plan.md`, `docs/backend-paths.md` | plan, registry | P0 | existing |
| `docs/api-contract.md` | contract + A1–A13 | P0, P2.3 | existing |
| `docs/provider-gates.md` | gate procedures/results, P5 smoke steps | P4a.5, P5, P4b | plan |
| `docs/release-report.md` | final report | V1 | new |
| `server/mock-api.mjs`, `server/mock-api.test.mjs` | oracle (read-only) | all | existing |
| `src/pages/radar/model.ts` | Radar fixture source (read-only) | P9 | existing |
| `backend/app/{main,config,db,ids,errors,auth}.py`, migrations `0001_initial`, `0002_seed` | core (done) | P0–P1 | existing |
| `backend/app/idempotency.py` | insert-first idempotency | P2.3 | new |
| `backend/app/logging.py` | structured logs | P10 | new |
| `backend/app/api/{jobs,enrichments,projects,workspace,copilot,radar,downloads}.py` | routes | P2.3–P9 | plan |
| `backend/app/schemas/{catalog,enrichment,workspace,projects,copilot,radar}.py` | DTOs | P3–P9 | new |
| `backend/app/modules/sheets/{models,service,normalize,query}.py` | only sheet writer + reader | P1, P5, P6, P4b | existing / new |
| `backend/app/modules/jobs/{models,service,queue,events,listener,sse}.py` | jobs engine | P2 | existing / new |
| `backend/app/modules/catalog/registry.py` | catalog | P3 | plan |
| `backend/app/modules/enrichment/{models,service,runner,cache,signals}.py`, `executors/{base,common,<id>}.py` | runs + executors | P2.1–P5 | plan / new |
| `backend/app/modules/providers/{models,service}.py` | `provider_calls` | P4a.1 | existing / new |
| `backend/app/modules/providers/exa/{client,models,errors,schema_limits}.py` | Exa adapter | P4a.1 | new |
| `backend/app/modules/providers/moltsets/{client,models,errors,rate_limit}.py` | MoltSets adapter | P4b | new |
| `backend/app/modules/projects/{models,service}.py` | projects (PG-2) | P7 | existing / new |
| `backend/app/modules/research/{parser,discover}.py` | discovery | P7 | plan |
| `backend/app/modules/copilot/{models,router,service,templates}.py` | Copilot | P8 | existing / new |
| `backend/app/modules/radar/{models,service}.py`, `fixtures/*.json` | Radar preview | P9 | existing / plan |
| `backend/app/modules/exports/{models,service}.py` | exports + tokens | P6 | existing / plan |
| `backend/app/worker/main.py` | worker loop | P2.1 | plan |
| `backend/scripts/{record_provider_fixture.py,extract_radar_fixtures.mjs}` | scripts | P4a.1, P9 | plan |
| `backend/tests/{unit,contract,integration,fixtures,support}/…` | tests | all | plan / new |
| `backend/app/modules/credits/…`, `credit_ledger` table | **deferred — keep, do not use** | — | existing |

**Rule:** rename or add a file → update the registry in the same commit. If a prompt names a path that no longer exists, trust the registry.
