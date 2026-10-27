# Outmate — Fix: Home research "wrong count" (`prompt-hc.md`)

**Save as:** `docs/prompt-hc.md` (the prompts below reference that path).
**Problem:** you type "find 20 companies in delhi…" and the Home research card says "I found **1,284** potential companies". The number is a constant in `src/pages/home/model.ts` (`askPlan`, `const companies = ctx.companies || 1284`, ~line 339). Nothing is searched; the reply also claims "found" before anything runs. The "~2,106 decision makers", "18,600 credits" and "context: 1,284 companies" values are computed from that same constant, so they are the same bug.
**Fix (plan §9.1, the Home → research flow):** the server parses the requested count, the UI shows what *will* be searched (no numbers invented), and after the run it shows the *real* count from the job's `done` event.

**Depends on (already built in your pack):** P1 sheets service, P2 jobs engine + SSE, P4a.1 Exa client. **Not needed:** P5 enrichment runs.

### Scope of this fix (extension of `docs/prompt.md`, approved by the human)

| In | Out (unchanged, do not touch) |
|---|---|
| `POST /projects` (dry run + real run) for discovery only (plan §9.1) | Enrichment chaining from Home (`enrichments` must be `[]`) |
| `discover` job item using Exa `category: company` | Project list/detail/patch/delete routes, `POST /projects/:id/columns` |
| Home composer: preview → confirm → live progress → real result | Copilot, Workspace, Radar, exports, the Home sidebar credit meter |
| Removing every number derived from the fake 1,284 | Credit ledger and any discovery price (SA-1, Q2) |

### Contract amendment A14 (written into `docs/api-contract.md` in HC-1)

`POST /projects` accepts `dryRun: boolean` (default `false`).
- `dryRun: true` → `200 {plan}`, **no database writes**, no `Idempotency-Key` needed.
- `dryRun: false` → requires `Idempotency-Key`; `202 {project, jobId, plan}`.
- `plan = {query, requestedCount, countSource: "prompt"|"default", requestedRaw: number|null, capped: boolean, maxCount, columns: [{key, label}]}`.

Why: the UI has a "nothing runs until you confirm" step. The count shown there must come from the **same server parser** that the run uses; a copy of the regex in the browser would drift.

### Decisions in this fix (veto by editing the line)

| Id | Decision | Why |
|---|---|---|
| HC-D1 | Count parsing allows up to 3 non-numeric words between the number and the noun ("20 **b2b saas** companies"), ignores the second number of a range ("100-250 …"), and never takes a number followed by employee words | the plan's literal regex turns "find 20 tech companies" into the default 25, which is the same class of wrong-count bug |
| HC-D2 | `requestedCount` 0 → `422 validation_error`; word numbers ("twenty") are not parsed → default count, and the preview says so | no silent guessing; the user sees and can correct it |
| HC-D3 | Exa `numResults` = `requestedCount` (plan §9.1). No over-fetching; a shortfall is reported honestly | follows the plan |
| HC-D4 | A failed research job sets the project status to `Draft` | the contract has no `Failed` project status |
| HC-D5 | Project `name` = first 60 characters of the prompt | plan §9.3 uses the same rule for conversation titles; §9.1 gives none |
| HC-D6 | Research jobs report `estimatedCredits: null`, `chargedCredits: 0`; the Home card shows no credit numbers | discovery price is unconfirmed (Q2) and credits are display-only (SA-2) |
| HC-D7 | The research thread is client state; a page reload clears it (the project and rows persist in the DB) | project list wiring is a separate task |

---

## HC-1 — Backend: count parser, `POST /projects` (dry run + run), discover job

> **What:** The server reads "20" from your sentence, searches Exa for up to 20 companies, and saves them in a new project.  
> **Why:** The number must come from your request and from real search results — never from a constant in the code.

**Goal:** a discovery run that searches for exactly the requested count and reports `{requested, companies, duplicatesRemoved, skippedNoHost, capped}` from real data.
**Read in plan:** §9.1, §5.1, §8.2, §8.4. **Read in pack:** `docs/prompt.md` SA-1–SA-6, `docs/prompt-hc.md` (this file).

