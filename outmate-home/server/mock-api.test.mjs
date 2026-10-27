import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import { startMockApi } from './mock-api.mjs'

const server = await startMockApi(0)
const base = `http://127.0.0.1:${server.address().port}/api/v1`

after(() => new Promise((resolve) => server.close(resolve)))

const get = async (path) => {
  const res = await fetch(base + path)
  return { status: res.status, body: await res.json() }
}

const post = async (path, body, headers = {}) => {
  const res = await fetch(base + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  return { status: res.status, body: await res.json() }
}

async function waitForJob(id, predicate, timeoutMs = 5000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const { body } = await get(`/jobs/${id}`)
    if (predicate(body)) return body
    await new Promise((r) => setTimeout(r, 30))
  }
  throw new Error(`job ${id} did not reach the expected state`)
}

const run = (rowIds, columns) => ({ target: { sheetId: 'sh_companies', rowIds }, columns })

test('catalog exposes every enrichment as config, not an endpoint', async () => {
  const { status, body } = await get('/enrichments/catalog')
  assert.equal(status, 200)
  assert.equal(body.data.length, 12)
  for (const item of body.data) {
    assert.equal(typeof item.id, 'string')
    assert.equal(typeof item.cost, 'number')
    assert.ok(item.cost > 0)
    assert.equal(item.sample, undefined)
  }
})

test('a run enriches rows and charges per cell', async () => {
  const before = (await get('/me')).body.credits.remaining
  const created = await post('/enrichments/runs', run(['row_1', 'row_2'], [{ key: 'funding', enrichmentId: 'find_funding' }]))
  assert.equal(created.status, 202)
  assert.equal(created.body.estimatedCredits, 6)

  const job = await waitForJob(created.body.jobId, (j) => j.status === 'succeeded')
  assert.deepEqual(job.progress, { done: 2, total: 2, unit: 'cells' })
  assert.equal(job.chargedCredits, 6)
  assert.deepEqual(job.summary, { succeeded: 2, failed: 0 })

  const result = await get(`/enrichments/runs/${created.body.runId}`)
  assert.equal(result.status, 200)
  assert.equal(result.body.cells.length, 2)
  assert.equal(result.body.cells[0].value, 'Series B — $28M led by Redpoint')
  assert.equal(result.body.cells[0].source, 'crunchbase')
  assert.equal(result.body.cells[0].status, 'succeeded')

  const afterCredits = (await get('/me')).body.credits.remaining
  assert.equal(afterCredits, before - 6)
})

test('partial provider failures are reported per cell without failing the job', async () => {
  const created = await post(
    '/enrichments/runs',
    run(['row_1', 'row_4'], [{ key: 'highlights', enrichmentId: 'find_linkedin_highlights' }]),
  )
  const job = await waitForJob(created.body.jobId, (j) => j.status === 'succeeded')
  assert.deepEqual(job.summary, { succeeded: 1, failed: 1 })
  assert.equal(job.chargedCredits, 4)

  const result = await get(`/enrichments/runs/${created.body.runId}`)
  const failed = result.body.cells.find((c) => c.rowId === 'row_4')
  assert.equal(failed.status, 'failed')
  assert.equal(failed.cost, 0)
  assert.match(failed.error, /No result/)
})

test('a run with only failures ends as failed', async () => {
  const created = await post('/enrichments/runs', run(['row_4'], [{ key: 'highlights', enrichmentId: 'find_linkedin_highlights' }]))
  const job = await waitForJob(created.body.jobId, (j) => j.status !== 'running')
  assert.equal(job.status, 'failed')
  assert.equal(job.chargedCredits, 0)
})

test('cancelling refunds uncharged cells and reports the partial charge', async () => {
  const created = await post(
    '/enrichments/runs',
    run(['row_1', 'row_2', 'row_3', 'row_4'], [
      { key: 'funding', enrichmentId: 'find_funding' },
      { key: 'revenue', enrichmentId: 'find_revenue' },
    ]),
  )
  assert.equal(created.body.estimatedCredits, 20)
  await waitForJob(created.body.jobId, (j) => j.progress.done >= 1)
  const cancelled = await post(`/jobs/${created.body.jobId}/cancel`)
  assert.equal(cancelled.status, 200)
  assert.equal(cancelled.body.status, 'cancelled')
  assert.ok(cancelled.body.chargedCredits < 20)
  assert.ok(cancelled.body.chargedCredits > 0)
})

test('idempotency key returns the same run', async () => {
  const first = await post('/enrichments/runs', run(['row_1'], [{ key: 'news', enrichmentId: 'find_company_news' }]), {
    'idempotency-key': 'demo-key-1',
  })
  const second = await post('/enrichments/runs', run(['row_1'], [{ key: 'news', enrichmentId: 'find_company_news' }]), {
    'idempotency-key': 'demo-key-1',
  })
  assert.equal(first.status, 202)
  assert.deepEqual(second.body, first.body)
  await waitForJob(first.body.jobId, (j) => j.status === 'succeeded')
})

test('invalid requests return the error envelope', async () => {
  const empty = await post('/enrichments/runs', run([], []))
  assert.equal(empty.status, 422)
  assert.equal(empty.body.error.code, 'validation_error')

  const unknown = await post('/enrichments/runs', run(['row_999'], [{ key: 'x', enrichmentId: 'find_funding' }]))
  assert.equal(unknown.status, 422)
  assert.equal(unknown.body.error.code, 'unknown_row_ids')

  const enrichment = await post('/enrichments/runs', run(['row_1'], [{ key: 'x', enrichmentId: 'nope' }]))
  assert.equal(enrichment.status, 422)
  assert.equal(enrichment.body.error.code, 'unknown_enrichment')
})
