# Backend path registry

Paths are relative to the workspace root (`D:\production`). The frontend checkout lives
in `outmate-home/`; the API contract therefore resolves to `outmate-home/docs/api-contract.md`.

Status values: `planned` (not yet created) · `created` (exists, built in the listed phase) ·
`existing` (pre-dates the backend work; read-only where noted) · `renamed→<new path>`.

| Path | Purpose | Phase | Status |
|---|---|---|---|
| `docs/plan.md` | the plan | P0 | existing |
| `outmate-home/docs/api-contract.md` | API contract (+ amendments A1–A12 appended in P0) | P0 | existing |
| `docs/backend-paths.md` | this registry | P0 | created |
| `docs/provider-gates.md` | gates G1–G4 procedures and results + P5 live-smoke steps | P4a.5, P5 | created |
| `docs/release-report.md` | final report | V1 | planned |
| `outmate-home/server/mock-api.mjs`, `outmate-home/server/mock-api.test.mjs` | oracle (read-only) | all | existing |
| `outmate-home/src/pages/radar/model.ts` | Radar fixture source (read-only) | P9 | existing |
| `outmate-home/src/pages/workspace/components/table/gridUtils.ts` | edit rules reference (read-only) | P1 | existing |
| `.gitignore` | ignores `.env*` (and caches) at workspace root | P0 | created |
| `backend/pyproject.toml` | project metadata, pinned deps, tool config | P0 | created |
| `backend/alembic.ini`, `backend/alembic/env.py`, `backend/alembic/script.py.mako` | alembic scaffold | P1 | created |
| `backend/alembic/versions/0001_initial.py`, `0002_seed.py` | migrations (0001 all §8.1 tables; 0002 demo seed) | P1 | created |
| `backend/.env` | local secrets (gitignored): DATABASE_URL → dev/test Postgres | P1 | created |
| `backend/app/main.py` | FastAPI app, `/health`, router mounting, error handlers, request-id middleware (P2) | P0 | created |
| `backend/app/config.py` | pydantic-settings; all limits/costs/thresholds (P2: worker/lease/SSE defaults) | P0 | created |
| `backend/app/db.py` | engine + session factory + `Base` (P1); `get_session` dep + `psycopg_dsn` (P2) | P0 | created |
| `backend/app/ids.py` | prefixed opaque ids: prj_, sh_, col_, row_, enr_, job_, conv_, msg_ | P0 | created |
| `backend/app/errors.py` | ApiError → `{"error":{code,message,details}}` | P0 | created |
| `backend/app/auth.py` | stub dependency returning the seeded user/workspace | P0 | created |
| `backend/app/modules/__init__.py` | modules package marker (so `mypy app/modules` runs) | P0 | created |
| `backend/app/schemas/__init__.py`, `base.py` | `CamelModel` base DTO (camelCase aliases) | P0 | created |
| `backend/app/idempotency.py` | idempotency helper (store/replay over `idempotency_keys`) | P2 | created |
| `backend/app/logging.py` | structured logging + `X-Request-Id` middleware (pulled forward from P10 for H5) | P2 | created |
| `backend/app/api/__init__.py`, `me.py`, `jobs.py` | thin routes: `/me`, jobs GET/pause/resume/cancel/events | P2 | created |
| `backend/app/api/enrichments.py` | `GET /enrichments/catalog` (P3) + `POST /enrichments/runs`, `GET /enrichments/runs/:runId` (P5) | P3, P5 | created |
| `backend/app/api/` (`projects.py`, `workspace.py`, `copilot.py`, `radar.py`, `downloads.py`) | thin routes | P5–P9 | planned |
| `backend/app/schemas/catalog.py` | `CatalogItem` DTO (wire shape; hides registry internals) | P3 | created |
| `backend/app/schemas/enrichment.py` | run request/response + RunView/CellView DTOs | P5 | created |
| `backend/app/schemas/` (`workspace.py`, `projects.py`, `copilot.py`, `radar.py`) | DTOs | P6–P9 | planned |
| `backend/app/modules/core/models.py` | workspaces, users, idempotency_keys | P1 | created |
| `backend/app/modules/sheets/` (`models.py`, `service.py`, `normalize.py`) | the only sheet writer | P1 | created |
| `backend/app/modules/sheets/query.py` | sheet read helpers | P6 | planned |
| `backend/app/modules/jobs/models.py` | jobs, job_items, job_events | P1 | created |
| `backend/app/modules/jobs/` (`service.py`, `queue.py`, `events.py`, `sse.py`) | state machine, queue (SKIP LOCKED + leases/recovery), persisted events + NOTIFY, SSE replay/stream | P2 | created |
| `backend/app/modules/credits/models.py` | credit_ledger | P1 | created |
| `backend/app/modules/credits/service.py` | credit ledger ops — OUT OF SCOPE this release (SA-1/SA-2: no ledger) | P2 | deferred |
| `backend/app/modules/catalog/` (`__init__.py`, `registry.py`) | canonical catalog — typed registry, 22 entries, lazy executor refs | P3 | created |
| `backend/app/modules/enrichment/models.py` | enrichment_runs, enrichment_cache | P1 | created |
| `backend/app/modules/enrichment/executors/` (`__init__.py`, `base.py`) | Executor Protocol + ExecResult (incl. `signals: list[SignalDraft]`, PG-9) /RowSnapshot/ColumnConfig/ExecContext (§7.1) | P2, P4a.2 | created |
| `backend/app/modules/enrichment/executors/common.py` | shared executor rules: host check, usd format, missing_input, citation rule, error map, SyncExaClient | P4a.2 | created |
| `backend/app/modules/enrichment/executors/find_{company_domain,snapshot,revenue,funding}.py` | entity-based executors (§7.2) | P4a.2 | created |
| `backend/app/modules/enrichment/executors/find_{company_news,leadership_changes,social_profiles}.py` | third-party search + /contents executors (§7.2) | P4a.3 | created |
| `backend/app/modules/enrichment/executors/find_{core_values,free_trial,pricing,job_openings}.py` | domain-scoped verified executors (`includeDomains`, citations required) | P4a.4 | created |
| `backend/app/modules/enrichment/executors/find_{gtm_strategy,revenue_model,product_categories,competitors,tech_stack}.py`, `classify_b2b_b2c.py`, `custom_prompt.py` | deep-lite ai_inferred executors (uncited value kept, citations stored when present) | P4a.4 | created |
| `backend/app/modules/enrichment/executors/find_linkedin_highlights.py` | verified LinkedIn company-page highlights (G2) | P4a.4 | created |
| `backend/app/modules/enrichment/service.py` | run validation, creation, run_view/cell_view | P5 | created |
| `backend/app/modules/enrichment/cache.py` | §8.6 cache: TTL gate, key (domain, enrichment, prompt hash, executor version), race-safe upsert | P5 | created |
| `backend/app/modules/enrichment/signals.py` | §8.7 signal drafts → Signals sheet rows via sheets.service | P5 | created |
| `backend/app/modules/providers/exa/` (`__init__.py`, `client.py`, `models.py`, `errors.py`, `schema_limits.py`) | Exa adapter: /search + /contents only, retry/error mapping, local request validation, outputSchema limits | P4a.1 | created |
| `backend/app/modules/providers/moltsets/` (`__init__.py`, `client.py`, `models.py`, `errors.py`, `rate_limit.py`) | MoltSets adapter: 3 tools only, typed models, error map, `MoltSetsGate` rolling-window budget + concurrency slots | P4b | created |
| `backend/app/modules/enrichment/executors/find_decision_makers.py`, `find_work_email.py` | MoltSets executors (G3-gated) | P4b | created |
| `backend/app/modules/enrichment/leaders.py` | `LeaderDraft` → Leaders-sheet upsert via sheets.service | P4b | created |
| `backend/alembic/versions/0003_p4b_moltsets.py` | `job_items.available_at`, `provider_calls.tokens` + `.records_returned` | P4b | created |
| `backend/app/modules/providers/models.py` | `provider_calls` | P1 | created |
| `backend/app/modules/projects/models.py` | projects | P1 | created |
| `backend/app/modules/projects/service.py` | projects (PG-2) | P7 | planned |
| `backend/app/modules/research/` (`parser.py`, `discover.py`) | discovery | P7 | planned |
| `backend/app/modules/copilot/models.py` | conversations, messages | P1 | created |
| `backend/app/modules/copilot/` (`router.py`, `service.py`, `templates.py`) | Copilot | P8 | planned |
| `backend/app/modules/radar/models.py` | radar_signal_actions | P1 | created |
| `backend/app/modules/radar/` (`service.py`, `fixtures/*.json`) | Radar preview | P9 | planned |
| `backend/app/modules/exports/models.py` | download_tokens | P1 | created |
| `backend/app/modules/exports/service.py` | CSV/XLSX + tokens | P6 | planned |
| `backend/app/worker/` (`__init__.py`, `main.py`) | worker loop: promote → claim → execute → one-tx write/settle | P2 | created |
| `backend/scripts/record_provider_fixture.py` | record real provider responses → `tests/fixtures/exa/<id>/<case>.recorded.json` (env or .env key; `--gate` modes) | P4a.1, P4a.5 | created |
| `backend/scripts/run_provider_gate.py` | run a §5.3 gate over `tests/fixtures/gates/*.csv` — refuses under-sized samples, per-row fixtures + hit summary | P4a.5 | created |
| `backend/scripts/extract_radar_fixtures.mjs`, `cost_report.py` | scripts | P9, P10 | planned |
| `backend/tests/conftest.py` | shared fixtures (settings, client, client_with_test_routes) | P0 | created |
| `backend/tests/env_defaults.py` | dummy env vars for tests (imported first by conftest) | P0 | created |
| `backend/tests/support/db.py` | alembic_cfg() helper for migration tests | P1 | created |
| `backend/tests/support/test_routes.py` | test-only routes incl. PG-1 run stub | P0, P2 | deleted in P5 |
| `backend/tests/support/probe_routes.py` | error-envelope probe routes only (`__test/*`), mounted by `client_with_probe_routes` | P5 | created |
| `backend/tests/support/fake_executor.py` | deterministic fake executor + TEST_CATALOG + demo-company seeder | P2 | created |
| `backend/tests/unit/` (`test_health.py`, `test_errors.py`, `test_ids.py`, `test_camel_case.py`, `test_config.py`) | P0 unit tests | P0 | created |
| `backend/tests/unit/test_normalize.py`, `test_sheets_boundary.py` | P1: normalize + write-boundary enforcement | P1 | created |
| `backend/tests/contract/test_contract_amendments_doc.py` | asserts A1–A12 in the contract doc | P0 | created |
| `backend/tests/integration/` (`conftest.py`, `test_migrations.py`, `test_sheets_write_path.py`) | P1: migrations up/down + sheet write-path rules | P1 | created |
| `backend/tests/contract/test_job_lifecycle.py` | P2: ported mock tests 2–7 with SA-5 rewrites + H4 secret hygiene | P2 | created |
| `backend/tests/contract/test_catalog.py` | P3: canonical catalog — counts, gate scoping, costs table, exclusions | P3 | created |
| `backend/tests/unit/` (`test_cost_fields.py`, `test_job_state_machine.py`, `test_idempotency.py`) | P2: cost fields (incl. credit_ledger==0, balance unchanged), state machine, idempotent replay | P2 | created |
| `backend/tests/integration/` (`test_sse.py`, `test_worker_recovery.py`) | P2: SSE snapshot/replay/heartbeat; lease recovery, pause, SKIP LOCKED | P2 | created |
| `backend/tests/integration/test_enrichment_runs.py` | P5: validation matrix (all error codes), eligibility, estimates/SA-2 cost semantics, run view, idempotent replay, provider-error cascade | P5 | created |
| `backend/tests/integration/test_cache.py` | P5: TTL-off/ON behaviour, refresh bypass, prompt/executor-version miss | P5 | created |
| `backend/tests/integration/test_signals.py` | P5: News/Funding signal rows, no_data → none, dedupe, `company_row_id` link | P5 | created |
| `backend/tests/unit/` (`test_exa_client.py`, `test_exa_schema_limits.py`) | P4a.1: client validation/retry/errors/H4 + outputSchema limits (MockTransport) | P4a.1 | created |
| `backend/tests/unit/executors/test_entity_executors.py` | P4a.2: 4 entity executors — template/citation/signal paths via synthetic fixtures | P4a.2 | created |
| `backend/tests/unit/executors/test_news_leadership_social.py` | P4a.3: news/leadership/social executors — mention filter, per-change citations, extras.links filter | P4a.3 | created |
| `backend/tests/unit/executors/test_domain_ai_executors.py` | P4a.4: domain-scoped + ai_inferred executors — includeDomains/citation rules, enum gating, caps, prompt-hash cache key | P4a.4 | created |
| `backend/tests/fixtures/exa/<enrichment_id>/*.synthetic.json` | synthetic Exa response fixtures, one dir per executor id | P4a.2 | created |
| `backend/tests/fixtures/moltsets/<tool>/*.synthetic.json` + `*.recorded.json` | MoltSets fixtures per tool (search_people, linkedin_to_business_email, search_business_email_by_name); recorded = real G3 evidence | P4b | created |
| `backend/tests/unit/test_moltsets_client.py`, `test_moltsets_rate_limit.py`, `tests/unit/executors/test_moltsets_executors.py`, `tests/integration/test_moltsets_gate.py` | P4b tests (client/H4, gate, executors incl. no-guessed-email property, G3 flag scoping) | P4b | created |
| `backend/tests/fixtures/gates/{g1_domains,g2_companies,g4_domains}.csv` | §5.3 gate sample lists — header + fill-in comment only, human supplies real lists | P4a.5 | created |
| `backend/tests/fixtures/exa/exploratory/` | real responses from plumbing verification — agent-picked demo companies, NOT gate evidence | P4a.5 | created |
| `backend/tests/fixtures/` | provider fixtures | P4a+ | planned |
| Render service definitions | deployment | P10 | planned |
| CI configuration | lint, types, tests — provider unknown (N1) | P0 | planned |

