# Outmate — Enrichment Backend Plan (`plan.md`)

**Audience:** coding agents and the backend team building `backend/` for the Outmate frontend (`outmate-home`).
**Scope:** data enrichment and the five surfaces that consume it — Data enrichment, Home & research, Revenue Radar, Copilot, Workspace & research sheets.
**Providers allowed:** Exa (web research) and MoltSets (contact/people enrichment). Nothing else.
**Status of this document:** derived from the uploaded ZIP (`outmate-home-main`, commit `fa2967a`), the project context document, the earlier backend recommendation (screenshots), and current Exa / MoltSets documentation (checked 27 Oct 2026). Every claim below is either (a) traceable to a file in the ZIP, (b) traceable to provider documentation, or (c) marked **DECISION** (a choice this plan makes, with the reason) or **CONFIRM** (a choice a human must approve before the packet that depends on it starts).

---

## 0. Rules for the coding agent (read first)

1. **Do not invent.** Do not invent provider endpoints, request fields, response fields, prices, rate limits, scores, or data. If a packet needs a fact that is not in this plan, the ZIP, or the linked provider docs, **STOP and ask**.
2. **Provider docs are the source of truth for provider shapes.** Exa: `https://exa.ai/docs/exa-spec.yaml` (OpenAPI). MoltSets: `https://developer.moltsets.com` (REST) — the capability list in §5.2 comes from MoltSets' published tool surface; the REST paths and response field names must be read from their docs before P4b starts.
3. **The API contract is `docs/api-contract.md`.** Keep its shapes. Every deviation in this plan is listed in §3 as a contract amendment; implement amendments exactly as written, nothing more.
4. **Keep the mock server as the test oracle.** `server/mock-api.mjs` + `server/mock-api.test.mjs` define the enrichment lifecycle. Port those tests to the Python backend (§12) before writing provider code.
5. **Never write a value without provenance.** Every non-empty cell has a provenance class and a source (§8.5). An empty result is `no_data`, never a guess.
6. **No pattern-guessed emails, ever.** A provider-returned email is `provider_reported`; an email read on a cited page is `verified`; otherwise the cell is empty (`no_data`). The contract's `"Guessed"` status is demo data and must not be produced.
7. **Only the `sheets` module writes sheet tables** (`sheets`, `columns`, `rows`, `cells`). UI buttons, enrichment workers and Copilot all go through the same write path (§8.4).
8. **Out-of-scope features stay out** (§1.2), even if the UI shows a button for them.
9. **Never commit API keys.** Keys come from environment variables only.
10. **Missing reference docs:** the earlier recommendation cites `outmate_spec_v1.3.md`, `outmate_tech_v1.4.md` and `plan (6).md`. They are **not in the ZIP**. If they exist in the workspace, read them; if they conflict with this plan, STOP and ask. Do not assume their contents.

---

## 1. Scope

### 1.1 In scope

| Area | What is built | Treatment |
|---|---|---|
| Data enrichment | Canonical catalog, enrichment runs, per-cell processing via Exa/MoltSets, credits, jobs + SSE | **Real** |
| Home & research | Projects CRUD, research job (company discovery via Exa), project columns → enrichment | **Real** |
| Workspace & research sheets | Sheets, rows, columns, inline edits, run cells, clear/remove enrichment columns, CSV/XLSX export, context panel | **Real** |
| Copilot | Conversations, messages, deterministic intent routing → research/enrichment actions, streamed assistant messages, results, export, feedback | **Real** (no separate LLM — §4.3) |
| Revenue Radar | Six endpoints serving the frontend's sample data, labelled "Preview — sample data" | **Fixture** |

### 1.2 Out of scope (do not build in this plan)

Auth/login (single seeded user and workspace — DECISION, consistent with "skip login for now"), notifications, integrations/OAuth/CRM sync (incl. "Add Lead to HubSpot"), credit purchases/checkout, global search, `/pages/:slug`, saved lists, workflows/templates execution, CSV/Excel/CRM/URL imports, sharing links, saved views, sheet create/rename/delete, row delete, live Radar signal detection, website-visitor intent (needs a tracking pixel), phone enrichment, email validation, any provider other than Exa and MoltSets.

### 1.3 Endpoint count in scope

43 contract endpoints (1 `/me`, 5 jobs, 3 enrichment, 6 home/projects, 12 workspace incl. 2 workspace-conversation endpoints, 10 copilot incl. company context, 6 radar) plus 3 amendment endpoints. Full list in §10.

---

## 2. What the ZIP actually contains (ground truth)

### 2.1 Facts

- **Frontend only.** React 19 + Vite + React Router 7 (`package.json`). Four routes: `/`, `/radar`, `/copilot`, `/workspace` (`src/router.tsx`).
- **No API layer.** There is no `fetch`, axios, `EventSource` or `/api` call anywhere in `src/` (verified with grep; also stated in `docs/api-contract.md`). Every screen renders constants from `src/pages/*/model.ts`.
- **Proposed contract:** `docs/api-contract.md` — REST + JSON, `/api/v1`, cursor pagination, SSE, `Idempotency-Key`, integer credits, error envelope `{error:{code,message,details}}`.
- **Reference server:** `server/mock-api.mjs` implements only the enrichment slice (catalog, runs, jobs, SSE, cancel, idempotency, `/me`) in memory with simulated providers. `server/mock-api.test.mjs` has 7 lifecycle tests.

### 2.2 Evidence index (where each behaviour comes from)

| Behaviour | File : lines |
|---|---|
| Home enrichment list (12 items, costs, source badges) | `src/pages/home/model.ts:42-55` (`ENRICH`) |
| Home workflows (15 items, per-row cost) | `src/pages/home/model.ts:56-72` (`WORKFLOWS`) |
| Home composer intent parsing (regex) | `src/pages/home/model.ts:311-391` (`ask`, `askPlan`) |
| Home hard-coded "400 rows" targets | `src/pages/home/model.ts:504, 516, 591, 618` |
| Home fake result counts (e.g. 1,284 companies) | `src/pages/home/model.ts:339` and following |
| Workspace base columns | `src/pages/workspace/model.ts:405-430` (`ALL_COLS`, `DEFAULT_HIDDEN`) |
| Workspace column types (23 items) | `src/pages/workspace/model.ts:457-665` (`COL_TYPES`) |
| Workspace run engine (simulated) | `src/pages/workspace/model.ts:765` `runCell`, `:812` `startJob`, `:914` `cancelJob` |
| Run modes: all / selected / empty / retry failed / clear | `src/pages/workspace/model.ts:2246-2280` |
| AI prompt column (type `'Company Description'`, cost 3) | `src/pages/workspace/model.ts:2375-2392` |
| Retry failed cells | `src/pages/workspace/model.ts:2635` |
| Workspace chat routing (regex) | `src/pages/workspace/model.ts:3475` (`send`) |
| Editable base columns | `src/pages/workspace/components/table/gridUtils.ts:4` (`domain, emp, loc, gap, last`) |
| Cell keying in UI | `col.id + '\|' + row.name` (workspace model) — keyed by company **name** |
| Copilot enrich menu (4 bundles) | `src/pages/copilot/model.ts:623-628` |
| Copilot usage/pricing labels | `src/pages/copilot/model.ts:540-560` |
| Copilot send (no-op) | `src/pages/copilot/model.ts:1482` |
| Radar data | `src/pages/radar/model.ts:3` `ACCOUNTS`(10), `:115` `FEED`(8), `:286` `DRAWER`(1), `:380` `ANSWERS`(1), `:417` `MIX`(8), `:486` `zoneOf` |
| Mock catalog (12, with ids/costs/outputType/source) | `server/mock-api.mjs` `CATALOG` |
| Mock settle/cancel/partial-failure rules | `server/mock-api.mjs` `settle`, `finish`, `cancelJob`, `shouldFail` |

---

## 3. Conflicts found and how this plan resolves them

