# Outmate API contract (proposed)

**Status:** the frontend in this repo has **no API layer**. There is no `fetch`, axios, WebSocket, or `/api` call anywhere in `src/`. Every screen renders in-memory constants from `src/pages/*/model.ts`. This document is therefore a **proposed contract derived from what the UI renders**, not a description of existing endpoints.

Assumptions: REST + JSON, JWT bearer auth, cursor pagination, SSE for streaming. Paths are relative to `/api/v1`. If the backend prefers GraphQL/tRPC, the resources below map 1:1.

---

## Conventions

- `Authorization: Bearer <jwt>` on every request.
- `Content-Type: application/json` unless noted (import accepts multipart).
- IDs are opaque strings (`prj_…`, `cmp_…`, `job_…`). Never integers.
- Timestamps are ISO-8601 UTC (`2026-10-21T14:03:00Z`). The UI formats relative time itself.
- Credits are integer amounts, never floats.
- Lists: `?limit=50&cursor=<opaque>` → `{ "data": [...], "nextCursor": null | "…" }`.
- Create/start endpoints that spend credits or do work must accept `Idempotency-Key`.
- Mutations return the updated resource (or a job envelope), not `204`.

### Error shape

```json
{
  "error": {
    "code": "insufficient_credits",
    "message": "This run needs 7,900 credits; 120 remaining.",
    "details": { "required": 7900, "remaining": 120 }
  }
}
```

`400` malformed · `401` unauthenticated · `403` forbidden · `404` missing · `409` conflict · `422` validation · `429` rate limited (send `Retry-After`) · `500`.

---

## Shared resources

| Method | Path | Used by |
| --- | --- | --- |
| `GET` | `/me` | user avatar, name, initials |
| `GET` | `/workspaces/:workspaceId` | plan name, credits remaining/used, connected sources |
| `GET` | `/workspaces/:workspaceId/navigation` | Home sidebar: nav groups, recents, resources, saved lists |
| `GET` | `/notifications?unread=true` | bell popover on all pages |
| `PATCH` | `/notifications/:id` | `{ "read": true }` |
| `POST` | `/notifications/read-all` | mark-all |
| `GET` | `/search?q=` | Home top bar search |
| `GET` | `/credits` | balance, used, top-up packs, per-action rates |
| `POST` | `/credits/purchases` | `{ "packId": "pack_5000" }` → `{ "checkoutUrl": "…" }` |
| `GET` | `/integrations` | Connected / Not connected chips, Integrations page |
| `POST` | `/integrations/:provider/connect` | OAuth start → `{ "redirectUrl": "…" }` |
| `DELETE` | `/integrations/:provider` | disconnect |
| `GET` | `/pages/:slug` | Skills, API keys, Usage, Integrations content |

`GET /pages/:slug` returns the generic page shell used on Home:

```json
{
  "slug": "integrations",
  "title": "Integrations",
  "blurb": "Connect your CRM and communication tools…",
  "actionLabel": "Request an integration",
  "cards": [{ "name": "HubSpot", "description": "CRM — sync companies and contacts", "status": "connected" }],
  "table": null
}
```

`table` (nullable) supplies columns/rows for pages that render a table; `cards` supplies card grids.

### Jobs and streaming

Long-running work (research, chat, enrichment, cell runs, imports) returns a job.

```json
{ "jobId": "job_…", "status": "queued", "estimatedCredits": 30 }
```

`GET /jobs/:jobId` →

```json
{
  "id": "job_…",
  "type": "research | chat | enrichment | run_cells | import",
  "status": "queued | running | succeeded | failed | cancelled",
  "progress": { "done": 120, "total": 400, "unit": "cells" },
  "steps": [{ "label": "Website enrichment", "status": "done", "meta": "118 completed" }],
  "estimatedCredits": 30,
  "chargedCredits": 30,
  "result": {},
  "error": null
}
```

- `GET /jobs/:jobId/events` — `text/event-stream`, events: `progress`, `step`, `token` (chat only), `done`, `error`. Reconnect with `Last-Event-ID`.
- `POST /jobs/:jobId/pause`, `POST /jobs/:jobId/resume`, `POST /jobs/:jobId/cancel`.
- Credits are reserved at start and charged on success; cancellation charges completed work only (`chargedCredits` reports it).