## Phase notes

### P2 — jobs engine, SSE, /me

- **Additive contract field:** `JobView.summary` is `{succeeded, failed, noData}` —
  the mock's `{succeeded, failed}` plus `noData` (count of items that ended
  `no_data`). Additive only; the mock's two keys keep their meaning.
- **SA-2 cost semantics:** `cell.cost` = catalog cost iff `succeeded`, else 0
  (no_data / failed / cancelled all cost 0). `jobs.charged_credits` and
  `enrichment_runs.charged_credits` are derived informational counters
  incremented in the same transaction as the cell write. `estimated_credits`
  is fixed at creation. No `credit_ledger` reads/writes anywhere;
  `workspaces.credits_balance` is never touched by job code.
- **`GET /jobs/:id/events`:** `text/event-stream`; first frame is always a
  synthesized `progress` snapshot (no `id:`), then persisted events replayed
  by `seq` honouring `Last-Event-ID` / `?lastEventId=`; `id:` = `seq`.
  Terminal jobs emit snapshot + `done` and close. Live wakeup via
  `LISTEN job_events`. Heartbeat comment `: ping`.
- **PG-1 test-only route:** `tests/support/test_routes.py` mounts
  `POST/GET /enrichments/runs` via `client_with_test_routes` only — never
  registered in `app.main`. P5 replaces it; contract tests rerun unchanged.