| # | Conflict | Resolution |
|---|---|---|
| C1 | **Three enrichment catalogs disagree.** Home `ENRICH` (12), Workspace `COL_TYPES` (23), Copilot (4 bundles: Company enrichment 5/company, Find work emails 3/contact, Social signals 4/company, Decision-maker mapping 24/account), mock `CATALOG` (12). | **DECISION:** one canonical catalog served by `GET /enrichments/catalog` (§6). Mock ids are kept for the 12 shared items; extra Workspace items get new ids. All three UIs must read the endpoint. Copilot's 4 bundle prices are **retired** (CONFIRM). |
| C2 | Cost mismatch: "Company snapshot" is 5 on Home, 3 in Workspace and mock. | **DECISION:** 3 (matches mock + Workspace). CONFIRM pricing for all rows of §6 before launch. |
| C3 | Source badges `cb`, `bw`, `zi`, `gh`, `li` and mock sources `crunchbase`, `builtwith`, `linkedin` imply providers we do not use. | **DECISION:** `source` is the real provider (`exa`, `moltsets`, `user`); cited URLs go in `sources[]`. Frontend must drop the fake badges. |
| C4 | Contract email status `'Verified' \| 'Guessed'` vs product rule "no guessed emails". | **DECISION:** replace with provenance (§8.5). `Guessed` is never produced. |
| C5 | Contract SSE events: `progress, step, token, done, error`. Mock also emits `cell`. | **Contract amendment A1:** add `cell` event (needed for per-cell UI updates). |
| C6 | Contract has `pause`/`resume` endpoints but no `paused` job status. | **Amendment A2:** add `paused` to job status. |
| C7 | Cancel: mock marks *running* cells cancelled and uncharged; contract says "cancellation charges completed work only". | **DECISION:** follow the contract. In-flight cells finish, are stored and charged if they succeed; pending cells become `cancelled`, uncharged. |
| C8 | `POST /workspace/sheets/:id/columns` body has no `enrichmentId`, but the Add-column UI picks a catalog item. | **Amendment A3:** add optional `enrichmentId`. Absent + `prompt` → `custom_prompt`; absent + no prompt → `plain_value`. |
| C9 | Mock treats "no result" as `failed`; UI shows "No data found" as a normal outcome. | **Amendment A4:** cell status `no_data` (cost 0, not retried by "Retry failed"). |
| C10 | `Company.intentScore` and `icpFit` are required numbers, but no computation exists anywhere (code, contract, context doc). | **Amendment A5:** both nullable; backend returns `null`. No scoring in this plan. Same for `qualification`, `gtmGap`, `buyingStage`, `hiringVelocity` unless filled by an enrichment column. |
| C11 | UI keys cells by company **name**; backend uses `rowId`. | Frontend adapter must key by `rowId` (§13). |
| C12 | Home "Build an enrichment" and workflow "Run" target hard-coded "400 rows" with no sheet. | **CONFIRM:** Home enrichment requires choosing a project (`POST /projects/:id/columns`). Until the UI has a project picker, the Home drawer stays disabled. Workflow "Run" is out of scope. |
| C13 | `addPromptCol` creates type `'Company Description'`, which is not a `COL_TYPES` entry. | Maps to `custom_prompt` (cost 3). |
| C14 | Radar `DRAWER` is one object (Acme) reused for every account; `ANSWERS` has one question. | Serve the Acme drawer only for Acme; other accounts get a drawer built from their own fixture rows (§9.4). Unknown questions get an explicit "preview" answer, not a fabricated one. |
| C15 | Contract confidence is a float (e.g. `0.91`); Exa grounding returns `low/medium/high`; MoltSets returns found / not found. | **Amendment A6:** add `confidenceLabel`; `confidence` stays `null` unless a provider returns a number. No invented numeric mapping. |
| C16 | Mock test asserts catalog length 12. | Update the ported test to the canonical count. |
| C17 | Provider naming: earlier plan says "Moldset"; the only matching provider found is **MoltSets** (`moltsets.com`, API host `api.moltsets.com`, docs `developer.moltsets.com`), which is also the MCP connected in the team's Claude account. | **CONFIRM** this is the intended provider before P4b. Code uses `moltsets` as the adapter name. |
| C18 | Contract rows use the fixed `Company` interface; enrichment columns are dynamic. | **Amendment A7:** each row carries `cells: { [columnKey]: CellView }` alongside its base fields. |
| C19 | Contract cell `source` is a single string. | **Amendment A8:** add `provenance`, `sources: [{url,title}]`, `userEdited`, `stale`. |
| C20 | UI has "Remove column" and "Clear results" on enrichment columns; the contract has no endpoints for them. | **Amendment A9:** `DELETE /workspace/sheets/:id/columns/:key`. **Amendment A10:** `POST /workspace/sheets/:id/columns/:key/clear`. |
| C21 | Contract export returns a "signed download URL" but names no storage. | **Amendment A11:** `GET /downloads/:token` (short-lived token, no object storage in this plan). |

**Amendment A12 (additive fields only):** catalog item `appliesTo`, `status`, `requiresInputs`; run body `refresh`, `overwriteEdited`; row edit `expectedRevision`; run-cells `estimatedOnly` response `{estimatedCredits, eligibleCells, skipped}`; Radar responses `preview: true`; job `result` objects per job type (§9).

All amendments (A1–A12) must be written back into `docs/api-contract.md` in packet P0.

---

## 4. Architecture

### 4.1 Stack (from the earlier recommendation; unchanged)

- **FastAPI + Pydantic v2** — routes and DTOs; camelCase JSON via alias generator.
- **PostgreSQL on Render** — single source of truth (projects, sheets, cells, jobs, events, credits).
- **SQLAlchemy 2 + Alembic** — models and migrations.
- **One background worker** (separate Render service) — claims work with `SELECT … FOR UPDATE SKIP LOCKED`.
- **Postgres `LISTEN/NOTIFY`** — worker → API process notifications for SSE.
- **SSE** with persisted events and `Last-Event-ID` replay.
- **httpx** — provider HTTP clients.
- **No Celery, Redis, Temporal or LangGraph** (per recommendation).
- Pin dependency versions at implementation time; choose releases at least two weeks old.

### 4.2 Repository layout

```
backend/
  pyproject.toml
  alembic.ini
  alembic/versions/
  app/
    main.py                 # FastAPI app, router mounting, error handlers
    config.py               # pydantic-settings; all limits/costs/thresholds here
    db.py                   # engine, session, LISTEN/NOTIFY helpers
    ids.py                  # prefixed opaque ids: prj_, sh_, col_, row_, enr_, job_, conv_, msg_
    errors.py               # ApiError -> {"error":{code,message,details}}
    auth.py                 # stub dependency returning the seeded user/workspace
    api/                    # thin route handlers only
      me.py jobs.py enrichments.py projects.py workspace.py copilot.py radar.py downloads.py
    schemas/                # request/response DTOs mirroring docs/api-contract.md (+ amendments)
    modules/
      sheets/               # ONLY writer of sheets/columns/rows/cells (+ evidence)
      jobs/                 # job + item state machine, queue, events, SSE
      credits/              # reservation, charge, release ledger
      catalog/              # canonical catalog registry (§6)
      enrichment/           # run service + one executor per catalog id
      providers/
        exa/                # client, typed request/response models, error mapping
        moltsets/           # client, typed models (after REST doc review)
      research/             # company discovery (Flow 1, Copilot discover/find-more)
      copilot/              # conversations, messages, intent router, reply templates
      radar/                # fixtures/*.json + read service + signal actions
      exports/              # CSV/XLSX writers, download tokens
    worker/main.py          # worker loop
  scripts/
    extract_radar_fixtures.mjs
    record_provider_fixture.py
  tests/
    contract/ unit/ integration/ fixtures/
```

### 4.3 Why there is no separate LLM in this plan

The user constraint is Exa + MoltSets only. Exa `/search` supports `outputSchema` (structured synthesis with field-level citations and confidence) and `stream: true` (SSE text deltas), which covers cell-level extraction and summarisation. Copilot intent handling uses a **deterministic router** ported from the frontend's existing regex logic (`home/model.ts:askPlan`, `workspace/model.ts:send`). The router sits behind an `IntentRouter` interface so an LLM planner can replace it later without touching the action pipeline. **CONFIRM** if an LLM provider should be added; it is not part of this plan.

---

## 5. Provider capability map

### 5.1 Exa — verified from the OpenAPI reference (`/search`, checked Oct 2026)

| Fact | Value |
|---|---|
| Base URL / auth | `https://api.exa.ai`, header `x-api-key` (or `Authorization: Bearer`) |
| `POST /search` `type` | `auto` (default), `lite`, `deep-lite`, `deep`. `fast`, `instant`, `deep-reasoning` are **legacy — do not use** |
| `category` | `company`, `people`, `news`, `publication`, `personal site`, `financial report`. `company`/`people` reject `startPublishedDate`/`endPublishedDate`; `people` rejects `excludeDomains` (400) |
| `numResults` | 1–100 (default 10) |
| Domain filters | `includeDomains` / `excludeDomains`, up to 1,200 entries, hostnames or path prefixes |
| `contents` | `text`, `highlights`, `summary {query, schema}`, `extras {links, imageLinks}`, `maxAgeHours` (0 = always fresh, −1 = cache only) |
| `outputSchema` | root `text` or `object`; **max 10 properties total, max 2 nesting levels, arrays must define `items`**. Response `output.content` + `output.grounding[] {field, citations[{url,title}], confidence: low\|medium\|high}`. Adds ~2 s |
| `systemPrompt`, `objective`, `userIdentifier` | supported (userIdentifier: 1–64 chars, no PII) |
| `stream: true` | SSE chunks (`text-delta`, `grounding`, `results`, `done`, `error`) — only when `outputSchema` is set |
| Company entities | `results[].entities[]` with `type: company`: `name, foundedYear, description, workforce.total, headquarters {address, city, postalCode, country}, financials {revenueAnnual, fundingTotal, fundingLatestRound {name, date, amount}}, webTraffic` |
| Cost reporting | `costDollars.total` on every response |
| Errors | 400 validation, 401, 402 out of credits/budget, 403, 429 rate limit, 500, 503 (retry with backoff). Body `{requestId, error, tag}` |
| `/contents` | for known URLs; `subpages`/`subpageTarget` belong here (deprecated on `/search`) |
| Research API `/research/v1` | **legacy/deprecated — do not use** |

