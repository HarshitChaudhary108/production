// Reference implementation of the enrichment slice in docs/api-contract.md.
// In-memory, no auth, simulated providers: enough for the frontend and the
// backend to agree on request/response shapes before real providers exist.
// ponytail: single-process state, swap for a DB + queue when this stops being a reference.
import { createServer } from 'node:http'
import { pathToFileURL } from 'node:url'

const DEFAULT_PORT = Number(process.env.PORT || 4200)
const CELL_MS = Number(process.env.CELL_MS || 70)

const COMPANIES = [
  { id: 'row_1', name: 'Acme', domain: 'acme.io', industry: 'B2B SaaS', size: 240, city: 'Austin, TX', funding: 'Series B — $28M led by Redpoint' },
  { id: 'row_2', name: 'RevenueFlow', domain: 'revenueflow.com', industry: 'B2B SaaS', size: 410, city: 'Denver, CO', funding: 'Series B — $34M' },
  { id: 'row_3', name: 'Northwind Labs', domain: 'northwind.dev', industry: 'DevTools', size: 120, city: 'Toronto, ON', funding: 'Series A — $9M' },
  { id: 'row_4', name: 'Brightpath', domain: 'brightpath.io', industry: 'MarTech', size: 65, city: 'London, UK', funding: 'Seed — $4M' },
  { id: 'row_5', name: 'Strata', domain: 'strata.dev', industry: 'Data', size: 30, city: 'Berlin, DE', funding: 'Pre-seed' },
]

const CATALOG = [
  { id: 'find_company_news', name: 'Find Company News', description: 'Find the latest relevant company news.', cost: 3, outputType: 'text', source: 'web', sample: (c) => `${c.name} announced a new GTM initiative this week` },
  { id: 'find_funding', name: 'Find Company Funding', description: "Find the company's latest funding round.", cost: 3, outputType: 'badge', source: 'crunchbase', sample: (c) => c.funding },
  { id: 'find_tech_stack', name: 'Find Website Tech Stack', description: 'Identify technologies the company runs on.', cost: 6, outputType: 'chips', source: 'builtwith', sample: (c) => (c.industry === 'Data' ? ['Snowflake', 'dbt', 'Looker'] : ['HubSpot', 'Segment', 'Snowflake']) },
  { id: 'find_revenue', name: 'Find Company Revenue', description: "Find the company's estimated revenue.", cost: 2, outputType: 'text', source: 'web', sample: (c) => `${c.size * 0.08}M ARR (estimated)` },
  { id: 'find_job_openings', name: 'Find Job Openings', description: 'Find current GTM job openings.', cost: 3, outputType: 'text', source: 'linkedin', sample: (c) => `Sales +${2 + (c.size % 7)} open roles` },
  { id: 'find_linkedin_highlights', name: 'Find LinkedIn Profile Highlights', description: 'Extract noteworthy details from the company profile.', cost: 4, outputType: 'text', source: 'linkedin', sample: (c) => `${c.name} is expanding its GTM leadership team` },
  { id: 'find_social_profiles', name: 'Find Social Profiles', description: "Find the company's social accounts.", cost: 2, outputType: 'text', source: 'web', sample: (c) => `x.com/${c.domain.split('.')[0]} · linkedin.com/company/${c.domain.split('.')[0]}` },
  { id: 'find_gtm_strategy', name: 'Find GTM Strategy', description: "Analyze the company's go-to-market motion.", cost: 5, outputType: 'text', source: 'web', sample: () => 'Product-led growth with an enterprise sales overlay' },
  { id: 'find_core_values', name: 'Find Core Values', description: "Find the company's stated core values.", cost: 3, outputType: 'text', source: 'web', sample: () => 'Customer-first, transparency, speed' },
  { id: 'find_free_trial', name: 'Find Free Trial', description: 'Check whether a free trial or freemium tier exists.', cost: 2, outputType: 'badge', source: 'web', sample: () => 'Free trial available (14 days)' },
  { id: 'find_snapshot', name: 'Find Company Snapshot', description: 'Return a one-line company snapshot.', cost: 3, outputType: 'text', source: 'web', sample: (c) => `${c.industry} · ${c.size} employees · ${c.city}` },
  { id: 'find_decision_makers', name: 'Find Decision Makers', description: 'Find the buying committee at each company.', cost: 20, outputType: 'people', source: 'linkedin', sample: (c) => [{ name: 'Sarah Chen', role: 'VP Sales', email: `sarah@${c.domain}` }] },
]

