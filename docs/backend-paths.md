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
| `docs/provider-gates.md` | gates G1–G4 procedures and results | P4a | planned |
| `docs/release-report.md` | final report | V1 | planned |
| `outmate-home/server/mock-api.mjs`, `outmate-home/server/mock-api.test.mjs` | oracle (read-only) | all | existing |
| `outmate-home/src/pages/radar/model.ts` | Radar fixture source (read-only) | P9 | existing |
| `outmate-home/src/pages/workspace/components/table/gridUtils.ts` | edit rules reference (read-only) | P1 | existing |
| `.gitignore` | ignores `.env*` (and caches) at workspace root | P0 | created |
| `backend/pyproject.toml` | project metadata, pinned deps, tool config | P0 | created |
| `backend/alembic.ini`, `backend/alembic/env.py`, `backend/alembic/script.py.mako` | alembic scaffold | P1 | created |
| `backend/alembic/versions/0001_initial.py`, `0002_seed.py` | migrations (0001 all §8.1 tables; 0002 demo seed) | P1 | created |
| `backend/.env` | local secrets (gitignored): DATABASE_URL → dev/test Postgres | P1 | created |
| `backend/app/main.py` | FastAPI app, `/health`, router mounting, error handlers | P0 | created |
| `backend/app/config.py` | pydantic-settings; all limits/costs/thresholds | P0 | created |
| `backend/app/db.py` | engine + session factory + `Base` (P1) | P0 | created |
| `backend/app/ids.py` | prefixed opaque ids: prj_, sh_, col_, row_, enr_, job_, conv_, msg_ | P0 | created |
| `backend/app/errors.py` | ApiError → `{"error":{code,message,details}}` | P0 | created |
| `backend/app/auth.py` | stub dependency returning the seeded user/workspace | P0 | created |
| `backend/app/modules/__init__.py` | modules package marker (so `mypy app/modules` runs) | P0 | created |
| `backend/app/schemas/__init__.py`, `base.py` | `CamelModel` base DTO (camelCase aliases) | P0 | created |
| `backend/app/idempotency.py` | idempotency helper | P2 | planned |
| `backend/app/logging.py` | structured logging | P10 | planned |
| `backend/app/api/me.py`, `jobs.py`, `enrichments.py`, `projects.py`, `workspace.py`, `copilot.py`, `radar.py`, `downloads.py` | thin routes | P2–P9 | planned |
| `backend/app/schemas/` (`catalog.py`, `enrichment.py`, `workspace.py`, `projects.py`, `copilot.py`, `radar.py`) | DTOs | P3–P9 | planned |
| `backend/app/modules/core/models.py` | workspaces, users, idempotency_keys | P1 | created |
| `backend/app/modules/sheets/` (`models.py`, `service.py`, `normalize.py`) | the only sheet writer | P1 | created |
| `backend/app/modules/sheets/query.py` | sheet read helpers | P6 | planned |
| `backend/app/modules/jobs/models.py` | jobs, job_items, job_events | P1 | created |
| `backend/app/modules/jobs/` (`service.py`, `queue.py`, `events.py`, `sse.py`) | queue, events, SSE | P2 | planned |
| `backend/app/modules/credits/models.py` | credit_ledger | P1 | created |
| `backend/app/modules/credits/service.py` | credit ledger ops | P2 | planned |
| `backend/app/modules/catalog/registry.py` | canonical catalog | P3 | planned |
| `backend/app/modules/enrichment/models.py` | enrichment_runs, enrichment_cache | P1 | created |
| `backend/app/modules/enrichment/` (`service.py`, `cache.py`, `signals.py`, `executors/…`) | runs and executors | P4a–P5 | planned |
| `backend/app/modules/providers/exa/` (`client.py`, `models.py`, `errors.py`, `schema_limits.py`) | Exa adapter | P4a | planned |
| `backend/app/modules/providers/moltsets/` (`client.py`, `models.py`, `errors.py`, `rate_limit.py`) | MoltSets adapter | P4b | planned |
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
| `backend/app/worker/main.py` | worker loop | P2 | planned |
| `backend/scripts/extract_radar_fixtures.mjs`, `record_provider_fixture.py`, `cost_report.py` | scripts | P9, P4a, P10 | planned |
| `backend/tests/conftest.py` | shared fixtures (settings, client, client_with_test_routes) | P0 | created |
| `backend/tests/env_defaults.py` | dummy env vars for tests (imported first by conftest) | P0 | created |
| `backend/tests/support/test_routes.py` | test-only routes (ApiError raise, validated body) | P0 | created |
| `backend/tests/support/fake_executor.py` | deterministic fake executor for job tests | P2 | planned |
| `backend/tests/unit/` (`test_health.py`, `test_errors.py`, `test_ids.py`, `test_camel_case.py`, `test_config.py`) | P0 unit tests | P0 | created |
| `backend/tests/unit/test_normalize.py`, `test_sheets_boundary.py` | P1: normalize + write-boundary enforcement | P1 | created |
| `backend/tests/contract/test_contract_amendments_doc.py` | asserts A1–A12 in the contract doc | P0 | created |
| `backend/tests/integration/` (`conftest.py`, `test_migrations.py`, `test_sheets_write_path.py`) | P1: migrations up/down + sheet write-path rules | P1 | created |
| `backend/tests/fixtures/` | provider fixtures | P4a+ | planned |
| Render service definitions | deployment | P10 | planned |
| CI configuration | lint, types, tests — provider unknown (N1) | P0 | planned |