### 5.2 MoltSets — capabilities from MoltSets' published tool surface

Verified capability names and inputs (REST paths and response fields **must** be confirmed in `developer.moltsets.com` during P4b):

| Capability | Input | Notes from provider description |
|---|---|---|
| `search_people` | `company_domain[]`, `company[]`, `title[]`, `seniority[]`, `department[]`, `country[]`, …, `limit` (max 25), `offset` | Seniority values: `Intern, Entry, Senior, Manager, Director, VP, Head, C Suite, Owner, Partner`. Department values: 12 fixed values incl. `Sales`, `Marketing`, `Operations` |
| `linkedin_to_business_email` | `linkedin_url` or `linkedin_urls[]` (≤100) | "Tokens are only charged when data is found" |
| `search_business_email_by_name` | `name` + `company_domain` | Returns email + matched LinkedIn URL |
| `reverse_linkedin_lookup` | `linkedin_url(s)` | Profile + company firmographics, NAICS/SIC |
| `search_business_profile_by_name` | `name` + `company_domain` | Same shape as reverse lookup |
| `validate_emails` | `emails[]` (≤1,000) | Separate validation tokens — **not used in this plan** |
| `linkedin_to_mobile_phone` | — | Separate phone tokens — **not used in this plan** |

Published plan limits differ by tier (third-party review reports 30 requests/minute on the lowest paid tier and 1,000/minute on others). **DECISION:** rate limit is a config value read from the team's actual plan, never hard-coded.

### 5.3 Provider gates (must pass before a dependent enrichment is switched on)

| Gate | Test | Pass condition |
|---|---|---|
| G1 Exa entity resolution | Exa `category: company` for 30 known domains from the team's real lists | Team-set hit-rate threshold (CONFIRM value) where result URL host == input domain |
| G2 Exa LinkedIn coverage | `includeDomains: ["linkedin.com"]` for 20 companies | Returns the company's own LinkedIn page for a team-set share; else `find_linkedin_highlights` stays disabled |
| G3 MoltSets REST contract | Read REST docs; record real responses for `search_people` and `linkedin_to_business_email` with `scripts/record_provider_fixture.py` | Response fields mapped in typed models; plan rate limit known; commercial-use + data-retention terms reviewed |
| G4 Exa careers coverage | `find_job_openings` on 20 domains | Team review of correctness |

---

## 6. Canonical enrichment catalog

`GET /enrichments/catalog` returns these items. Costs are credits per cell, taken from the mock (12 shared items) and Workspace `COL_TYPES` (others). **CONFIRM all prices before launch.**

Status: **LIVE** = build and enable · **GATED** = build, enable after gate passes · **EXCLUDED** = not in catalog response.

| id | Label | Cost | Output | Applies to | Provider strategy (§7 details) | Default provenance | Status |
|---|---|---|---|---|---|---|---|
| `find_company_domain` | Find Company Domain | 2 | link | companies | Exa company search by name | provider_reported / conflicting | LIVE (G1) |
| `find_snapshot` | Find Company Snapshot | 3 | text | companies | Exa company entity | provider_reported | LIVE (G1) |
| `find_funding` | Find Company Funding | 3 | badge | companies | Exa entity → fallback news + outputSchema | provider_reported / verified | LIVE |
| `find_revenue` | Find Company Revenue | 2 | text | companies | Exa entity `financials.revenueAnnual` only | estimated | LIVE (G1) |
| `find_company_news` | Find Company News | 3 | text | companies | Exa `category: news` | verified | LIVE |
| `find_job_openings` | Find Job Openings | 3 | text | companies | Exa on company domain + outputSchema | verified | GATED (G4) |
| `find_social_profiles` | Find Social Profiles | 2 | chips | companies | Exa `/contents` homepage `extras.links` | verified | LIVE |
| `find_core_values` | Find Core Values | 3 | text | companies | Exa on company domain + outputSchema | verified / ai_inferred | LIVE |
| `find_free_trial` | Find Free Trial | 2 | badge | companies | Exa on company domain + outputSchema | verified | LIVE |
| `find_pricing` | Find Pricing | 3 | text | companies | Exa on company domain + outputSchema | verified | LIVE |
| `find_gtm_strategy` | Find GTM Strategy | 5 | text | companies | Exa `deep-lite` + outputSchema text | ai_inferred | LIVE |
| `find_revenue_model` | Determine Company Revenue Model | 3 | text | companies | Exa + outputSchema | ai_inferred | LIVE |
| `find_product_categories` | Find Product Categories | 2 | chips | companies | Exa + outputSchema | ai_inferred | LIVE |
| `classify_b2b_b2c` | Classify as B2B or B2C | 2 | badge | companies | Exa + outputSchema enum | ai_inferred | LIVE |
| `find_competitors` | Find Competitors | 2 | chips | companies | Exa + outputSchema (max 3) | ai_inferred | LIVE |
| `find_leadership_changes` | Find Recent Leadership Changes | 4 | text | companies | Exa `category: news`, last 90 days | verified | LIVE |
| `find_tech_stack` | Find Technologies Mentioned | 6 | chips | companies | Exa + outputSchema; **mentions in public pages only, not script detection** | ai_inferred | GATED (label change CONFIRM) |
| `find_linkedin_highlights` | Find LinkedIn Profile Highlights | 4 | text | companies | Exa `includeDomains: linkedin.com` | verified | GATED (G2) |
| `find_decision_makers` | Find Decision Makers | 20 | people | companies | MoltSets `search_people` by domain | provider_reported | GATED (G3) |
| `find_work_email` | Work Email | 3 | email | leaders | MoltSets `linkedin_to_business_email` / `search_business_email_by_name` | provider_reported | GATED (G3) |
| `custom_prompt` | AI column (your prompt) | 3 | text | companies | Exa `deep-lite` + outputSchema text | ai_inferred | LIVE |
| `plain_value` | Value | 0 | text | any | No provider; user-filled | — | LIVE |
| `website_intent` | Website Intent | — | — | — | Needs a tracking pixel | — | **EXCLUDED** |
| `add_to_hubspot` | Add Lead to HubSpot | — | — | — | CRM integration | — | **EXCLUDED** |

Catalog item DTO (contract shape + amendments):

```json
{
  "id": "find_funding",
  "name": "Find Company Funding",
  "description": "Find the company's latest funding round.",
  "cost": 3,
  "outputType": "badge",
  "appliesTo": "companies",
  "source": "exa",
  "status": "live",
  "requiresInputs": ["domain"]
}
```

The catalog is code (a Python registry in `modules/catalog/registry.py`), not a DB table. Each entry points to one executor in `modules/enrichment/executors/`.

---

## 7. Executor specifications (per enrichment)

### 7.1 Shared executor contract

```
execute(row: RowSnapshot, column: ColumnConfig, ctx: ExecContext) -> ExecResult
ExecResult = { status: succeeded | no_data | failed,
               value: JSON | null,
               provenance: ProvenanceClass | null,
               confidenceLabel: low|medium|high|null,
               sources: [{url, title}],
               providerCalls: [{provider, endpoint, costDollars|tokens, requestId, ms}],
               error: {code, message} | null }
```

Rules that apply to every executor:

1. **Inputs first.** If a required input (usually `domain`) is missing, return `failed` with `error.code = "missing_input"` and make **no** provider call.
2. **Entity check.** For any Exa result used as evidence about the company, the result URL host must equal the row's normalized domain (or be a subdomain of it), unless the executor is explicitly a third-party search (news, competitors, leadership). Otherwise discard the result.
3. **Citations required for factual values.** For executors whose default provenance is `verified`, a value without at least one grounding citation is downgraded to `no_data`. For `ai_inferred` executors, citations are stored when present; the value is still marked `ai_inferred`.
4. **Exa `systemPrompt` (all outputSchema calls):** "Use only facts stated in the sources. If the requested information is not stated, return null for that field." Store the exact string in config.
5. **`userIdentifier`:** a hash of the workspace id.
6. **Output schemas** must respect Exa limits (≤10 properties total, ≤2 levels, typed array items). Schemas live next to each executor and have a unit test that checks the limits.
7. **Normalization** to the column output type happens in the executor; formatting templates are listed per executor below and covered by unit tests.

### 7.2 Per-executor logic

**`find_company_domain`** — input: `name` (+ `loc` if present). Exa `/search` `category: company`, `type: auto`, `query: "<name> <loc>"`, `numResults: 5`. Collect distinct result hosts. If exactly one candidate whose entity `name` matches the row name after normalization (case-folded, legal suffixes like "Inc", "Ltd" removed — list in config) → `succeeded`, value = host, provenance `provider_reported`. If several candidates match → `no_data` with provenance `conflicting` and candidates in `sources`. Else `no_data`.