| Path | Purpose | Tag |
|---|---|---|
| `docs/api-contract.md` | add A14 under "Amendments for backend v1" | existing |
| `backend/app/modules/research/parser.py` | `parse_research_request()` | plan |
| `backend/app/modules/research/discover.py` | discover item execute + complete | plan |
| `backend/app/modules/projects/service.py` | create project + sheet + job | new (plan PG-2) |
| `backend/app/api/projects.py` | `POST /projects` only | plan |
| `backend/app/schemas/projects.py` | request/response DTOs | new |
| `backend/app/modules/jobs/queue.py` | dispatch completion by item `kind` (`discover`) | existing |
| `backend/app/config.py` | `research_default_count` (exists, 25), add `research_max_count = 100` if missing | existing |
| `backend/tests/unit/test_research_parser.py` | parser table tests | new |
| `backend/tests/integration/test_projects_research.py`, `test_discover.py` | API + job tests | new |
| `backend/tests/fixtures/exa/discover/*.synthetic.json` | company-search fixtures | plan |

**Exact logic**

1. **Parser** `parse_research_request(prompt) -> ResearchPlan`:
   - `query` = the prompt, trimmed (sent to Exa verbatim, plan §9.1).
   - Scan left to right for the first number `(\d[\d,]*)` (commas removed) that is followed, within at most 3 intervening words, by one of `companies|company|accounts|businesses|startups|brands`, where the intervening words contain no digits and none of `employee|employees|people|staff|members|headcount`. Skip a number whose previous token is `-`, `–`, `to`, or which is directly attached by a dash to another number (range end).
   - Found → `requestedRaw = n`, `countSource = "prompt"`. `n == 0` → `ApiError(422, "validation_error", details {reason:"count_must_be_positive"})`.
   - Not found → `requestedRaw = None`, `countSource = "default"`, `n = settings.research_default_count`.
   - `capped = n > settings.research_max_count`; `requestedCount = min(n, research_max_count)`; `maxCount = research_max_count`.
   - `columns = [{key:"company",label:"Company Name"},{key:"domain",label:"Domain"},{key:"emp",label:"Employee Count"},{key:"loc",label:"Location"}]` (labels from `ALL_COLS` in `src/pages/workspace/model.ts`).
2. **`POST /projects`** body `{prompt, agentId?, toolIds?, connectorIds?, enrichments?, dryRun?}`:
   - prompt trimmed length 1–2000 else 422 `validation_error`; `enrichments` non-empty → 422 `not_supported` (`details {reason:"home_enrichment_not_wired"}`).
   - `dryRun: true` → `200 {plan}`. Assert zero writes.
   - else `Idempotency-Key` required (missing → 422 `validation_error`), idempotency insert-first in the same transaction (P2), then `projects.service.create_research_project`: project (`status:"Live"`, `type:"GTM Research"`, `name` = prompt[:60] (HC-D5), store `agentId/toolIds/connectorIds`, no effect); sheet `Target Companies` (`kind:"companies"`) via the sheets service with base columns `company, domain, emp, loc` visible and `linkedin, industry` hidden and never filled (PG-3); job `type:"research"`, `progress {done:0, total:requestedCount, unit:"companies"}`, `estimatedCredits:null` (HC-D6), one item `kind:"discover"` with payload `{query, requestedCount, capped, sheetId, projectId}`; job `result = {projectId, sheetId}`. Response `202 {project, jobId, plan}`.
