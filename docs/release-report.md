# Release report — data-enrichment backend V1

Date: 2026-10-27 · Scope: **verification only** — no new features were added
in this phase; the only code change was a test-suite fix (see "Issues found").

## Phases completed

| Phase | Content | Status |
|---|---|---|
| P0 | scaffold, config, errors, ids, contract amendments A1–A12 | done |
| P1 | schema (alembic 0001), seed (0002), sheets module + boundary rule | done |
| P2 | jobs engine: state machine, queue (SKIP LOCKED + leases), SSE, `/me`, idempotency, request-id logging | done |
| P3 | canonical catalog (22 entries, typed registry, gate flags) | done |
| P4a.1–P4a.5 | Exa adapter (client/models/errors/schema-limits), all 17 Exa executors, synthetic fixtures, gate harness + docs | done |
| P4b | MoltSets adapter (`search_people`, `linkedin_to_business_email`, `search_business_email_by_name`), `find_decision_makers` + `find_work_email`, lazy Leaders sheet, Fair-Use gate, reservation-release fix, G3 recorded fixtures | done |
| P5 | `POST /enrichments/runs` + `GET /enrichments/runs/:runId`, eligibility/validation order, worker wiring, cache (off by default), Signals sheet | done |
| V1 | release verification (this report) | done |

## Verification counts (authoritative, this run)

- **pytest: 346 passed / 0 failed / 0 skipped** — contract 41 · integration 70 · unit 235.
- **ruff:** clean (`All checks passed`).
- **mypy `app/modules`:** clean — `Success: no issues found in 67 source files`.
- New V1 tests: `tests/contract/test_endpoint_inventory.py` (exact 9+health
  surface, params normalised `{}`), `tests/integration/test_honesty_rules.py`
  (E2E honesty + sheet-boundary re-run).

## Honesty invariants verified (test_honesty_rules)

Full E2E — rows seeded via `sheets.service` → 3 runs driven by the real
worker over fixture-backed Exa **and** MoltSets executors → run views → SSE
frames consumed per job:

- the literal `Guessed` appears in no API body, SSE frame, OpenAPI schema,
  catalog, or any `cells.value`;
- every `verified` cell has ≥ 1 `cell_sources` row;
- every `succeeded` cell has value + provenance (`provider_reported` /
  `verified` / `ai_inferred`) + provider source; every `no_data` cell has
  `value: null` and `cost: 0`;
- every email-shaped string in cells/leader rows is traceable to a provider
  fixture response (`ada.lovelace@example.com` only);
- catalog sources ⊆ `{exa, moltsets, user}`; `website_intent` and
  `add_to_hubspot` absent even with G3 on;
- SA-1/SA-2: `credit_ledger` rows = 0, `workspaces.credits_balance` = 5000
  unchanged, `chargedCredits` = Σ succeeded cell costs per run **and** per
  job, each succeeded cell cost = catalog cost, `estimatedCredits` ≥
  `chargedCredits`;
- H4: sentinel `EXA_API_KEY`/`MOLTSETS_API_KEY` values absent from logs,
  bodies, SSE, and all scanned DB columns; H5: `X-Request-Id` on every
  response including the SSE stream;
- §8.4 boundary re-run: only `app/modules/sheets` imports `sheets.models`.

## Issues found this phase (test-only; no product defect)

- **`test_wrong_applies_to_is_validation_error`** created a scratch
  `kind='leaders'` sheet with `project_id NULL`, permanently polluting the
  global leaders pool in the shared test DB — a second global sheet makes
  `get_or_create_leaders_sheet`'s `scalar_one_or_none()` raise
  `MultipleResultsFound`. Fixed by scoping the scratch sheet to a real
  project (`proj_applies_to_test`). **Not a product bug:** in app code the
  only leaders creator is the advisory-locked get-or-create, so the
  per-scope singleton holds in production. (Latent fragility worth noting
  for later hardening: no DB unique constraint enforces one leaders sheet
  per scope.)

## Gates (docs/provider-gates.md)

| Gate | Status | Effect |
|---|---|---|
| G1 (Exa entity resolution hit-rate) | **not run** — needs human CSV + Q5 threshold | no config flag; evidence only |
| G2 (LinkedIn coverage) | **not run** | `find_linkedin_highlights` gated off |
| G3 (MoltSets contract) | **PASS** — docs read, 3 real fixtures recorded, terms reviewed | `gate_g3_moltsets` still defaults `false`; human flips `GATE_G3_MOLTSETS=true` |
| G4 (careers coverage) | **not run** | `find_job_openings` gated off |

## Open questions — unresolved, with current defaults

| Id | Question | Default in force |
|---|---|---|
| Q2 | Final credit prices per catalog item + discovery price | plan §6 prices coded in the catalog |
| Q3 | Are cache hits charged? Cache TTL per enrichment? | cache **off** (`cache_ttl_seconds={}`) |
| Q4 | `research_default_count`, `run_max_rows` | `run_max_rows=20` (confirmed); `research_default_count=25` still suggested |
| Q5 | Hit-rate thresholds for G1/G2/G4 | unset → gated items stay off |
| Q6 | `find_tech_stack` label "Technologies mentioned …" | unconfirmed → item gated off |
| Q7 | Retire Copilot's 4 bundle prices for catalog items? | P8 concern — untouched |
| Q8 | Home enrichment: project picker vs hide drawer | frontend — untouched |
| Q9 | Same idempotency key, different body | return original + log warning (in use) |
| Q11 | Do other spec docs override the plan? | none found; plan is canonical |
| N4 | Leaders/Signals base columns | **answered** — Leaders: 9 contract fields + `linkedinUrl`; Signals: 8 contract Signal fields |
| N5 | Radar `{data, nextCursor, preview:true}` wrapper | P9 concern — untouched |

## Scope boundaries honoured

- API surface is **exactly** the 9 endpoints + `/health` (enforced by
  `test_endpoint_inventory`): `/me`, 5 job routes, catalog,
  `runs` POST/GET.
- **No credit ledger:** `credit_ledger` has zero rows;
  `workspaces.credits_balance` is never written; all cost fields are
  derived display values (SA-1/SA-2).

## Still OUT of scope (later packs)

Workspace routes, projects/research, Copilot, Radar, exports/downloads,
deployment, and **real credit charging** (reserve/charge/settle) — the
`credit_ledger` table exists but no code writes it.