**`find_snapshot`** — Exa company search restricted to the row domain (`includeDomains: [domain]`, `category: company`, `numResults: 3`). Take the entity whose result host == domain. Value template: `"{description} · {workforce.total} employees · {headquarters.city}, {headquarters.country}"`, dropping missing parts. All parts missing → `no_data`.

**`find_revenue`** — same entity lookup. Value = `financials.revenueAnnual` formatted as USD (`"$28M (estimated)"`), provenance `estimated`. Null → `no_data`. **No synthesis fallback** (revenue must not be generated by a model).

**`find_funding`** — step 1: entity `financials.fundingLatestRound` → `"{name} — ${amount}"` (+ date), provenance `provider_reported`. Step 2 (only if step 1 is null): `category: news`, `query: "<name> raises funding round"`, `startPublishedDate` = now − 730 days (config), outputSchema `{roundName: string|null, amountUsd: number|null, announcedDate: string|null, leadInvestor: string|null}`; requires citation → provenance `verified`. Else `no_data`.

**`find_company_news`** — `category: news`, `query: "<name>"`, `startPublishedDate` = now − 90 days (config), `numResults: 10`, `contents.highlights: true`. Keep results whose title or highlights contain the company name or domain. Value = newest kept item `"{title} ({publishedDate})"`, `sources` = that URL. Also emits a Signals-sheet row (§8.7). None kept → `no_data`.

**`find_leadership_changes`** — `category: news`, `query: "<name> appoints OR hires OR joins as chief OR VP OR head"`, last 90 days (config), outputSchema `{changes: array of {person: string, role: string, type: "hire"|"departure", date: string|null}}` (≤10 properties total). Citations required. Value template: `"New {role}: {person} ({date})"` joined by `; `. Empty → `no_data`.

**`find_social_profiles`** — Exa `/contents` for `https://{domain}` with `extras.links: 100`. Filter links whose host is one of a config list (`linkedin.com/company`, `x.com`, `twitter.com`, `youtube.com`, `facebook.com`, `instagram.com`). Value = list of URLs (chips), provenance `verified`, source = homepage URL. No model involved.

**`find_core_values`, `find_free_trial`, `find_pricing`** — `/search` `includeDomains: [domain]`, `type: auto`, `numResults: 5`, query from column prompt (catalog default description if none), outputSchema:
- core values: `{values: array of string}`
- free trial: `{offersFreeTrial: boolean|null, trialLength: string|null}` → badge `"Free trial available (14 days)"` / `"No free trial found"` only if `false` is cited; `null` → `no_data`
- pricing: `{pricingPublished: boolean|null, startingPrice: string|null, pricingModel: string|null}`
Citations required.

**`find_job_openings`** — `/search` `includeDomains: [domain]`, `query: "careers open positions"`, outputSchema `{openRoleCount: number|null, gtmRoles: array of string}`. Value `"{n} open roles; GTM: {roles}"`. Citations required. Limitation: job boards on other domains are not covered (gate G4).

**`find_gtm_strategy`, `find_revenue_model`, `find_product_categories`, `classify_b2b_b2c`, `find_competitors`** — `/search` `type: deep-lite`, query = catalog prompt + `"Company: <name> (<domain>)"`, outputSchema text (gtm, revenue model) or object (`{categories: array of string}`, `{model: "B2B"|"B2C"|"Both"|null}`, `{competitors: array of string}` capped at 3). Provenance `ai_inferred`; citations stored.

**`find_tech_stack`** (GATED) — `/search` `query: "<name> technology stack tools integrations"`, outputSchema `{technologies: array of string}`. Provenance `ai_inferred`. UI label must say "mentioned in public sources" (CONFIRM). Exa cannot detect installed scripts the way the UI's "bw" badge implies.

**`find_linkedin_highlights`** (GATED, G2) — `/search` `includeDomains: ["linkedin.com"]`, `query: "<name> company page"`, `contents.highlights: true`, `numResults: 3`; accept only a `linkedin.com/company/…` URL. Value = up to 3 highlights joined. Else `no_data`.

**`custom_prompt`** — `/search` `type: deep-lite`, `query: "<user prompt>. Company: <name> (<domain>)"`, outputSchema `{type: "text"}`. Provenance `ai_inferred`; citations stored. Prompt text is part of the cache key.

**`find_decision_makers`** (GATED, G3) — MoltSets `search_people` with `company_domain: [domain]`, `seniority` default `["C Suite","VP","Head","Director","Owner"]`, optional `department` / `title` from column params, `limit` default 10 (max 25). Value (people) = `[{name, title, linkedinUrl, seniority}]` — exact source fields mapped after G3. Side effect: upsert each person into the project's **Leaders** sheet (`companyRowId` link, dedupe by LinkedIn URL, else by name + company). Company cell summary in UI: `"{first} + {n-1} more"`. Provenance `provider_reported`.

**`find_work_email`** (GATED, G3) — on a Leaders row. If `linkedinUrl` present → `linkedin_to_business_email`; else if name + company domain → `search_business_email_by_name`; else `failed / missing_input`. Found → value = email, provenance `provider_reported`. Not found → `no_data` (MoltSets does not charge tokens; we charge 0 credits). **Never** construct an email from a name pattern. Batching (≤100 URLs per call) is an optimization allowed in P10 only.

**`plain_value`** — no executor; column holds user edits only. "Run" on it is a no-op that returns a validation error (`422 not_runnable`).

---

## 8. Cross-cutting engines

### 8.1 Data model (Alembic migration `0001_initial`)

| Table | Key columns |
|---|---|
| `workspaces` | id, name, plan, credits_balance (int), created_at |
| `users` | id, workspace_id, name, email, initials |
| `projects` | id, workspace_id, name, status (`Live\|Complete\|Paused\|Draft`), type, prompt, tool_ids jsonb, connector_ids jsonb, created_at, last_run_at, deleted_at |
| `sheets` | id, project_id, key, name, kind (`companies\|leaders\|signals\|custom`), created_at |
| `columns` | id, sheet_id, key (unique per sheet), label, type, enrichment_id (null for base), prompt, params jsonb, position, hidden, is_base |
| `rows` | id, sheet_id, data jsonb (base fields), normalized_domain, company_row_id (leaders/signals), revision int, created_at |
| `cells` | (row_id, column_id) PK, value jsonb, status, provenance, confidence numeric null, confidence_label, source, user_edited bool, stale bool, cost int, error jsonb, fetched_at, last_run_id, revision int |
| `cell_sources` | id, row_id, column_id, url, title, provider, captured_at |
| `enrichment_runs` | id, job_id, sheet_id, columns jsonb, estimated_credits, charged_credits, status, created_at |
| `jobs` | id, workspace_id, type (`research\|chat\|enrichment\|run_cells`), status (`queued\|running\|paused\|succeeded\|failed\|cancelled`), progress jsonb, steps jsonb, estimated_credits, charged_credits, result jsonb, error jsonb, parent_ref jsonb, created_at, updated_at |
| `job_items` | id, job_id, kind (`cell\|discover\|reply`), row_id, column_id, payload jsonb, status (`pending\|running\|done\|cancelled`), attempts, lease_until, result jsonb |
| `job_events` | (job_id, seq) PK, event, data jsonb, created_at |
| `credit_ledger` | id, workspace_id, job_id, kind (`grant\|reserve\|charge\|release`), amount int, created_at |
| `idempotency_keys` | (workspace_id, key) PK, route, request_hash, response jsonb, created_at |
| `enrichment_cache` | (normalized_domain, enrichment_id, prompt_hash, executor_version) PK, result jsonb, created_at |
| `provider_calls` | id, job_id, row_id, provider, endpoint, status_code, request_id, cost_dollars numeric null, ms, created_at |
| `conversations` | id, workspace_id, project_id, title, created_at, updated_at |
| `messages` | id, conversation_id, role, content, status (`streaming\|complete\|failed`), feedback, intent jsonb, job_id, created_at |
| `radar_signal_actions` | (workspace_id, signal_id) PK, action (`review\|dismiss`), created_at |
| `download_tokens` | token PK, sheet_id, format, expires_at |

Seed (migration `0002_seed`): one workspace (credits 5,000, matching the mock), one user. Radar data is **not** in the DB (JSON fixtures).

### 8.2 Jobs, queue and SSE

**State machine (job):** `queued → running → (paused ↔ running) → succeeded | failed | cancelled`.
- `succeeded` if at least one item succeeded or was `no_data`; `failed` only if every item failed (mock rule, extended for `no_data`).
- Job `steps`: one per enrichment column (mock behaviour: `meta = "{done} of {total}"`, `status = running | done | completed_with_errors`); research and chat jobs add their own leading steps (§9).