3. **Discover execute** (outside any transaction): Exa `/search` with `category:"company"`, `type:"auto"`, `numResults: requestedCount`, `contents: {highlights: true}`. Typed Exa errors propagate (P4a.1).
4. **Discover complete** (inside the P2 completion transaction: job row locked, fenced item update):
   - `results = response.results[:requestedCount]` (defensive slice); `returnedByProvider = len(response.results)`.
   - Per result: `domain = normalized_domain(url)`; none → `skippedNoHost += 1`, skip. Company entity (first `entities[]` item of type company): `company = entity.name or result.title`; `emp = entity.workforce.total`; `loc` = `", "`-join of non-null `headquarters.city`, `headquarters.country`.
   - `sheets.add_base_rows(sheet, rows)` → `{inserted, duplicates}` (dedupe by normalized domain, P1). Attach the result URL as a source on each inserted row's `company` column via the sheets service; provenance `provider_reported`, source `exa`.
   - `summary = {requested: requestedCount, returnedByProvider, companies: inserted, duplicatesRemoved: duplicates, skippedNoHost, capped}`; `progress = {done: inserted, total: inserted, unit:"companies"}`; step `{key:"discover", label:"Discovering companies", status:"done", meta:"<inserted> companies"}`.
   - Item outcome: `inserted > 0` → succeeded; `0` → no_data (job still `succeeded` by the P2 finalize rule).
   - Project → `Complete`, `lastRunAt = now()`. Append `progress`, `step`, then finalize appends `done {status, summary, result}`.
5. **Failures:** `ExaOutOfCredits` → job `failed`, `error.code = provider_out_of_credits`; `ExaAuth` → `provider_auth`; retries exhausted → `provider_unavailable`. Project → `Draft` (HC-D4). No rows written.

```
TASK: HC-1 — Home research count fix, backend. Scope extension approved by the human (docs/prompt-hc.md). NO credit ledger (SA-1); research jobs: estimatedCredits null, chargedCredits 0 (HC-D6).
Read first: docs/prompt-hc.md (whole file); docs/plan.md sections 5.1, 8.2, 8.4, 9.1; docs/prompt.md SA-1 to SA-6; src/pages/workspace/model.ts ALL_COLS (column labels).
Check docs/backend-paths.md for the real names of: sheets service functions (add_base_rows, add sources), the jobs completion/dispatch function, the idempotency helper, the Exa client. Use the real names; if something needed does not exist, STOP-AND-ASK (R2).

1. Add amendment A14 to docs/api-contract.md exactly as written in docs/prompt-hc.md.
2. Implement steps 1-5 of "Exact logic" in docs/prompt-hc.md HC-1, in the files of the HC-1 table.
3. The worker dispatches by job_items.kind: "cell" -> existing enrichment path; "discover" -> research.discover. The discover completion runs inside the same P2 completion transaction (job row lock, fenced update on attempts, events, pg_notify). Do not create a second completion path.
4. Only the sheets service writes sheets/columns/rows/cells/cell_sources.
5. Record HC-D1..HC-D7 usage in the Phase Report; register new paths in docs/backend-paths.md.

TESTS (write first; real PostgreSQL; Exa via httpx.MockTransport + synthetic fixtures; no network)
test_research_parser.py (parametrized, expected requestedCount / countSource / capped):
- "find 20 companies in delhi, india. startup with technology category." -> 20 / prompt / False   (the screenshot prompt)
- "Find 30 B2B SaaS companies in India" -> 30 / prompt
- "find 20 tech companies in Pune" -> 20 / prompt   (HC-D1)
- "find 15 b2b saas fintech startups" -> 15 / prompt
- "Find 1,200 startups" -> 100 / prompt / True, requestedRaw 1200
- "companies with 100-250 employees in Delhi" -> default / default
- "companies with 100 to 250 employees" -> default / default
- "find 50 employee companies" -> default (employee word in between)
- "find twenty companies" -> default / default
- "find some companies" -> default / default
- "find 0 companies" -> 422 validation_error reason count_must_be_positive
- query is the trimmed prompt unchanged; columns list exactly the four entries with the ALL_COLS labels
test_projects_research.py:
- dryRun true for the screenshot prompt -> 200, plan.requestedCount 20, countSource "prompt"; row counts of projects, sheets, rows, jobs, job_items unchanged (assert before/after).
- real run -> 202 {project, jobId, plan}; project Live, name = prompt[:60], sheet "Target Companies" kind companies with company/domain/emp/loc visible and linkedin/industry hidden; one job type research with progress {done:0,total:20,unit:"companies"} and one discover item; job estimatedCredits null.
- missing Idempotency-Key -> 422; same key twice -> same project and job, one of each in DB; concurrent duplicate -> one project.
- prompt "" and 2001 chars -> 422; enrichments ["find_snapshot"] -> 422 not_supported.
- credit_ledger row count 0 and workspaces.credits_balance unchanged after every test (SA-1).
test_discover.py:
- Exa request body: category "company", type "auto", numResults 20, contents.highlights true, no deprecated fields.
- fixture of 20 results with 2 duplicate domains and 1 result without a usable URL -> rows inserted 17; done.summary {requested:20, returnedByProvider:20, companies:17, duplicatesRemoved:2, skippedNoHost:1, capped:false}; progress {done:17,total:17}; project Complete; every row has source exa, provenance provider_reported and a source URL; emp and loc mapped exactly from the entity; linkedin and industry empty.
- fixture returning 25 results for numResults 20 -> at most 20 rows (defensive slice).
- the number of inserted rows never exceeds requestedCount (property test over random fixtures).
- zero usable results -> item no_data, job succeeded, summary.companies 0, project Complete.
- 402 -> job failed provider_out_of_credits, project Draft, 0 rows; 401 -> provider_auth; 503 exhausted -> provider_unavailable.
- SSE for the job: progress snapshot, step, done; done.summary equals DB counts.

DO NOT: add other project routes, enrichment chaining, credits, or any frontend change.
FINISH: all earlier tests green; update docs/backend-paths.md; PHASE REPORT.
```