---

## Data enrichment (build this first)

The 12 enrichment types in the UI are **catalog rows, not endpoints**. Home's "Build an enrichment", Workspace's "Add column" + "Run cells", and Copilot's enrich menu all call the same run endpoint.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/enrichments/catalog` | id, name, description, cost, output type, source |
| `POST` | `/enrichments/runs` | create a run (the core endpoint) |
| `GET` | `/enrichments/runs/:runId` | per-cell values, sources, errors |
| `GET` | `/jobs/:jobId` + `/events` | progress, SSE |
| `POST` | `/jobs/:jobId/cancel` | stop; refund uncharged cells |

`POST /enrichments/runs`:

```json
{
  "target": { "sheetId": "sh_companies", "rowIds": ["row_1", "row_2"] },
  "columns": [
    {
      "key": "funding",
      "label": "Funding Stage",
      "type": "badge",
      "enrichmentId": "find_funding",
      "prompt": "Find the company's latest funding stage."
    }
  ]
}
```

→ `202 { "runId": "enr_…", "jobId": "job_…", "estimatedCredits": 6, "status": "queued" }`

`GET /enrichments/runs/:runId` returns one entry per row × column:

```json
{
  "id": "enr_…",
  "jobId": "job_…",
  "sheetId": "sh_companies",
  "status": "succeeded",
  "estimatedCredits": 6,
  "chargedCredits": 6,
  "cells": [
    {
      "rowId": "row_1",
      "columnKey": "funding",
      "enrichmentId": "find_funding",
      "status": "succeeded",
      "value": "Series B — $28M led by Redpoint",
      "source": "crunchbase",
      "confidence": 0.91,
      "fetchedAt": "2026-10-22T06:01:11Z",
      "cost": 3,
      "error": null
    }
  ]
}
```

Rules:

- One run can cover several columns; cost is `sum(column.cost) × rows`, charged per completed cell.
- Partial provider failures are per cell (`status: "failed"`, `cost: 0`, `error`); the job still ends `succeeded` if any cell succeeded. Only an all-failed run ends `failed`.
- Honor `Idempotency-Key`; replaying the same key returns the original run.
- Results are cached/reused by `(company, enrichment, prompt hash)` unless an explicit refresh is requested. Not implemented in the reference server yet.

### Reference implementation

`server/mock-api.mjs` implements this slice (in-memory state, simulated providers, no auth) and `server/mock-api.test.mjs` covers the lifecycle.

```bash
npm run api        # http://127.0.0.1:4200/api/v1
npm run test:api   # catalog, run, partial failure, cancel, idempotency, validation
```

```bash
curl -s localhost:4200/api/v1/enrichments/catalog
curl -s -X POST localhost:4200/api/v1/enrichments/runs \
  -H 'content-type: application/json' \
  -H 'idempotency-key: demo-1' \
  -d '{"target":{"sheetId":"sh_companies","rowIds":["row_1","row_2"]},"columns":[{"key":"funding","enrichmentId":"find_funding"}]}'
curl -N localhost:4200/api/v1/jobs/<jobId>/events
```

The server is a reference, not production: it ignores auth, keeps state in memory, and simulates every provider. Keep the shapes; replace the internals.

---