**Worker loop:**
1. `SELECT … FROM job_items JOIN jobs … WHERE item.status='pending' AND job.status='running' ORDER BY job.created_at, item.id FOR UPDATE SKIP LOCKED LIMIT {batch}`.
2. Set `status='running'`, `lease_until = now + lease_seconds`, commit.
3. Execute with a per-provider async rate limiter and `max_concurrency` (config).
4. In one transaction: write cell via `sheets.write_enrichment_result`, insert `cell_sources`, insert `provider_calls`, charge credits (if `succeeded`), mark item `done`, update job progress/steps, insert `job_events` (`cell`, `progress`, `step` when changed), then `NOTIFY job_events, '<job_id>'`.
5. When no pending/running items remain → settle (§8.3) and emit `done`.
6. Recovery: on startup and every N seconds, items with `status='running' AND lease_until < now` go back to `pending` with `attempts+1`; after `max_attempts` → item `done` with cell `failed / provider_unavailable`.

**Pause:** job → `paused`; workers skip it; running items finish. **Resume:** job → `running`, `NOTIFY`. **Cancel:** job → `cancelled`; pending items → `cancelled` (cells `cancelled`, cost 0); running items finish and are charged if they succeed (C7); then settle.

**SSE `GET /jobs/:jobId/events`:**
- On connect: replay `job_events` with `seq > Last-Event-ID` (header or `?lastEventId=`), then `LISTEN` and stream new rows. Each event: `id: {seq}`, `event: {name}`, `data: {json}`.
- Events: `progress {done,total,unit}`, `step {key,label,status,meta}`, `cell {CellView}`, `token {messageId, delta}` (chat), `done {status, chargedCredits, summary}`, `error {code,message}`.
- First event on connect is always a `progress` snapshot (mock behaviour). If the job is terminal, send snapshot + `done` and close (mock behaviour).
- Heartbeat comment `: ping` every `sse_heartbeat_seconds` (config).

### 8.3 Credits

- **Estimate** = Σ over eligible cells of `catalog[cost]`. Eligible = not `user_edited` (unless `overwriteEdited: true`), not currently `running`, and the column is runnable.
- **Reserve** at run creation inside one transaction with `SELECT … FOR UPDATE` on the workspace row. Not enough → `409 insufficient_credits` with `details {required, remaining}` (mock behaviour).
- **Charge** per `succeeded` cell at its catalog cost. `no_data`, `failed`, `cancelled`, skipped → 0.
- **Settle** at job end: release `reserved − charged`; write ledger rows; set `chargedCredits`.
- Research discovery credits: **CONFIRM** price per discovered company. The only per-row number in the code for discovery is the "Find ICP accounts" workflow at 2 credits/row (`home/model.ts:57`); use 2 until confirmed. Reserve `requestedCount × price`, charge per company row actually inserted.
- Cache hits: **CONFIRM** whether a cache hit is charged. Default until confirmed: charged at catalog cost (the customer receives the same value); `provider_calls` records zero spend.

### 8.4 The sheet write path (only `modules/sheets` writes these tables)

| Operation | Rules |
|---|---|
| `create_sheet / add_base_rows` | Dedupe companies by `normalized_domain` (lowercase, strip scheme, `www.`, path, trailing dot). Rows without a domain dedupe by normalized name. |
| `add_column` | Unique `key` per sheet: slug of label, suffix `_2`, `_3` on collision. |
| `edit_base_field` | Only `domain, emp, loc, gap, last` (same list as `gridUtils.ts`). `emp` → integer 0–10,000,000; strings trimmed to 500 chars (same as `sanitizeEdit`). Optional `expectedRevision` → `409 revision_conflict`. Editing `domain` marks that row's enrichment cells `stale=true` (values kept). |
| `edit_cell` | Allowed on `plain_value` and `custom` columns only (frontend `canEditColumn`). Sets `user_edited=true`, `source="user"`, `provenance=null`. A cell with status `running` → `409 cell_running`. |
| `write_enrichment_result` | Skips the write if the cell became `user_edited` while running (result kept in `job_items.result` only, no charge). Clears `stale`. |
| `clear_column_results` | Removes values/status of non-user-edited cells of one enrichment column. `409` if a job is running on that column. |
| `remove_column` | Soft-delete; `409` if a job is running on it. |

### 8.5 Provenance and the cell view

Provenance classes, taken from the project context document (§5, §6, §8: verified facts, provider-reported values, third-party estimates, AI-generated interpretations, conflicting information, information that cannot be found):

| Class | Meaning |
|---|---|
| `verified` | Value stated on a cited page; URL stored |
| `provider_reported` | Returned by Exa entity data or MoltSets |
| `estimated` | Third-party estimate (e.g. Exa `revenueAnnual`) |
| `ai_inferred` | Exa synthesis / interpretation; citations stored when present |
| `conflicting` | Several plausible values; no value chosen; candidates in sources |
| `not_found` | Reserved for `no_data` cells (value null) |

If `outmate_spec_v1.3.md` defines the six classes with other names, rename these to match the spec (do not add a seventh). User-entered values carry `userEdited: true` instead of a class.

`CellView` (contract + A4, A6, A8):

```json
{
  "rowId": "row_…", "columnKey": "funding", "enrichmentId": "find_funding",
  "status": "pending|running|succeeded|no_data|failed|cancelled",
  "value": "Series B — $28M", "provenance": "provider_reported",
  "source": "exa", "sources": [{"url": "https://…", "title": "…"}],
  "confidence": null, "confidenceLabel": "high",
  "userEdited": false, "stale": false,
  "fetchedAt": "2026-10-27T06:01:11Z", "cost": 3, "error": null
}
```

### 8.6 Caching

Key = `(normalized_domain, enrichment_id, sha256(prompt + params), executor_version)`. TTL per enrichment in config (**CONFIRM** values; suggested starting points are a product decision, not set here). `POST /enrichments/runs` accepts `refresh: true` to bypass. Bump `executor_version` whenever an executor's query or schema changes.

### 8.7 Signals sheet (derived, minimal)

Only two executors create Signals rows, because only they produce dated, sourced events: `find_company_news` (type `News`) and `find_funding` step 2 (type `Funding`). Signal row = `{companyRowId, companyName, type, detail, source (cited URL host), detectedAt (publishedDate), confidence: confidenceLabel}`. `freshness` and `relevance` (contract fields) are `null` (A5 spirit — no invented scoring).

### 8.8 Retries and error mapping

| Provider response | Action |
|---|---|
| Exa 429 / 503 / network timeout | Retry with exponential backoff + jitter, `max_attempts` (config). Honour `Retry-After` if present |
| Exa 402 | Stop claiming items for Exa jobs; job → `failed` with `provider_out_of_credits`; settle |
| Exa 400 | No retry; cell `failed` with `provider_rejected_request`; log request + `requestId` |
| Exa 401/403 | No retry; job → `failed` with `provider_auth`; alert in logs |
| MoltSets not found | `no_data` |
| MoltSets plan_restricted / auth | Cell `failed` with code from provider; no retry |
| MoltSets rate limit | Same as Exa 429 |

API error codes (envelope from the contract): `validation_error`, `unknown_row_ids`, `unknown_enrichment`, `duplicate_column_key`, `insufficient_credits`, `invalid_state`, `revision_conflict`, `cell_running`, `not_runnable`, `not_found`, `rate_limited`.

### 8.9 Idempotency

Required on `POST /enrichments/runs`, `POST /projects`, `POST /projects/:id/columns`, `POST /workspace/sheets/:id/columns`, `POST /workspace/sheets/:id/rows/run`, `POST /copilot/conversations`, `POST /copilot/conversations/:id/messages`. Same `(workspace, Idempotency-Key)` → return the stored response with the same status (mock behaviour). If the request hash differs, still return the original and log a warning (mock-compatible; **CONFIRM** if a `409` is preferred).

---

## 9. The five flows

### 9.1 Flow 1 — Home → Research project → Results

**Endpoints:** `POST /projects`, `GET /jobs/:id`, `GET /jobs/:id/events`, `GET /projects`, `GET /projects/:id`, `PATCH /projects/:id`, `DELETE /projects/:id`, `POST /projects/:id/columns`, `GET /workspace/sheets/:id/rows` (results).

**Sequence**

1. `POST /projects` `{prompt, agentId, toolIds, connectorIds, enrichments}` with `Idempotency-Key`.
2. Validate: `prompt` 1–2,000 chars (config); every id in `enrichments` exists, is `live`, and `appliesTo: companies`.
3. Parse prompt with `research.parse_request` (deterministic):
   - `requestedCount` = first match of `(\d[\d,]*)\s+(companies|accounts|businesses|startups|brands)`; default `research_default_count` (**CONFIRM**, suggested 25); capped at 100 (Exa `numResults` max). If capped, the cap is reported in the job result.
   - Query = the prompt text as written (Exa accepts natural language). No post-filtering on fields we do not have.