**Exit gate:** parser table green (including the screenshot prompt → 20) · dry run makes zero writes · 17-of-20 fixture produces the exact summary · `credit_ledger` still 0.

---

## HC-2 — Frontend: preview → confirm → live progress → real count

> **What:** The Home card shows "I'll search for up to 20 companies", runs only when you click, then shows the real number found.  
> **Why:** People decide what to do next based on that number, so it must match their request and the real results.

**Goal:** `askPlan` and every number derived from `1284` are gone; the Home research card is driven by `POST /projects` (dry run, then run) and the job's SSE events.
**Depends on:** HC-1. **Read:** `src/pages/home/model.ts` (`ask` ~311, `askPlan` ~322–391, thread mapping ~672–695), `src/pages/home/components/views/HomeView.tsx` (Research session ~86–160), `src/lib/model.ts` (`ModelBase.dispose`, `setTimeout`), `scripts/grid.test.mjs` (test style), `docs/api-contract.md` A14.

| Path | Purpose | Tag |
|---|---|---|
| `src/lib/api.ts` | `API_BASE`, `apiPost()`, `ApiError`, `jobEventsUrl()` | new |
| `src/pages/home/researchSession.ts` | pure, dependency-free message/state helpers | new |
| `src/pages/home/model.ts` | remove `askPlan` and fake `ctx`; wire preview/run/SSE | existing |
| `src/pages/home/components/views/HomeView.tsx` | start button state + status line only | existing |
| `scripts/research-session.test.mjs` | `node --test` tests for the pure helpers | new |
| `package.json` | add `test:home` and include it in `test` | existing |
| `.env.example` | `VITE_API_BASE_URL=` (empty, with comment) | new |

**Exact logic**