const catalogById = new Map(CATALOG.map((item) => [item.id, item]))

const state = {
  credits: 5000,
  used: 0,
  reserved: 0,
  seq: 0,
  runs: new Map(),
  jobs: new Map(),
  idempotency: new Map(),
}

const nextId = (prefix) => `${prefix}_${++state.seq}`

function send(res, status, body, headers = {}) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    ...headers,
  })
  res.end(payload)
}

function fail(res, status, code, message, details) {
  send(res, status, { error: { code, message, ...(details ? { details } : {}) } })
}

function cors(res) {
  res.setHeader('access-control-allow-origin', '*')
  res.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS')
  res.setHeader('access-control-allow-headers', 'content-type, authorization, idempotency-key')
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 1_000_000) {
        reject(Object.assign(new Error('payload too large'), { status: 413 }))
        req.destroy()
      }
    })
    req.on('end', () => {
      if (!data) return resolve({})
      try {
        resolve(JSON.parse(data))
      } catch {
        reject(Object.assign(new Error('invalid JSON'), { status: 400 }))
      }
    })
    req.on('error', reject)
  })
}

function catalogView() {
  return CATALOG.map(({ sample, ...item }) => item)
}

function cellView(cell) {
  return {
    rowId: cell.rowId,
    columnKey: cell.columnKey,
    enrichmentId: cell.enrichmentId,
    status: cell.status,
    value: cell.value,
    source: cell.source,
    confidence: cell.confidence,
    fetchedAt: cell.fetchedAt,
    cost: cell.cost,
    error: cell.error,
  }
}

function jobView(job) {
  return {
    id: job.id,
    type: 'enrichment',
    status: job.status,
    progress: job.progress,
    steps: job.steps,
    estimatedCredits: job.estimatedCredits,
    chargedCredits: job.chargedCredits,
    summary: job.summary,
    error: job.error,
  }
}

function runView(run) {
  return {
    id: run.id,
    jobId: run.jobId,
    sheetId: run.sheetId,
    status: run.status,
    columns: run.columns,
    estimatedCredits: run.estimatedCredits,
    chargedCredits: run.chargedCredits,
    cells: run.cells.map(cellView),
  }
}

function emit(job, event, data) {
  if (!job.clients.size) return
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  for (const client of job.clients) client.write(payload)
}

function updateStep(job, run, columnKey) {
  const step = job.steps.find((s) => s.key === columnKey)
  const cells = run.cells.filter((c) => c.columnKey === columnKey)
  const done = cells.filter((c) => c.status === 'succeeded' || c.status === 'failed' || c.status === 'cancelled').length
  step.meta = `${done} of ${cells.length}`
  step.status = done === cells.length ? (cells.some((c) => c.status === 'failed') ? 'completed_with_errors' : 'done') : 'running'
}

function confidenceFor(cell) {
  const sum = [...(cell.rowId + cell.enrichmentId)].reduce((n, ch) => n + ch.charCodeAt(0), 0)
  return Math.round((0.74 + (sum % 23) / 100) * 100) / 100
}

// Deterministic partial failures so clients build retry/error UI against real shapes.
function shouldFail(cell, company) {
  return (
    (cell.enrichmentId === 'find_linkedin_highlights' && company.name === 'Brightpath') ||
    (cell.enrichmentId === 'find_revenue' && company.name === 'Strata')
  )
}

function processCell(run, job, cell) {
  const company = run.companies.find((c) => c.id === cell.rowId)
  const item = catalogById.get(cell.enrichmentId)
  if (shouldFail(cell, company)) {
    cell.status = 'failed'
    cell.error = 'No result found for this company.'
    cell.cost = 0
  } else {
    cell.status = 'succeeded'
    cell.value = item.sample(company)
    cell.source = item.source
    cell.confidence = confidenceFor(cell)
    cell.fetchedAt = new Date().toISOString()
    cell.cost = item.cost
  }
  job.progress.done += 1
  updateStep(job, run, cell.columnKey)
  emit(job, 'cell', cellView(cell))
  emit(job, 'progress', job.progress)
}