4. Transaction: create project (`status: Live`, `type: "GTM Research"`), sheet `Target Companies` (`kind: companies`, base columns from `ALL_COLS` that we can fill: company, domain, linkedin, emp, loc, industry — others hidden), job `type: research`, one `discover` item, reserve discovery credits. Return `202 {project, jobId}`.
5. Worker `discover` item: Exa `/search` `category: company`, `type: auto`, `numResults: requestedCount`, `contents.highlights: true`. For each result: host → domain; entity → `name, description, workforce.total → emp, headquarters → loc`. Skip results without a usable host. Dedupe by domain. Insert rows (`provenance: provider_reported`, `source: exa`, URL in sources). Charge per inserted row. Emit `step {key: "discover", meta: "{n} companies"}` and `progress`.
6. If `enrichments` were requested: add one enrichment column per id and create cell items for every new row (progress `total` grows; unit becomes `items`). Credits for these are reserved now; if insufficient, skip enrichment, set `result.enrichmentSkipped = "insufficient_credits"`, still succeed the discovery.
7. Settle, project `status: Complete`, `lastRunAt` set, `done` event with `summary {companies, duplicatesRemoved, capped}`.
8. Frontend opens Workspace for the project and reads `GET /workspace/projects/:id` + sheet rows.

**Ignored inputs:** `agentId`, `toolIds`, `connectorIds` are stored on the project but have no effect in this plan (connectors are out of scope). Document this in the contract.

**Project counts** (`counts.companies/leaders/signals/enriched`) are computed from rows and succeeded cells; `creditsUsed` from the ledger.

**`PATCH /projects/:id`:** `name`; `status: Paused` pauses the active job; `status: Live` resumes it. **`DELETE`:** soft delete; cancels active jobs first.

**`POST /projects/:id/columns`** `{enrichmentId | prompt, label?}` → adds the column on the project's companies sheet, then behaves exactly like `POST /enrichments/runs` over all rows. Returns `202 {column, runId, jobId, estimatedCredits}`.

**Acceptance:** prompt "Find 30 B2B SaaS companies in India" with a recorded Exa fixture produces ≤30 unique-domain rows, each with a source URL; credits charged = rows × discovery price; re-POST with same key returns the same project.

### 9.2 Flow 2 — Enrichment catalog → Add column → Process cells

**Endpoints:** `GET /enrichments/catalog`, `POST /workspace/sheets/:id/columns`, `POST /enrichments/runs`, `GET /enrichments/runs/:runId`, `GET /jobs/:id`, `GET /jobs/:id/events`, `POST /jobs/:id/cancel|pause|resume`.

**Sequence**

1. UI loads catalog (filters `status: live`; gated items appear only after their gate passes — flag in config).
2. Add column: `POST /workspace/sheets/:id/columns {name, type, prompt, enrichmentId?, applyTo}`.
   - `applyTo: "none"` (DECISION, default — the Workspace UI adds a column and then says "run cells to populate") → `201 {column, jobId: null}`.
   - `applyTo: "all"` → also start a run over all rows → `202 {column, jobId, runId, estimatedCredits}`.
3. Run: `POST /enrichments/runs {target {sheetId, rowIds}, columns [{key, label?, type?, enrichmentId, prompt?}], refresh?, overwriteEdited?}`.
   - Validation (mock rules): non-empty `rowIds` (else `422 validation_error`); non-empty `columns`; every rowId exists in that sheet (else `422 unknown_row_ids` with `details.unknown`); unique column keys (`duplicate_column_key`); known enrichment (`unknown_enrichment`); `appliesTo` matches sheet kind (`422 validation_error`); max rows per run `run_max_rows` (config, **CONFIRM**, suggested 500).
   - A column key that does not exist on the sheet is created; an existing key must have the same `enrichmentId`.
   - Reserve credits (§8.3), create run + job (`type: enrichment`) + one item per eligible cell; mark those cells `pending`. Return `202 {runId, jobId, estimatedCredits, status: "queued"}`.
4. Worker processes items (§8.2) using the executors (§7), checking the cache first (§8.6).
5. `GET /enrichments/runs/:runId` returns the contract shape with A4/A6/A8 cell views.

**Acceptance (ported mock tests, §12):** charges per succeeded cell; partial failure leaves job `succeeded`; all-failed → `failed` and 0 charge; cancel charges completed only; idempotent replay; validation error envelope.

### 9.3 Flow 3 — Copilot → Conversation → Streaming → Results

**Endpoints:** `GET/POST /copilot/conversations`, `GET/PATCH /copilot/conversations/:id`, `POST /copilot/conversations/:id/messages`, `POST /copilot/messages/:id/feedback`, `POST /copilot/messages/:id/regenerate`, `GET /copilot/conversations/:id/results`, `POST /copilot/conversations/:id/exports`, `GET /companies/:id`, plus jobs/events.

**Sequence**

1. `POST /copilot/conversations {text, agentId, toolIds, enrichmentIds, attachmentIds}` → creates conversation (title = first 60 chars of text), an empty project bound to it (`type: "Copilot Research"`), the user message, an assistant message (`status: streaming`) and a job `type: chat`. Returns `202 {conversationId, messageId (assistant), jobId}`. `attachmentIds` → `422 not_supported` if non-empty (uploads out of scope).
2. Follow-ups: `POST …/messages` — same, on the existing conversation/project.
3. Worker runs the chat job:
   - **Step "Understanding request":** `IntentRouter.route(text, state)` where `state = {hasCompanies, hasLeaders, columns}`. Rules, evaluated in order (ported from `askPlan` and Workspace `send`):

| Order | Pattern (case-insensitive) | Intent | Action |
|---|---|---|---|
| 1 | `\b(more|additional|another)\b` and `hasCompanies` | `find_more` | Research with `excludeDomains` = existing domains (≤1,200) |
| 2 | `cmo|cto|cro|cfo|decision maker|leader|head of|founder|director|\bvp\b|people|contact` and `hasCompanies` | `enrich` `find_decision_makers` | Run on all company rows |
| 3 | `email` and `hasLeaders` | `enrich` `find_work_email` | Run on all leader rows |
| 4 | `fund|funded|funding|series|raise` and `hasCompanies` | `enrich` `find_funding` | |
| 5 | `news` and `hasCompanies` | `enrich` `find_company_news` | |
| 6 | `hiring|jobs|open roles` and `hasCompanies` | `enrich` `find_job_openings` (if enabled) | |
| 7 | `tech stack|technolog` and `hasCompanies` | `enrich` `find_tech_stack` (if enabled) | |
| 8 | `add (a )?column` and `hasCompanies` | `enrich` `custom_prompt` with the remaining text as prompt | |
| 9 | `compan|account|startup|business|brand` or not `hasCompanies` | `discover` | Research (Flow 1 logic) into this project |
| 10 | otherwise | `unsupported` | Reply listing supported requests |

   - `phone` requests → `unsupported` (phone enrichment out of scope). Filter/sort requests ("only show…", "rank…") → `unsupported` with a pointer to the table filter/sort controls.
   - Gated enrichments that are disabled → `unsupported` reply naming the reason.
   - **Execution:** the chat job creates its child items in the same job (discover and/or cell items) with the same credit rules; `steps` show "Understanding request", "Discovering companies" / "Enriching: {label}", "Writing reply".
   - **Reply:** built from templates using only real numbers from the job, e.g. `"Found {n} companies ({d} duplicates removed). Next: find decision makers, funding or news."` / `"Ran {label} on {rows} rows: {ok} filled, {nodata} no data, {failed} failed. {credits} credits used."` Template text streams as `token` events (chunked), then the message is saved `status: complete`. **No model-generated statistics.**
4. `GET /copilot/conversations/:id/results?sheet=target-companies|leaders|signals&query&filter&sort&hidden&cursor` reads the bound project's sheet through the same reader as Workspace (§9.5), returning the contract table shape with A5/A7.
5. `regenerate` (**DECISION**): rebuilds the reply text from the stored job result; never re-runs providers, never charges. Returns a job envelope so the UI can stream the new text.
6. `feedback {rating}` stores `up|down` on the message.
7. `exports {format, sheets}` → same writer as Workspace export; returns `{url}` (download token, §9.5).
8. `GET /companies/:id?include=signals,people,social,stack` — `:id` is a companies-sheet row id (**DECISION**). Built only from stored data: overview (name, domain, emp, loc, snapshot cell), `signals` (Signals rows for that company), `people` (Leaders rows), `social` (`find_social_profiles` cell), `stack` (`find_tech_stack` cell). Missing parts are empty arrays/nulls.

**Workspace chat pane** uses the same service: `GET /workspace/conversations` = conversations whose `project_id` is the open project; `POST /workspace/conversations` = `POST /copilot/conversations` bound to that existing project.

**Acceptance:** "Find 20 fintech companies in London" → discover; "find decision makers at these companies" → `find_decision_makers` run on all rows; reply numbers equal DB counts; reconnecting SSE with `Last-Event-ID` replays missed `token` events in order.

### 9.4 Flow 4 — Radar → Signal → Account details (preview, fixture-backed)

**Endpoints:** `GET /radar/accounts`, `GET /radar/accounts/:id`, `GET /radar/signals`, `POST /radar/signals/:id/actions`, `POST /radar/questions`, `GET /radar/signal-mix`.