1. **`src/lib/api.ts`**: `API_BASE = import.meta.env.VITE_API_BASE_URL` + `/api/v1`. If the env var is empty, every call rejects with `ApiError(code:"backend_not_configured")` — never fall back to demo data. `apiPost(path, body, {idempotencyKey?})` sends JSON, sets `Idempotency-Key` when given, parses the `{error:{code,message,details}}` envelope into `ApiError{status, code, message, details}`; network failure → `ApiError(code:"network_error")`. `jobEventsUrl(jobId)` → `${API_BASE}/jobs/${jobId}/events`.
2. **`researchSession.ts`** (no imports, erasable TypeScript only — it is loaded by `node --test` like `gridUtils.ts`):
   - `previewText(plan)`:
     - `countSource "prompt"` and not capped → `I'll search the web for up to ${n} companies matching your request. Nothing runs until you confirm.`
     - `countSource "default"` → `You didn't give a number, so I'll search for up to ${n} companies. Nothing runs until you confirm.`
     - `capped` → `You asked for ${raw}; one search returns at most ${max}, so I'll search for up to ${max} companies. Nothing runs until you confirm.`
   - `runningText(plan)` → `Searching for up to ${n} companies…`
   - `doneText(summary)`:
     - `companies === 0` → `No companies matched this search. Try describing the companies more broadly.`
     - `companies === requested` → `Found ${companies} companies.`
     - otherwise → `Found ${companies} of ${requested} requested companies.`
     - then append, when `d > 0`, `1 duplicate removed.` / `${d} duplicates removed.`, and when `k > 0`, `1 result had no website and was skipped.` / `${k} results had no website and were skipped.`
   - `failedText(code)`: `provider_out_of_credits` → `The search provider's quota is used up. Nothing was saved.`; `provider_auth` → `The search provider rejected our credentials. Nothing was saved.`; `provider_unavailable` / `network_error` → `The search service is unavailable right now. Try again in a few minutes.`; `backend_not_configured` → `The backend URL is not configured (VITE_API_BASE_URL).`; `validation_error` → the server message; other → `The search failed (${code}).`
   - `statsFor(item)`: preview → `[{label:"Companies requested", value:n}]`; done → `[{label:"Companies found", value:companies}, {label:"Requested", value:requested}]`; otherwise `[]`. No decision-maker or credit tiles.
   - `threadMeta(items)`: `${turns} request(s)`; plus ` · ${companies} companies` from the **latest done** item only.
   - Number formatting via `toLocaleString()` (same as `NUM` in `model.ts`).
3. **`model.ts`**:
   - Delete `askPlan` and every use of `ctx.companies` / `1284` / fake `credits` on thread items. Do not touch the sidebar credit meter or other Home sections.
   - `ask(text)`: push the user message; push an AI item `{status:"previewing"}`; `apiPost('/projects', {prompt:text, dryRun:true})` → item `{status:"preview", plan, prompt:text, idemKey: crypto.randomUUID()}`; on error → `{status:"failed", error}`. Remove the 720 ms fake "thinking" timer; `thinking` = true only while the dry-run request is in flight.
   - `start(item)` (only when `status === "preview"`): set `status:"starting"`; `apiPost('/projects', {prompt:item.prompt}, {idempotencyKey:item.idemKey})` → store `projectId, jobId`, `status:"running"`; open `new EventSource(jobEventsUrl(jobId))`; on `progress` store progress; on `done` store `summary` and `status:"done"` if `done.status === "succeeded"`, else `status:"failed"` with `error.code` from the job (`GET /jobs/:id` once if the done payload lacks it); close the source. On `error` events keep the source open (the browser reconnects and sends `Last-Event-ID` itself); if the source reaches `CLOSED` before `done`, fetch `GET /jobs/:id` once and render from it.
   - Retrying a failed **start** reuses the same `idemKey` (a double click or retry never creates a second project).
   - Keep open `EventSource`s in a `Set`; `clearThread` closes them all; override `dispose()` to close them, then call `super.dispose()`.
   - Thread mapping: `text` from the helpers by status; `stats` from `statsFor`; `filters` → a single chip `Search: “<query>”` (the exact text sent); `cols` → `plan.columns[].label`; `actions` → `[]` (follow-ups come with Copilot wiring); `costNote` → `Nothing runs until you confirm.` in preview, empty otherwise; `startLabel` / `startDisabled`: preview `Start research →` enabled; starting `Starting…`, running `Running…` disabled; done/failed hidden. `threadMeta` from the helper.
4. **`HomeView.tsx`**: render `startLabel`, disable the button when `startDisabled`, hide it when the model says so, and show one status line (e.g. the running text). No layout redesign.