function settle(job, run, status) {
  const charged = run.cells.reduce((n, c) => n + c.cost, 0)
  state.credits += job.estimatedCredits - charged
  state.reserved -= job.estimatedCredits
  state.used += charged
  job.chargedCredits = charged
  job.status = status
  run.status = status
  const succeeded = run.cells.filter((c) => c.status === 'succeeded').length
  const failed = run.cells.filter((c) => c.status === 'failed').length
  job.summary = { succeeded, failed }
  emit(job, 'done', { status, chargedCredits: charged, summary: job.summary })
}

function finish(run) {
  const job = state.jobs.get(run.jobId)
  if (!run.cells.some((c) => c.status === 'succeeded')) return settle(job, run, 'failed')
  settle(job, run, 'succeeded')
}

function advance(run) {
  const job = state.jobs.get(run.jobId)
  if (job.status !== 'running') return
  const cell = run.cells.find((c) => c.status === 'pending')
  if (!cell) {
    finish(run)
    return
  }
  cell.status = 'running'
  emit(job, 'cell', cellView(cell))
  job.timer = setTimeout(() => {
    job.timer = null
    if (job.status !== 'running') return
    processCell(run, job, cell)
    advance(run)
  }, CELL_MS)
  job.timer.unref()
}

function validateRun(body) {
  const target = body?.target
  if (!target || !Array.isArray(target.rowIds) || target.rowIds.length === 0)
    return { status: 422, code: 'validation_error', message: 'target.rowIds must be a non-empty array.' }
  if (!Array.isArray(body.columns) || body.columns.length === 0)
    return { status: 422, code: 'validation_error', message: 'columns must be a non-empty array.' }
  const unknown = target.rowIds.filter((id) => !COMPANIES.some((c) => c.id === id))
  if (unknown.length)
    return { status: 422, code: 'unknown_row_ids', message: 'Some rowIds do not exist.', details: { unknown } }
  const keys = new Set()
  for (const column of body.columns) {
    if (!column || typeof column.key !== 'string' || !column.key)
      return { status: 422, code: 'validation_error', message: 'Each column needs a key.' }
    if (keys.has(column.key))
      return { status: 422, code: 'duplicate_column_key', message: `Duplicate column key "${column.key}".` }
    keys.add(column.key)
    if (!catalogById.has(column.enrichmentId))
      return { status: 422, code: 'unknown_enrichment', message: `Unknown enrichment "${column.enrichmentId}".` }
  }
  return null
}

function createRun(body) {
  const columns = body.columns.map((column) => {
    const item = catalogById.get(column.enrichmentId)
    return {
      key: column.key,
      label: column.label || item.name,
      type: column.type || item.outputType,
      enrichmentId: column.enrichmentId,
      prompt: column.prompt || item.description,
    }
  })
  const companies = body.target.rowIds.map((id) => COMPANIES.find((c) => c.id === id))
  const estimatedCredits = companies.length * columns.reduce((n, c) => n + catalogById.get(c.enrichmentId).cost, 0)
  if (state.credits < estimatedCredits)
    return { error: { status: 409, code: 'insufficient_credits', message: 'Not enough credits for this run.', details: { required: estimatedCredits, remaining: state.credits } } }

  const runId = nextId('enr')
  const jobId = nextId('job')
  const run = {
    id: runId,
    jobId,
    sheetId: body.target.sheetId || null,
    status: 'running',
    columns,
    companies,
    estimatedCredits,
    chargedCredits: 0,
    cells: columns.flatMap((column) =>
      companies.map((company) => ({
        rowId: company.id,
        columnKey: column.key,
        enrichmentId: column.enrichmentId,
        status: 'pending',
        value: null,
        source: null,
        confidence: null,
        fetchedAt: null,
        cost: 0,
        error: null,
      })),
    ),
  }
  const job = {
    id: jobId,
    status: 'running',
    progress: { done: 0, total: run.cells.length, unit: 'cells' },
    steps: columns.map((column) => ({
      key: column.key,
      label: column.label,
      status: 'running',
      meta: `0 of ${companies.length}`,
    })),
    estimatedCredits,
    chargedCredits: 0,
    summary: null,
    error: null,
    clients: new Set(),
    timer: null,
  }

  state.credits -= estimatedCredits
  state.reserved += estimatedCredits
  state.runs.set(runId, run)
  state.jobs.set(jobId, job)
  advance(run)
  return { run, job }
}