**Fixtures:** `scripts/extract_radar_fixtures.mjs` slices the literal arrays/objects `ACCOUNTS`, `FEED`, `DRAWER`, `ANSWERS`, `MIX` from `src/pages/radar/model.ts` and writes `backend/app/modules/radar/fixtures/*.json`. (Verified: all five are plain literals that evaluate cleanly — 10 accounts, 8 feed items, 1 drawer, 1 answer, 8 mix rows.) Commit the JSON; the backend never reads frontend source at runtime.

**Mapping rules (no new data):**
- Account `id` = `cmp_` + slug(name). `zone` is omitted (client computes it, `zoneOf`, per the contract note).
- Signal `id` = `sig_{fixture id}`; `company.id` = account id by name match (null if no matching account); `source` = text after `·` in `meta` (e.g. `LinkedIn`); `detectedAt` = fixture load time minus parsed `time` (`"Nh ago"`, `"N days ago"`, `"Yesterday"` = 24 h, `"Today"` = 0 h; unparsable → `null`); `recommendation` ← `recommend`.
- Drawer: for Acme, the `DRAWER` object (`recs` → `recommendations`). For every other account: `{id, name, whyNow: null, timeline: [that account's FEED items], people: [], stack: [], recommendations: []}`.
- Filters: `types` filters accounts by `types[]` and signals by `type`; `range` filters signals by `detectedAt` (signals with null `detectedAt` are kept); `weight` is ignored (client-side ranking per contract).
- `POST /radar/signals/:id/actions {action: review|dismiss}` persists to `radar_signal_actions`; dismissed signals are excluded from `GET /radar/signals` for that workspace.
- `POST /radar/questions {question}`: exact (trimmed, case-insensitive) match to an `ANSWERS` key → that answer (rows get `accountId` by name match or null); otherwise `200 {summary: "Preview: only the sample question is answered with sample data.", rows: []}`.
- Every Radar response includes `"preview": true`. The UI shows "Preview — sample data".

**Acceptance:** responses match fixture counts; dismissed signal disappears; unknown question never returns invented rows.

### 9.5 Flow 5 — Workspace → Edit → Run → Export

**Endpoints:** `GET /workspace/projects/:id`, `GET /workspace/projects/:id/sheets`, `GET /workspace/sheets/:id/rows`, `PATCH /workspace/sheets/:id/rows/:rowId`, `POST /workspace/sheets/:id/columns`, `PATCH /workspace/sheets/:id/columns`, `POST /workspace/sheets/:id/rows/run`, `GET /workspace/sheets/:id/exports`, `GET /workspace/sheets/:id/context`, `GET /workspace/projects/:id/runs/:runId`, plus amendments A9 `DELETE /workspace/sheets/:id/columns/:key` and A10 `POST /workspace/sheets/:id/columns/:key/clear`.

**Read**
- `GET /workspace/projects/:id` → `{id, name, credits {remaining, used}, sheets: [Sheet]}`.
- `GET /workspace/sheets/:id/rows?query&filter&sort&hidden&cursor&limit` →
  - `query`: case-insensitive match on name and domain.
  - `sort`: `{columnKey}:{asc|desc}` on base fields or cell values; default `created_at asc`.
  - `filter` (**DECISION**, minimal, supports the run menu): `{columnKey}:{empty|not_empty|failed|no_data}`; multiple separated by `,` (AND).
  - `hidden`: listed columns omitted from `columns` and `cells`.
  - Response: `{sheet, title, counts {total}, columns, rows: [base fields + cells], nextCursor}`.

**Edit**
- `PATCH /workspace/sheets/:id/rows/:rowId {cells: {key: value}, expectedRevision?}` → sheet write path (§8.4). Returns the updated row. Non-editable key → `422 not_editable`.
- `PATCH /workspace/sheets/:id/columns {order, hidden}` → positions/hidden flags.
- A9 remove column, A10 clear results (§8.4 rules).

**Run**
- `POST /workspace/sheets/:id/rows/run {rowIds, columnKeys, estimatedOnly, overwriteEdited?}`:
  - `estimatedOnly: true` → `200 {estimatedCredits, eligibleCells, skipped {userEdited, running}}`, no job. The UI's confirm dialog uses this instead of its hard-coded `rows × 2 × 10`.
  - Otherwise → same run service as Flow 2 with job `type: run_cells`; `202 {jobId, runId, estimatedCredits}`.
  - The UI run modes map to `rowIds` the client already computes (all / selected / empty / retry failed); the server additionally skips ineligible cells. `columnKeys` pointing to `plain_value` → `422 not_runnable`.
- Progress dialog reads `progress.done/total`, `estimatedCredits`, `chargedCredits` (contract).

**Export**
- `GET /workspace/sheets/:id/exports?format=csv|xlsx&rowIds=&columnKeys=` → creates a download token (TTL config) and returns `{url: "/api/v1/downloads/{token}", expiresAt}` (**DECISION**: no object storage in this plan). `GET /downloads/:token` streams the file.
- Export content: visible columns in current order; one value column per enrichment column plus `"{label} — provenance"` and `"{label} — source URL"` columns (keeps evidence inspectable outside the app). XLSX via `openpyxl`.

**Context panel**
- `GET /workspace/sheets/:id/context?rowIds=` → `{overview, signals, enrichment, sources}` built only from stored rows, cells and `cell_sources` (denormalized, read-only per contract).
- `GET /workspace/projects/:id/runs/:runId` → run summary + job view.

**Acceptance:** edit a domain → enrichment cells for that row show `stale: true`; run empty cells after a partial run creates items only for empty cells; a user-edited cell is skipped and uncharged; CSV export contains provenance and source columns.

---

## 10. API surface (in scope)

R = real · F = fixture · ★ = amendment

| # | Method | Path | Module | Treatment | Packet |
|---|---|---|---|---|---|
| 1 | GET | `/me` | auth/credits | R (seeded) | P2 |
| 2 | GET | `/jobs/:jobId` | jobs | R | P2 |
| 3 | GET | `/jobs/:jobId/events` | jobs | R | P2 |
| 4 | POST | `/jobs/:jobId/pause` | jobs | R | P2 |
| 5 | POST | `/jobs/:jobId/resume` | jobs | R | P2 |
| 6 | POST | `/jobs/:jobId/cancel` | jobs | R | P2 |
| 7 | GET | `/enrichments/catalog` | catalog | R | P3 |
| 8 | POST | `/enrichments/runs` | enrichment | R | P5 |
| 9 | GET | `/enrichments/runs/:runId` | enrichment | R | P5 |
| 10 | GET | `/projects` | projects | R | P7 |
| 11 | POST | `/projects` | research | R | P7 |
| 12 | GET | `/projects/:id` | projects | R | P7 |
| 13 | PATCH | `/projects/:id` | projects | R | P7 |
| 14 | DELETE | `/projects/:id` | projects | R | P7 |
| 15 | POST | `/projects/:id/columns` | enrichment | R | P7 |
| 16 | GET | `/workspace/projects/:id` | sheets | R | P6 |
| 17 | GET | `/workspace/projects/:id/sheets` | sheets | R | P6 |
| 18 | GET | `/workspace/sheets/:id/rows` | sheets | R | P6 |
| 19 | PATCH | `/workspace/sheets/:id/rows/:rowId` | sheets | R | P6 |
| 20 | POST | `/workspace/sheets/:id/columns` | sheets+enrichment | R (A3) | P6 |
| 21 | PATCH | `/workspace/sheets/:id/columns` | sheets | R | P6 |
| 22 | DELETE ★ | `/workspace/sheets/:id/columns/:key` | sheets | R (A9) | P6 |
| 23 | POST ★ | `/workspace/sheets/:id/columns/:key/clear` | sheets | R (A10) | P6 |
| 24 | POST | `/workspace/sheets/:id/rows/run` | enrichment | R | P6 |
| 25 | GET | `/workspace/sheets/:id/exports` | exports | R | P6 |
| 26 | GET ★ | `/downloads/:token` | exports | R | P6 |
| 27 | GET | `/workspace/sheets/:id/context` | sheets | R | P6 |
| 28 | GET | `/workspace/projects/:id/runs/:runId` | enrichment | R | P6 |
| 29 | GET | `/workspace/conversations` | copilot | R | P8 |
| 30 | POST | `/workspace/conversations` | copilot | R | P8 |
| 31 | GET | `/copilot/conversations` | copilot | R | P8 |
| 32 | POST | `/copilot/conversations` | copilot | R | P8 |
| 33 | GET | `/copilot/conversations/:id` | copilot | R | P8 |
| 34 | PATCH | `/copilot/conversations/:id` | copilot | R | P8 |
| 35 | POST | `/copilot/conversations/:id/messages` | copilot | R | P8 |
| 36 | POST | `/copilot/messages/:id/feedback` | copilot | R | P8 |
| 37 | POST | `/copilot/messages/:id/regenerate` | copilot | R | P8 |
| 38 | GET | `/copilot/conversations/:id/results` | sheets | R | P8 |
| 39 | POST | `/copilot/conversations/:id/exports` | exports | R | P8 |
| 40 | GET | `/companies/:id` | sheets | R | P8 |
| 41 | GET | `/radar/accounts` | radar | F | P9 |
| 42 | GET | `/radar/accounts/:id` | radar | F | P9 |
| 43 | GET | `/radar/signals` | radar | F | P9 |
| 44 | POST | `/radar/signals/:id/actions` | radar | F + persisted action | P9 |
| 45 | POST | `/radar/questions` | radar | F | P9 |
| 46 | GET | `/radar/signal-mix` | radar | F | P9 |