```
TASK: HC-2 — Home research count fix, frontend.
Read first: docs/prompt-hc.md (whole file); docs/api-contract.md A14; src/pages/home/model.ts (ask, askPlan, thread mapping); src/pages/home/components/views/HomeView.tsx (Research session block); src/lib/model.ts (ModelBase.dispose); scripts/grid.test.mjs.

Implement steps 1-4 of "Exact logic" in docs/prompt-hc.md HC-2, in the files of the HC-2 table. Rules:
- No constant, estimate or derived number may appear in the research card unless it comes from the dry-run plan or the job's events. Search the Home model for 1284, 0.803, 1.64, 0.86, 0.143 and "cost(" uses inside the research thread and remove them.
- researchSession.ts must stay pure (no imports, erasable TypeScript) so node --test can load it like gridUtils.ts.
- If VITE_API_BASE_URL is missing, show failedText("backend_not_configured"); never show demo numbers.
- Do not change the sidebar credit meter, Projects, Templates, Workflows or other Home sections.
- npm run typecheck and npm run build must pass.

TESTS (scripts/research-session.test.mjs, run by "npm run test:home"; add it to "npm test")
- previewText for {requestedCount:20,countSource:"prompt",capped:false} -> "I'll search the web for up to 20 companies matching your request. Nothing runs until you confirm."
- previewText default and capped variants exactly as specified (capped uses raw 1,200 and max 100).
- doneText: {requested:20,companies:20,duplicatesRemoved:0,skippedNoHost:0} -> "Found 20 companies."
- doneText: {requested:20,companies:17,duplicatesRemoved:2,skippedNoHost:1} -> "Found 17 of 20 requested companies. 2 duplicates removed. 1 result had no website and was skipped."
- doneText plurals: 1 duplicate -> "1 duplicate removed."; 3 skipped -> "3 results had no website and were skipped."; companies 0 -> the no-match text.
- failedText for each listed code and an unknown code.
- statsFor never returns a label containing "Decision" or "credit"; preview -> one tile with value 20; done -> found + requested tiles.
- threadMeta: before any done -> "1 request"; after done with 17 -> "1 request · 17 companies"; uses only the latest done item.
- A grep test: src/pages/home/model.ts contains no "1284" and no "askPlan".

MANUAL CHECK (document results in the Phase Report)
- With the backend running and VITE_API_BASE_URL set: type the screenshot prompt -> preview says "up to 20 companies", no decision-maker/credit tiles, columns Company Name / Domain / Employee Count / Location -> Start -> "Running…" -> done shows "Found N companies." or "Found N of 20 requested companies." where N equals the rows in the DB for that sheet.
- Double-click Start -> one project in the DB.
- Clear session while running -> EventSource closed (Network tab), no errors.
- Unset VITE_API_BASE_URL -> the backend-not-configured message, no numbers.

FINISH: npm run typecheck, npm run build, npm test all green; update docs/backend-paths.md (frontend paths section); PHASE REPORT.
```

**Exit gate:** helper tests green · no `1284`/`askPlan` in the Home model · manual check shows a count equal to DB rows.

---

## HC-3 — End-to-end verification (no new features)

> **What:** We run the exact sentence from the screenshot through the whole system and check every number on screen against the database.  
> **Why:** Each half can pass its own tests and still disagree with the other; this proves they match.

**Goal:** prove the count shown equals the requested count before the run and the database count after it.

```
TASK: HC-3 — end-to-end verification of the Home research count fix. No new features; fix only tests/docs. A real defect -> STOP and report with HC-1 or HC-2.

1. Backend integration test backend/tests/integration/test_home_research_e2e.py (fixture-backed Exa, real Postgres): dry run of the screenshot prompt -> plan.requestedCount 20; real run with the same prompt -> job done; done.summary.companies == number of rows in the project's sheet; summary.companies <= 20; projects/sheets/jobs count +1 each; credit_ledger 0.
2. Parity test: for every prompt in the HC-1 parser table, the dry-run plan equals the plan returned by the real run (same requestedCount, countSource, capped).
3. Frontend: npm test, npm run typecheck, npm run build.
4. Manual: repeat the HC-2 manual check once with a live Exa key only if the human says "go" (3-row limit does not apply here; use a prompt asking for 5 companies). Record the prompt, requested count, DB row count, and the text shown.
5. Report: a table "prompt | requested | shown before run | DB rows | shown after run" for the screenshot prompt and 3 parser-table prompts (fixture runs).

FINISH: all green; PHASE REPORT.
```

**Exit gate:** "shown after run" equals "DB rows" in every row of the report table.