## Home

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/projects?query=&status=&category=&sort=&cursor=` | Projects table |
| `POST` | `/projects` | start research from the composer |
| `GET` | `/projects/:id` | project detail |
| `PATCH` | `/projects/:id` | rename / pause / resume |
| `DELETE` | `/projects/:id` | delete |
| `POST` | `/projects/:id/runs` | re-run a saved workflow |
| `GET` | `/workflows?category=` | "Start with a workflow" list |
| `GET` | `/templates` | "View all workflows" catalog |
| `GET` | `/lists` | Saved lists view |
| `POST` | `/lists` | create list |
| `GET` | `/lists/:id` | list rows |
| `PATCH` | `/lists/:id` | rename / update |
| `DELETE` | `/lists/:id` | delete |
| `GET` | `/enrichments/catalog` | enrichment drawer options + credit cost |
| `POST` | `/projects/:id/columns` | persist an AI column, then start `POST /enrichments/runs` |

`POST /projects` body (composer):

```json
{
  "prompt": "Find 320 SaaS companies using HubSpot…",
  "agentId": "agent_outmate",
  "toolIds": ["web", "linkedin", "funding"],
  "connectorIds": ["hubspot"],
  "enrichments": ["find_funding", "find_decision_makers"]
}
```

Response: `202 { "project": Project, "jobId": "job_…" }`.

```ts
interface Project {
  id: string
  name: string
  status: 'Live' | 'Complete' | 'Paused' | 'Draft'
  type: string                 // "GTM Research", "People Research", …
  counts: { companies: number; leaders: number; signals: number; enriched: number }
  creditsUsed: number
  lastRunAt: string
  owner: { initials: string; color: string }
  createdAt: string
}
```

`GET /enrichments/catalog` item:

```json
{ "id": "find_funding", "name": "Find Company Funding", "description": "The company's latest funding round.", "cost": 3, "source": "cb" }
```

---

## Radar

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/radar/accounts?types=Hiring,Funding&weight=Intent&range=7d` | bubble map |
| `GET` | `/radar/accounts/:id` | right-side account drawer |
| `GET` | `/radar/signals?types=&range=7d&cursor=` | signal feed |
| `POST` | `/radar/signals/:id/actions` | `{ "action": "review" }` or `{ "action": "dismiss" }` |
| `POST` | `/radar/questions` | "Ask Outmate" panel |
| `GET` | `/radar/signal-mix?range=7d` | signal mix bars |

```ts
interface RadarAccount {
  id: string
  name: string
  initials: string
  fit: number          // 0–100
  intent: number       // 0–100
  freshness: number    // 0–100
  signals: number      // signal count
  score: number        // 0–100
  latest: string       // "VP Sales hired 2h ago"
  types: string[]      // filter chips: Hiring, Website, Funding, …
  zone: 'Act now' | 'High intent' | 'Watch' | 'Low priority' // server may compute; client can too
}

interface RadarSignal {
  id: string
  company: { id: string; name: string; initials: string }
  type: string
  tag: string          // "🔥 High intent"
  hot: boolean
  source: string       // "LinkedIn", "Outmate pixel", "Crunchbase", "BuiltWith"
  detectedAt: string
  headline: string
  badges?: { label: string }[]
  insight: string
  recommendation: string
  impact: 'High' | 'Medium' | 'Low'
}
```

`GET /radar/accounts/:id` (drawer):

```json
{
  "id": "cmp_acme",
  "name": "Acme",
  "whyNow": "Acme recently hired a VP Sales…",
  "timeline": [{ "when": "2h ago", "occurredAt": "2026-10-21T12:00:00Z", "title": "VP Sales hired", "source": "LinkedIn · Hiring", "hot": true }],
  "people": [{ "initials": "SC", "name": "Sarah Chen", "role": "VP Sales", "seniority": "Executive", "intent": 89, "activity": "…" }],
  "stack": [{ "category": "CRM", "tool": "HubSpot" }],
  "recommendations": [{ "rank": "01", "title": "Contact Sarah Chen", "reason": "New VP Sales + 94 intent score" }]
}
```

`POST /radar/questions` body `{ "question": "Which accounts should I contact today?" }` →

```json
{
  "summary": "17 accounts require attention. Top 5:",
  "rows": [{ "rank": "01", "accountId": "cmp_acme", "name": "Acme", "score": 96, "why": "VP Sales hired + pricing visits" }]
}
```

`GET /radar/signal-mix` → `[{ "label": "Website", "value": 184 }]`.

---