(46 rows = 43 contract endpoints + 3 amendment endpoints.) Contract endpoints **not** built: `/workspaces/:id`, navigation, notifications, search, credits purchase, integrations, pages, workflows, templates, lists, `/projects/:id/runs`, imports, shares (Copilot and Workspace).

---

## 11. Build packets for the coding agent

Each packet ends green on its own tests before the next starts. Suggested owners follow the current team split (backend: Harshit, Prashantha; frontend wiring: Omkar).

### P0 — Contract amendments + repo bootstrap (owner: backend lead)
- Write amendments A1–A12 into `docs/api-contract.md` (section "Amendments for backend v1").
- Create `backend/` skeleton (§4.2), `config.py` with every config key named in this plan, error envelope, id helper, `/health`.
- CI: ruff, mypy (strict on `modules/`), pytest.
- **Done when:** app boots, `/health` 200, lint/type checks pass, amendments merged.
- **Do not:** add any provider code.

### P1 — Schema + seed
- Migrations `0001_initial` (§8.1) and `0002_seed`.
- SQLAlchemy models; `modules/sheets` service with the full write path (§8.4) and unit tests for every rule in that table.
- **Done when:** migrations up/down clean on a fresh Postgres; sheet write-path tests pass.

### P2 — Jobs, SSE, credits, `/me`
- Job/item state machine, worker loop with SKIP LOCKED and leases, LISTEN/NOTIFY, persisted events, SSE replay, pause/resume/cancel, credit reserve/charge/release ledger, `/me`.
- Use a **fake executor** (deterministic, like the mock's `shouldFail`) to drive tests.
- **Done when:** ported mock tests for lifecycle, partial failure, all-failed, cancel (contract semantics, C7), idempotency and validation pass against the real API + worker; SSE reconnect with `Last-Event-ID` replays exactly the missed events; killing the worker mid-run and restarting completes the job without double-charging.

### P3 — Catalog
- Registry (§6) with statuses; `GET /enrichments/catalog` returns `live` items plus gated items whose gate flag is on.
- **Done when:** catalog test updated from 12 to the canonical count; excluded items never appear.

### P4a — Exa adapter + executors
- Typed client generated or hand-written from `exa-spec.yaml` for `/search` and `/contents` only. Error mapping (§8.8). `provider_calls` logging with `costDollars.total`.
- `scripts/record_provider_fixture.py` records real responses (keys from env) into `tests/fixtures/exa/`.
- Executors for all Exa catalog items (§7.2) with fixture-based unit tests: entity check, citation rule, outputSchema-limit test, formatting templates, `no_data` paths.
- Run gates G1, G2, G4 and record results in `docs/provider-gates.md`.
- **Done when:** every Exa executor has passing tests for succeeded / no_data / failed; gates documented.
- **Do not:** use legacy `type` values, `/research/v1`, or deprecated fields (`livecrawl`, `subpages` on `/search`, `includeText`).

### P4b — MoltSets adapter + executors (blocked on C17 CONFIRM and G3)
- Read `developer.moltsets.com`; write the typed client for `search_people`, `linkedin_to_business_email`, `search_business_email_by_name` only.
- Record fixtures; implement `find_decision_makers` (+ Leaders upsert) and `find_work_email`.
- **Done when:** fixture tests pass; a test proves no email is ever produced without a provider response; rate limiter uses the configured plan limit.

### P5 — Enrichment runs (Flow 2)
- `POST/GET /enrichments/runs`, cache (§8.6), refresh flag, Signals derivation (§8.7).
- **Done when:** Flow 2 acceptance (§9.2) passes with Exa fixtures and a live smoke test on 3 rows (manual, keys in env).

### P6 — Workspace (Flow 5)
- All Workspace endpoints in §10, export writer + download tokens, context endpoint.
- **Done when:** Flow 5 acceptance (§9.5) passes.

### P7 — Home & research (Flow 1)
- Projects endpoints, research parser, discover executor, optional chained enrichment, `POST /projects/:id/columns`.
- **Done when:** Flow 1 acceptance (§9.1) passes with Exa fixtures.

### P8 — Copilot (Flow 3)
- Conversations/messages, `IntentRouter` (table in §9.3) with one unit test per rule row, reply templates, token streaming, regenerate, feedback, results, exports, company context, Workspace conversation endpoints.
- **Done when:** Flow 3 acceptance (§9.3) passes; a test asserts every number in a reply equals a DB count.

### P9 — Radar preview (Flow 4)
- Extraction script + committed fixtures, six endpoints, signal actions.
- **Done when:** Flow 4 acceptance (§9.4) passes; every response has `preview: true`.

### P10 — Hardening
- Rate-limit tuning from `provider_calls`, MoltSets batching (≤100), Render service definitions (web + worker + Postgres), structured logs with `requestId`, a cost report per enrichment id (credits charged vs `costDollars`).
- **Done when:** a 200-row × 3-column run completes without manual intervention and the cost report renders.

---

## 12. Test strategy

1. **Contract tests (from the mock).** Port the 7 tests in `server/mock-api.test.mjs` to `tests/contract/` running against the FastAPI app + worker with the fake executor. Change only: catalog count (C16), cancel semantics (C7), `no_data` (C9).
2. **Executor tests** with recorded provider fixtures — never live calls in CI.
3. **Write-path tests** for every rule in §8.4.
4. **SSE tests:** ordered delivery, replay from `Last-Event-ID`, terminal-job behaviour.
5. **Honesty tests:** no `Guessed` status anywhere; `verified` values always have ≥1 source; Copilot reply numbers equal DB counts; Radar unknown question returns zero rows.
6. **Manual live smoke** per packet that touches a provider, on ≤3 rows, logged in `docs/provider-gates.md`.

---

## 13. Frontend touchpoints (for the wiring work, not part of the backend packets)

| UI code today | Replace with |
|---|---|
| `home/model.ts` `ENRICH`, `workspace/model.ts` `COL_TYPES`, `copilot/model.ts` enrich list | `GET /enrichments/catalog` |
| Source badges `cb/bw/zi/gh/li` | `source` + `sources[]` from cells |
| `workspace/model.ts` `startJob`, `runCell`, `quickCol`, `cancelJob`, `retryFailed` | `POST /workspace/sheets/:id/rows/run` + SSE `cell`/`progress`/`done`; `POST /jobs/:id/cancel` |
| Cell keys `col.id + '\|' + row.name` | `columnKey + '\|' + rowId` |
| `addPromptCol` (`'Company Description'`) | `POST /workspace/sheets/:id/columns` with `prompt` (→ `custom_prompt`) |
| "Clear results", column remove | A10, A9 |
| Run-cells dialog cost `rows × 2 × 10` | `estimatedOnly: true` response |
| `home/model.ts` `ask`/`askPlan` fake counts | `POST /projects` + job events + real counts |
| Home "Build an enrichment" (400 rows) | `POST /projects/:id/columns` after a project is chosen (C12) |
| Copilot `send` (toast only) | `POST /copilot/conversations[/:id/messages]` + SSE `token` |
| `primaryContact.status: 'Verified' \| 'Guessed'` | provenance badge; never "Guessed" |
| `intentScore`, `icpFit` rendering | handle `null` (show "—") |
| Radar constants | six Radar endpoints; keep "Preview — sample data" label |

---

## 14. Open questions (CONFIRM list)

| # | Question | Blocks |
|---|---|---|
| Q1 | Is the provider "Moldset" the MoltSets service at moltsets.com? (C17) | P4b |
| Q2 | Final credit prices for every catalog item (§6) and discovery price per company (§8.3) | Launch |
| Q3 | Are cache hits charged? Cache TTL per enrichment? (§8.6) | P5 |
| Q4 | `research_default_count` (suggested 25) and `run_max_rows` (suggested 500) | P5, P7 |
| Q5 | Hit-rate thresholds for gates G1, G2, G4 | P4a enablement |
| Q6 | `find_tech_stack` label "Technologies mentioned" acceptable, or remove the item? | P4a enablement |
| Q7 | Retire Copilot's 4 bundle prices in favour of catalog items? (C1) | P8 UI |
| Q8 | Home enrichment: add a project picker, or hide the drawer until then? (C12) | Frontend |
| Q9 | Idempotency key reused with a different body: return original (mock) or `409`? | P2 |
| Q10 | Should an LLM planner be added to Copilot later (and which provider)? Not in this plan. | Future |
| Q11 | Do `outmate_spec_v1.3.md` / `outmate_tech_v1.4.md` / `plan (6).md` exist in the workspace, and do they override any decision here? | P0 |