function cancelJob(job) {
  if (job.status !== 'running') return false
  if (job.timer) clearTimeout(job.timer)
  job.timer = null
  const run = [...state.runs.values()].find((r) => r.jobId === job.id)
  for (const cell of run.cells) {
    if (cell.status === 'pending' || cell.status === 'running') {
      cell.status = 'cancelled'
      cell.error = 'Cancelled before completion.'
    }
  }
  for (const column of run.columns) updateStep(job, run, column.key)
  settle(job, run, 'cancelled')
  return true
}

async function route(req, res, url) {
  const path = url.pathname
  const method = req.method

  if (method === 'GET' && path === '/health') return send(res, 200, { ok: true })
  if (method === 'GET' && path === '/api/v1/me')
    return send(res, 200, {
      user: { id: 'usr_demo', name: 'Omkar Bhor', email: 'omkar@outmate.ai', initials: 'OB' },
      workspace: { id: 'ws_demo', name: 'Outmate', plan: 'Growth workspace' },
      credits: { remaining: state.credits, used: state.used, reserved: state.reserved },
    })

  if (method === 'GET' && path === '/api/v1/enrichments/catalog') return send(res, 200, { data: catalogView() })

  if (method === 'POST' && path === '/api/v1/enrichments/runs') {
    const body = await readJson(req)
    const invalid = validateRun(body)
    if (invalid) return fail(res, invalid.status, invalid.code, invalid.message, invalid.details)
    const key = req.headers['idempotency-key']
    if (key && state.idempotency.has(key)) return send(res, 202, state.idempotency.get(key))
    const created = createRun(body)
    if (created.error) return fail(res, created.error.status, created.error.code, created.error.message, created.error.details)
    const response = { runId: created.run.id, jobId: created.job.id, estimatedCredits: created.run.estimatedCredits, status: 'queued' }
    if (key) state.idempotency.set(key, response)
    return send(res, 202, response)
  }

  const runMatch = path.match(/^\/api\/v1\/enrichments\/runs\/([^/]+)$/)
  if (method === 'GET' && runMatch) {
    const run = state.runs.get(runMatch[1])
    if (!run) return fail(res, 404, 'not_found', 'Run not found.')
    return send(res, 200, runView(run))
  }

  const jobMatch = path.match(/^\/api\/v1\/jobs\/([^/]+)(\/events|\/cancel)?$/)
  if (jobMatch) {
    const job = state.jobs.get(jobMatch[1])
    if (!job) return fail(res, 404, 'not_found', 'Job not found.')

    if (method === 'GET' && !jobMatch[2]) return send(res, 200, jobView(job))

    if (method === 'GET' && jobMatch[2] === '/events') {
      res.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
        'access-control-allow-origin': '*',
      })
      res.write(`retry: 1000\n\nevent: progress\ndata: ${JSON.stringify(job.progress)}\n\n`)
      if (job.status !== 'running') {
        res.write(`event: done\ndata: ${JSON.stringify({ status: job.status, chargedCredits: job.chargedCredits, summary: job.summary })}\n\n`)
        return res.end()
      }
      job.clients.add(res)
      req.on('close', () => job.clients.delete(res))
      return
    }

    if (method === 'POST' && jobMatch[2] === '/cancel') {
      if (!cancelJob(job)) return fail(res, 409, 'invalid_state', `Job is ${job.status}.`)
      return send(res, 200, jobView(job))
    }
  }

  return fail(res, 404, 'not_found', `No route for ${method} ${path}.`)
}

export function createMockApi() {
  return createServer(async (req, res) => {
    cors(res)
    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      return res.end()
    }
    try {
      await route(req, res, new URL(req.url, 'http://localhost'))
    } catch (error) {
      if (res.headersSent) return res.end()
      if (error.status) return fail(res, error.status, 'bad_request', error.message)
      console.error(error)
      fail(res, 500, 'internal_error', 'Unexpected error.')
    }
  })
}

export function startMockApi(port = DEFAULT_PORT) {
  const server = createMockApi()
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, () => resolve(server))
  })
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const server = await startMockApi()
  const { port } = server.address()
  console.log(`Mock API listening on http://127.0.0.1:${port}/api/v1`)
  console.log(`  GET  /api/v1/enrichments/catalog`)
  console.log(`  POST /api/v1/enrichments/runs`)
  console.log(`  GET  /api/v1/jobs/:id  |  /api/v1/jobs/:id/events  |  POST /api/v1/jobs/:id/cancel`)
  console.log(`  GET  /api/v1/enrichments/runs/:id  |  GET /api/v1/me`)
}