- **Boundary rule enforced:** jobs module + worker reach sheets tables only
  through `sheets.service` (no `sheets.models` imports; Protocol shapes for
  typing) — `test_sheets_boundary` still green.

### P3 — canonical catalog

- **Gate flags** (config, all default `false`; gated items hidden until on):
  `gate_g2_linkedin` → `find_linkedin_highlights`;
  `gate_g3_moltsets` → `find_decision_makers` + `find_work_email`;
  `gate_g4_job_openings` → `find_job_openings`;
  `gate_tech_stack_label` → `find_tech_stack` (Q6 label CONFIRM pending).
- **`requires_inputs` derivation (engineering reading of §7.2):** domain-
  restricted entity/outputSchema executors → `["domain"]`; third-party name
  searches (`find_company_news`, `find_leadership_changes`,
  `find_linkedin_highlights`) → `["name"]`; the deep-lite
  `Company: <name> (<domain>)` template + `find_tech_stack` →
  `["name","domain"]`; `find_company_domain` → `["name"]`;
  `find_decision_makers` → `["domain"]`; `find_work_email` lists the union
  `["linkedinUrl","name","domain"]` (either linkedinUrl **or** name+domain
  satisfies it — OR semantics can't be expressed in the flat list);
  `plain_value` → `[]`. Prompt requirements are column-level, not row inputs.
- Names: mock CATALOG names kept for the 12 shared ids; plan §6 labels for
  the rest. Descriptions: mock text for the 12; `COL_TYPES` text for
  workspace-only items; `custom_prompt` has no COL_TYPES row — plain
  description written from §7.2.
- `resolve_executor()` is a lazy lookup: executors land in P4a/P4b; until
  then it raises `LookupError` and nothing imports them.

### P4a.1 — Exa client

- Client defaults (engineering, not in plan): `timeout 30s`,
  `max_attempts 3`, backoff base `0.5s` + jitter capped at `30s`.
- HTTP **500 treated like 503** (retryable) — plan §8.8 lists 500 as an Exa
  error but omits it from the retry table; flagged.
- `schema_limits` hop rule is conservative: `properties → items →
  properties` counts 3 hops and is REJECTED — the §7.2
  `find_leadership_changes` array-of-objects schema would need restructuring
  (e.g. parallel string arrays) or gate evidence before P4a.2 uses it.
- `record` callback emits one `ProviderCallRecord` per attempt; the caller
  owns writing the `provider_calls` row (job_id/row_id context). Per-call
  `record=` on `search`/`contents` overrides the constructor sink.

### P4a.2 — entity executors (PG-9)

- `ExecResult.signals: list[SignalDraft]` added (§8.7 signal drafts:
  `{type, detail, source_host, detected_at, confidence_label}`). Only
  `find_funding` step 2 emits them (`type="Funding"`); `find_company_news`
  (`"News"`) arrives in P4a.3. All other executors return `[]`.
- Executors take a SYNC client (`common.SyncExaClient` wraps async
  `ExaClient` via `asyncio.run`; worker thread has no event loop).
  `resolve_executor()` returns the executor CLASS — the worker constructs
  it with the client.
- Engineering choices not in the plan: entity-search query = row name
  (fallback domain); `find_company_domain` reads `loc` then `city` for the
  query; funding step-2 value template
  `"{roundName} — {amount} led by {investor} ({date})"` (dropping missing
  parts); `format_usd_short` rule: ≥1M → 1-decimal `M` (`.0` dropped),
  ≥1K → rounded `K`, else plain `$`.

### P4a.3 — news, leadership and social executors

- **`schema_limits` hop rule corrected to match provider docs.** P4a.1's
  conservative reading counted array `items` as a nesting hop
  (`properties → items → properties` = 3 hops, rejected). Exa's documented
  rule is "≤2 levels of nested OBJECTS below the root" — its own example
  `companies → items → {name, round, amount}` is exactly the rejected shape
  (exa.ai/docs/search/deep-search, checked 27 Oct 2026). `items` no longer
  counts as a hop; the §7.2 leadership array-of-objects schema validates
  unchanged. An object inside an array item (3 hops) is still rejected.
  Grounding fields use `changes[<i>].<prop>` bracket notation (same doc).
- **`SearchResult.extras` added** to the Exa response model
  (`results[].extras.links: string[]`, etc. — per exa-spec.yaml
  `ContentsResult.extras`); consumed by `find_social_profiles`.
- **News keep-rule** is mention-based, not the host check: keep a result
  when the normalized company name ("Acme, Inc." → "acme") or the domain
  appears in title+highlights via a word-boundary match (so "Tacme" does
  not keep a result for "Acme"). Value = newest kept item by
  `publishedDate`; emits one `SignalDraft(type="News")` with
  `source_host` = cited URL host, `detected_at` = `publishedDate` (§8.7).
- **Leadership**: per-change citation gate — a change is kept only when
  `output.grounding` cites `changes[<i>]` (a bare `changes` field grounds
  all items); uncited changes are dropped, none kept → `no_data`. Value
  template `"{verb} {role}: {person} ({date})"` joined by `"; "`; verb is
  `New` for hire and `Departed` for departure (the plan only templates the
  hire form — engineering mirror).
- **Social**: `POST /contents` for `https://{domain}` with
  `extras.links: 100` — no model. Links are kept when host matches a
  `social_link_filters` entry (`www.` stripped); the
  `linkedin.com/company` entry matches host + path prefix (personal
  `/in/…` profiles excluded). Value = kept URLs, page order, deduplicated;
  source = the homepage URL.
- **`requires_inputs` corrected** for `find_company_news` and
  `find_leadership_changes` in the catalog registry: `["name","domain"]`
  (was `["name"]`) — the executors require domain per the P4a.3 prompt
  pack (missing → `failed/missing_input`, zero provider calls), so the
  estimate endpoint must not mark domain-less rows eligible.

### P4a.4 — domain-scoped and AI-inferred executors

- **Shared helpers in `common.py`**: `column_query(column)` (column.prompt →
  catalog description → label), `cited_sources(grounding, domain=None)`
  (dedup citations; with `domain` applies the entity host check),
  `output_schema_search(...)` (one place for systemPrompt +
  workspace `userIdentifier` + request + `record`), `prompt_hash(prompt,
  params)` (canonical-JSON SHA-256 — P5 folds it into the cache key), and
  `company_suffix(name, domain)` → `"Company: <name> (<domain>)"`.
- **Verified domain-scoped** (`find_core_values`, `find_free_trial`,
  `find_pricing`, `find_job_openings`): `/search` with
  `includeDomains:[domain]`, `type:auto`, `numResults:5`; a value is kept
  only when at least one citation survives the entity host check —
  off-domain or uncited values → `no_data` (verified rule). Value
  templates: core values `", ".join(values)`; free trial `"Free trial
  available (14 days)"` when a `trialLength` is given, `"No free trial
  found"` only when the `false` is cited; pricing `"{startingPrice} ·
  {pricingModel}"` (either side optional), `"Pricing not published"` when
  the `false` is cited; jobs `"{n} open roles; GTM: {roles}"`.
- **AI-inferred** (`find_gtm_strategy`, `find_revenue_model`,
  `find_product_categories`, `classify_b2b_b2c`, `find_competitors`,
  `find_tech_stack`, `custom_prompt`): `type:"deep-lite"`; the value is
  kept even with zero citations (that is the point of `ai_inferred`);
  citations present in grounding are stored as sources. Provenance is
  ALWAYS `ai_inferred`. Query = `column_query` (prompt or catalog
  description) + `". Company: <name> (<domain>)"` — for `custom_prompt`
  the user prompt is required (`missing_input` otherwise) and hashed
  into the cache key via `prompt_hash`.
- **`classify_b2b_b2c`** accepts only `"B2B"|"B2C"|"Both"` — any other
  string → `no_data`. **`find_competitors`** caps the parsed list at 3.
  **`find_tech_stack`** uses `/search` with query `"<name> technology
  stack tools integrations"` — meaning is "mentioned in public sources",
  not installed-script detection.
- **`find_linkedin_highlights`** (G2): `/search`
  `includeDomains:["linkedin.com"]`, query `"<name> company page"`,
  `contents.highlights:true`, `numResults:3`; keeps the FIRST result
  whose URL matches `linkedin.com/company/…`, value = up to 3 highlights
  joined by `" "`, source = that URL, `verified`.
- **Q6 NOT confirmed — catalog label unchanged.** The tech-stack UI
  label still reads "Identify technologies the company uses" (P3 text).
  The prompt-pack wording "mentioned in public sources" must only be
  written into the catalog description after the human confirms Q6;
  until then the catalog description stays as-is — PENDING.
- **Value-shape engineering choices not in the plan**: pricing joins
  details with `" · "` (frontend render hints use the same separator);
  linkedin highlights join with `" "` (already sentence-shaped); free
  trial appends `"({trialLength})"` verbatim when non-empty.

### P4a.5 — provider gates documentation

- **`docs/provider-gates.md` created** — per-gate (G1/G2/G4) test spec
  verbatim from §5.3, the exact request shape, runner commands, results
  tables with blank Q5 threshold cells, and the config flag each gate
  flips. **All three gates marked "not run"; nothing is marked PASS.**
  Includes the "Live smoke test for P5" section and an "Exploratory
  runs — NOT gate evidence" section (see below).
- **Sample lists live in `tests/fixtures/gates/*.csv`** (templates:
  header + a fill-in comment line only). `scripts/run_provider_gate.py
  <gate>` reads the CSV, **refuses to run under the required row count**
  (30/20/20), makes one live call per row through `_gate_request`,
  writes a `.recorded.json` per row, and prints hits + csv sha256 for
  the results table — so a recorded result is tied to an exact sample
  file.
- **`scripts/record_provider_fixture.py --gate {g1,g2,g4}`** reproduces
  the executor's exact request: g1 = `category:company` +
  `includeDomains` + `numResults:3` (matches `ENTITY_SEARCH_KWARGS`);
  g2 = linkedin.com/company-page query + `contents.highlights` (needs
  `--name`); g4 = `"careers open positions"` + `JOB_OPENINGS_SCHEMA` +
  canonical `systemPrompt` (schema single-sourced). Both scripts
  `load_dotenv()` so `backend/.env` works without an export step.
- **One live Exa call was made in P4a** (key provisioning check):
  `POST /search`, g1 shape, `notion.so`, 1 call, requestId
  480377338ee4ea3638dd8dfc8de38477 — fixture kept under
  `tests/fixtures/exa/exploratory/` and logged as exploratory, not gate
  evidence.
- **G1 has no config flag** — the three "LIVE (G1)" catalog entries ship
  `status: live`; a G1 failure is a launch-blocker decision for the
  human, documented as such (no `gate_g1_*` invented).

### P5 — enrichment runs (Flow 2)

- **`POST /api/v1/enrichments/runs` → 202** `{runId, jobId,
  estimatedCredits, status:"queued"}`; **`GET
  /api/v1/enrichments/runs/:runId`** returns run + every cell
  (column-major cells, then request row order), 404 `not_found` for
  unknown/other-workspace runs. `Idempotency-Key` replays return the
  same runId/jobId (byte-equal body) or the standard mismatch error.
- **Validation order** (all 422 unless noted): `unknown_row_ids`
  (details.unknown) → `duplicate_column_key` → `unknown_enrichment`
  (unknown OR gated-off) → `not_runnable` (`plain_value`) →
  `validation_error` (empty rowIds, empty columns, >`run_max_rows` rows,
  `appliesTo` mismatch, existing key with a different `enrichmentId`,
  zero eligible cells). `insufficient_credits` can never be raised.
- **Eligibility** (`sheets.queue_cells_for_run`, one `INSERT … ON
  CONFLICT DO UPDATE`): cells already `pending`/`running` are skipped;
  `user_edited` cells are skipped unless `overwriteEdited`. Returns the
  queued pairs; `create_cell_job(pairs=…)` makes one `cell` item per
  pair so `estimatedCredits` covers eligible cells only (D1/D2).
- **Worker wiring**: `build_executor_map` resolves each visible catalog
  entry to an executor instance via `registry.resolve_executor` (returns
  the executor CLASS — annotation corrected to `Callable[…, Executor]`).
  Missing executor → `executor_missing` cell failure; uncaught executor
  exception → `internal_error`; `ExaError` escaping the executor's own
  mapping → `common.exa_error_result`. `provider_out_of_credits` /
  `provider_auth` results cascade at completion: remaining pending items
  cancelled, job forced `failed` with the provider error (§8.8).
- **Cache (§8.6)** `enrichment/cache.py`: `cache_ttl_seconds:
  dict[str,int]` in Settings — **empty mapping (default) = fully off**
  (PG-8: no reads, no writes). Key = `(normalized_domain,
  enrichment_id, prompt_hash, executor_version)`; `prompt_hash` reuses
  `common.prompt_hash` (canonical-JSON SHA-256). Stores only
  `succeeded` results; upsert race-safe via `ON CONFLICT`. Cache hits
  write no `provider_calls` rows but the cell still charges catalog
  cost; `refresh:true` skips reads (writes still allowed).
- **`EXECUTOR_VERSION = "1"`** added to all 19 executor classes
  (`FakeExecutor` uses `"fake-1"`).
- **Signals (§8.7, N4 answered)** — `enrichment/signals.py`: only
  `succeeded` results with drafts emit rows. The `kind="signals"` sheet
  is created lazily by `sheets.get_or_create_signals_sheet` (advisory
  tx lock per project) with the **8 contract Signal fields as base
  columns** — `companyName`, `type`, `detail`, `source`, `detectedAt`,
  `confidence`, `freshness`, `relevance` (last two always null until a
  scorer exists). Rows link to the company row via
  `Row.company_row_id`; dedupe key = `(company row, type, source,
  detail)` so reruns never duplicate (D4).
- **PG-4 RESOLVED**: Signals sheet creation was unspecified — it is
  created lazily through the sheets service (never another writer), and
  N4's answer fixed the base columns above. No separate Leaders sheet
  was created — the prompt pack's Leaders mention is covered by the
  signals sheet design (per-project, `kind="signals"`).
- **`tests/support/test_routes.py` deleted**; replaced by
  `probe_routes.py` (`__test/*` error-envelope probes only, mounted via
  `client_with_probe_routes`). All P2 test files repointed at the real
  route — **zero assertion changes** in contract tests a–f.
- **Engineering defaults, not in plan:** `executor_version` default
  `"0"` when an executor class lacks the attribute; run payload
  `refresh`/`overwriteEdited`/`runId`/`enrichmentId` carried on
  `job_items.payload`; queue upsert also stamps `cells.last_run_id`
  and clears `user_edited`/`error` when overwrite wins.

### P4b — MoltSets adapter + executors

- **Preconditions:** Q1 confirmed (provider = MoltSets, moltsets.com —
  human-supplied `moltsets-openapi.json` + developer.moltsets.com live
  docs). N4 answered (human): Leaders base columns = contract Leader
  fields + `linkedinUrl` — `name, title, companyName, linkedinUrl,
  email, status, persona, seniority, lastActiveAt` — correcting the P5
  note that said no Leaders sheet exists; `get_or_create_leaders_sheet`
  now creates it lazily (advisory tx lock per project, same pattern as
  Signals). G3: docs read + real responses recorded + terms reviewed →
  **PASS**, recorded in docs/provider-gates.md; the `gate_g3_moltsets`
  config flag still defaults `false` (human flips it via env).
- **Rate-limit design deviates from the pack's "async token bucket per
  minute" — per the human, because the docs supersede:** MoltSets has
  NO requests/minute; limits are rolling 5-h/1-week Fair Use windows
  (requests AND records, per account, split SEARCH vs ENRICH pools)
  plus a per-account concurrent-search cap. `rate_limit.py` therefore
  implements `MoltSetsGate`: usage read from `provider_calls` (durable,
  shared across workers), claim-time reservation rows (status_code NULL,
  worst-case `records_returned`), in-claim recheck under a
  `moltsets:budget` advisory lock, tick-level `gate_status` exclusion so
  Exa items keep flowing, and `pg_try_advisory_lock` concurrency slots.
  Budgets come from `moltsets_*` settings — never hard-coded (defaults
  = the $27/month tier numbers; `moltsets_budget_fraction` holds
  headroom for other users of the same account).
- **Migration 0003:** `job_items.available_at` (provider-side deferral —
  a 429 after client retries, or no free slot, returns the item to
  `pending` with `available_at`; it is NOT a cell failure and consumes
  no attempt) + `provider_calls.tokens` (`metadata.tokens_used`) +
  `provider_calls.records_returned` (Fair Use records — the gate's
  accounting source; a reservation holds the worst case until
  `complete_item` replaces it with the real attempt rows).
- **Client** (`client.py`): Bearer `ms_…` + required `User-Agent`
  (missing → 403). Only documented request fields are sent; `limit`
  capped at 25. 200 `status:"not_found"` is a normal response, not an
  error. Retries: 429 (all four provider codes) + 500 + transport —
  exponential backoff honouring `Retry-After`/`metadata.retry_after`;
  after `max_attempts`, still-429 raises `MoltSetsRateLimited` (worker
  defers), 5xx/timeout raises `MoltSetsUnavailable`
  (`provider_unavailable` cell). Every other 4xx is a typed
  `MoltSetsError` carrying the provider's `error.code` verbatim — no
  retry. The API key is never logged or serialized (H4 test).
- **Reservation lifecycle:** `reserve_in_claim` opens the hold;
  `complete_item` swaps it for real attempt rows; deferred items
  (429/slot) keep it across `return_item_to_pending` so the retry is
  guaranteed to fit; `_cancel_pending_items_locked` and
  `fail_item_final` now RELEASE it via
  `jobs.service._release_moltsets_reservation` — a cancel or
  lease-exhausted fail no longer leaks worst-case usage into the window.
  Known gap: 429 retry *attempts* before a deferral are not persisted to
  `provider_calls` (the executor re-raises `MoltSetsRateLimited`
  without its record list); the open hold still covers the accounting.
- **Executors:** `find_decision_makers` sends
  `company_domain:[domain]`, seniority default exactly
  `["C Suite","VP","Head","Director","Owner"]`, optional
  `department`/`title`/`offset` from column params, `limit` default 10
  capped 25. Value = `[{name,title,linkedinUrl,seniority}]` (UI derives
  `"{first} + {n-1} more"`); provenance `provider_reported`; each person
  becomes a `LeaderDraft` upserted in the completion tx (D4 dedupe:
  LinkedIn URL else normalized name + company row; a provider-returned
  `business_email` is stored on the leader row, never constructed).
  `find_work_email` routes `linkedinUrl → linkedin_to_business_email`,
  else `name + companyDomain → search_business_email_by_name`, else
  `failed/missing_input` with ZERO provider calls; found → email
  `provider_reported`; miss → `no_data` value null cost 0; provider
  error → `failed` with the provider's code (`plan_restricted` etc.).
- **Engineering defaults, not in plan:** client timeout 30 s,
  `max_attempts` 3, backoff base 0.5 s cap 30 s; `slot_backoff_s` 2.0 s;
  `moltsets_max_concurrent` default 3.