## Copilot

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/copilot/conversations?query=&cursor=` | sidebar conversation list |
| `POST` | `/copilot/conversations` | first prompt → job |
| `GET` | `/copilot/conversations/:id` | thread, iterations, table summary |
| `PATCH` | `/copilot/conversations/:id` | rename |
| `POST` | `/copilot/conversations/:id/messages` | follow-up prompt → job |
| `POST` | `/copilot/messages/:id/feedback` | `{ "rating": "up" \| "down" }` |
| `POST` | `/copilot/messages/:id/regenerate` | → job |
| `GET` | `/copilot/conversations/:id/results?sheet=target-companies&query=&filter=&sort=&hidden=&cursor=` | results table |
| `POST` | `/copilot/conversations/:id/exports` | `{ "format": "csv" \| "xlsx", "sheets": ["target-companies"] }` |
| `POST` | `/copilot/conversations/:id/shares` | `{ "expiresIn": 604800 }` → `{ "url": "…" }` |
| `GET` | `/companies/:id?include=signals,people,social,stack` | context panel |

`POST /copilot/conversations` and `/messages` body:

```json
{
  "text": "Find companies using HubSpot but not Salesforce",
  "agentId": "agent_outmate",
  "toolIds": ["web", "linkedin"],
  "enrichmentIds": [],
  "attachmentIds": []
}
```

Both return `202 { "conversationId": "…", "messageId": "…", "jobId": "job_…" }`. Stream tokens from `/jobs/:jobId/events`, then persist the assistant message server-side.

```ts
interface Conversation {
  id: string
  title: string
  updatedAt: string
  messageCount: number
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  status: 'streaming' | 'complete' | 'failed'
  feedback?: 'up' | 'down' | null
  attachments?: { id: string; name: string }[]
}
```

Results table (`sheet` = `target-companies` | `leaders` | `signals`):

```json
{
  "sheet": "target-companies",
  "title": "Target Companies",
  "counts": { "total": 42 },
  "columns": [{ "key": "company", "label": "Company", "width": 206, "frozen": true }],
  "rows": [Company],
  "nextCursor": null
}
```

```ts
interface Company {
  id: string
  name: string
  domain: string
  linkedinUrl?: string
  employeeCount?: number
  location?: string
  industry?: string
  crm?: string
  intentScore: number
  icpFit: number
  buyingSignals: { type: string; icon: string }[]
  gtmGap?: string
  qualification: { status: 'Qualified' | 'Researching' | 'Awareness'; reason?: string }
  fundingStage?: string
  estimatedRevenue?: string
  hiringVelocity?: string
  buyingStage?: string
  lastSignalAt?: string
  primaryContact?: {
    name: string
    initials: string
    role: string
    email: string
    status: 'Verified' | 'Guessed'
  }
}

interface Leader {
  id: string
  name: string
  initials: string
  title: string
  companyId: string
  companyName: string
  email: string
  status: 'Verified' | 'Guessed'
  persona: 'Economic' | 'Champion' | 'Technical'
  seniority: string
  lastActiveAt: string
}

interface Signal {
  id: string
  companyId: string
  companyName: string
  type: string
  detail: string
  source: string
  detectedAt: string
  confidence: 'High' | 'Medium' | 'Low'
  freshness: string
  relevance: string
}
```

The UI stores column visibility locally (`hidden`), so `hidden` is a comma-separated list of column keys.

---

## Workspace

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/workspace/projects/:id` | project name, credits, sheet list |
| `GET` | `/workspace/projects/:id/sheets` | sheet tabs + row counts |
| `GET` | `/workspace/sheets/:id/rows?query=&filter=&sort=&hidden=&cursor=` | active sheet |
| `PATCH` | `/workspace/sheets/:id/rows/:rowId` | inline cell edit `{ "cells": { "crm": "HubSpot" } }` |
| `POST` | `/workspace/sheets/:id/columns` | persist the column, then start `POST /enrichments/runs` |
| `PATCH` | `/workspace/sheets/:id/columns` | reorder / hide `{ "order": [...], "hidden": [...] }` |
| `POST` | `/workspace/sheets/:id/rows/run` | Run rows / Run cells → job |
| `POST` | `/workspace/sheets/:id/imports` | multipart CSV import → job |
| `GET` | `/workspace/sheets/:id/exports?format=csv` | signed download URL |
| `POST` | `/workspace/sheets/:id/shares` | share modal → `{ "url": "…" }` |
| `GET` | `/workspace/sheets/:id/context?rowIds=row_1,row_2` | context panel |
| `GET` | `/workspace/projects/:id/runs/:runId` | run panel state |
| `GET` | `/workspace/conversations?query=&cursor=` | history pane |
| `POST` | `/workspace/conversations` | new chat (same contract as Copilot) |

Sheets:

```ts
interface Sheet {
  id: string
  key: 'companies' | 'leaders' | 'signals' | string // custom sheets use their own key
  name: string            // "Target Companies", "Leaders", "Signals", user-named
  kind: 'companies' | 'leaders' | 'signals' | 'custom'
  rowCount: number
}
```

Run cells:

```json
POST /workspace/sheets/:id/rows/run
{ "rowIds": ["row_1", "row_2"], "columnKeys": ["funding", "revenue"], "estimatedOnly": false }
```

→ `202 { "jobId": "job_…", "estimatedCredits": 40 }`. Progress and pause/resume/cancel use the shared `/jobs` endpoints. The UI's dialog reads `progress.done`, `progress.total`, `estimatedCredits`, and `chargedCredits`.

Add column:

```json
POST /workspace/sheets/:id/columns
{ "name": "Funding Stage", "type": "badge", "prompt": "Find the company's latest funding stage.", "applyTo": "all" }
```

→ `202 { "column": { "key": "funding", "label": "Funding Stage" }, "jobId": "job_…" }`.

Context panel response: `{ "overview": [...], "signals": [...], "enrichment": [...], "sources": [...] }` — keep it denormalized; the panel is read-only.

---

## What the frontend still needs

To consume these endpoints, the frontend needs a typed client and a data adapter per page (the models currently read constants directly). That is intentionally not implemented here: wiring a client to endpoints that do not exist would leave four pages permanently broken. Once the backend exposes even `/me`, `/projects`, and `/radar/accounts`, the models can be swapped over screen by screen behind the existing `renderVals()` shape.

One thing to agree on early: **who computes derived values** — `score`, `zone`, bubble size/position, `remainPct`, table aggregates. Today the client computes them from raw metrics; the contract above keeps that behavior so the backend only returns raw fields plus counts.

---

## Amendments for backend v1

The following amendments are taken from `docs/plan.md` §3 and apply to everything in this document.

### A1 — SSE event `cell`

A `cell` event is added to the job event list alongside `progress`, `step`, `token`, `done` and `error`. It carries the updated `CellView` and is emitted so the UI can update cells individually.

### A2 — Job status `paused`

`paused` is added to the job status set, matching the existing `POST /jobs/:id/pause` and `POST /jobs/:id/resume` endpoints.

### A3 — Optional `enrichmentId` on column creation

`POST /workspace/sheets/:id/columns` accepts an optional `enrichmentId`. When `enrichmentId` is absent and `prompt` is present the column kind is `custom_prompt`; when `enrichmentId` and `prompt` are both absent the column kind is `plain_value`.

### A4 — Cell status `no_data`

`no_data` is added to the cell status set for a cell that ran successfully but produced no data. A `no_data` cell costs 0 credits and is not retried by "Retry failed".

### A5 — Nullable company scores and attributes

`Company.intentScore` and `Company.icpFit` are nullable; the backend returns `null`. `qualification`, `gtmGap`, `buyingStage` and `hiringVelocity` are `null` unless filled by an enrichment column.

### A6 — Cell `confidenceLabel`

Each cell carries `confidenceLabel: "low" | "medium" | "high" | null`. `confidence` stays `null` unless a provider returns a number.

### A7 — Per-row `cells` map

Each row carries `cells: { [columnKey]: CellView }` alongside its base fields.

### A8 — Cell provenance fields

Each cell carries `provenance`, `sources: [{ "url", "title" }]`, `userEdited` and `stale`.

### A9 — `DELETE /workspace/sheets/:id/columns/:key`

Removes a column from a sheet.

### A10 — `POST /workspace/sheets/:id/columns/:key/clear`

Clears the results of one enrichment column.

### A11 — `GET /downloads/:token`

Streams a previously exported file. `:token` is a short-lived download token; no object storage is used.

### A12 — Additive fields

Catalog items gain `appliesTo`, `status` and `requiresInputs`. The run request body gains `refresh` and `overwriteEdited`. Row edits gain `expectedRevision`. The run-cells `estimatedOnly` response is `{ "estimatedCredits", "eligibleCells", "skipped" }`. Radar responses carry `preview: true`. Jobs carry `result` objects per job type (see `docs/plan.md` §9).
