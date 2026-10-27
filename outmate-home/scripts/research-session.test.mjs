import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  doneText,
  failedText,
  previewText,
  runningText,
  statsFor,
  threadMeta,
} from '../src/pages/home/researchSession.ts'

test('previewText prompt source', () => {
  assert.equal(
    previewText({ requestedCount: 20, countSource: 'prompt', capped: false }),
    "I'll search the web for up to 20 companies matching your request. Nothing runs until you confirm.",
  )
})

test('previewText default source', () => {
  assert.equal(
    previewText({ requestedCount: 25, countSource: 'default', capped: false }),
    "You didn't give a number, so I'll search for up to 25 companies. Nothing runs until you confirm.",
  )
})

test('previewText capped', () => {
  assert.equal(
    previewText({ requestedCount: 100, countSource: 'prompt', requestedRaw: 1200, capped: true, maxCount: 100 }),
    "You asked for 1,200; one search returns at most 100, so I'll search for up to 100 companies. Nothing runs until you confirm.",
  )
})

test('runningText', () => {
  assert.equal(
    runningText({ requestedCount: 20 }),
    'Searching for up to 20 companies…',
  )
})

test('doneText exact match', () => {
  assert.equal(
    doneText({ requested: 20, companies: 20, duplicatesRemoved: 0, skippedNoHost: 0 }),
    'Found 20 companies.',
  )
})

test('doneText partial with dupes and skips', () => {
  assert.equal(
    doneText({ requested: 20, companies: 17, duplicatesRemoved: 2, skippedNoHost: 1 }),
    'Found 17 of 20 requested companies. 2 duplicates removed. 1 result had no website and was skipped.',
  )
})

test('doneText plurals and zero', () => {
  assert.equal(
    doneText({ requested: 20, companies: 19, duplicatesRemoved: 1, skippedNoHost: 0 }),
    'Found 19 of 20 requested companies. 1 duplicate removed.',
  )
  assert.equal(
    doneText({ requested: 20, companies: 16, duplicatesRemoved: 0, skippedNoHost: 3 }),
    'Found 16 of 20 requested companies. 3 results had no website and were skipped.',
  )
  assert.equal(
    doneText({ requested: 20, companies: 0 }),
    'No companies matched this search. Try describing the companies more broadly.',
  )
})

test('failedText codes', () => {
  assert.equal(failedText('provider_out_of_credits'), "The search provider's quota is used up. Nothing was saved.")
  assert.equal(failedText('provider_auth'), 'The search provider rejected our credentials. Nothing was saved.')
  assert.equal(failedText('provider_unavailable'), 'The search service is unavailable right now. Try again in a few minutes.')
  assert.equal(failedText('network_error'), 'The search service is unavailable right now. Try again in a few minutes.')
  assert.equal(failedText('backend_not_configured'), 'The backend URL is not configured (VITE_API_BASE_URL).')
  assert.equal(failedText('validation_error', 'prompt must be 1-2000 characters.'), 'prompt must be 1-2000 characters.')
  assert.equal(failedText('weird_code'), 'The search failed (weird_code).')
})

test('statsFor preview and done, never decision/credit labels', () => {
  const stats = statsFor({ status: 'preview', plan: { requestedCount: 20 } })
  assert.deepEqual(stats, [{ label: 'Companies requested', value: '20' }])
  const done = statsFor({ status: 'done', summary: { companies: 17, requested: 20 } })
  assert.deepEqual(done, [
    { label: 'Companies found', value: '17' },
    { label: 'Requested', value: '20' },
  ])
  assert.deepEqual(statsFor({ status: 'running' }), [])
  for (const s of [...stats, ...done]) {
    assert.ok(!/decision|credit/i.test(s.label))
  }
})

test('threadMeta counts requests and latest done only', () => {
  const items = [
    { role: 'user', text: 'q' },
    { role: 'ai', status: 'preview' },
  ]
  assert.equal(threadMeta(items), '1 request')
  items.push({ role: 'ai', status: 'done', summary: { companies: 17 } })
  assert.equal(threadMeta(items), '1 request · 17 companies')
  items.push({ role: 'user', text: 'q2' }, { role: 'ai', status: 'done', summary: { companies: 5 } })
  assert.equal(threadMeta(items), '2 requests · 5 companies')
})

test('model.ts has no fake counts', () => {
  const src = readFileSync(new URL('../src/pages/home/model.ts', import.meta.url), 'utf8')
  assert.ok(!src.includes('1284'), 'model.ts still contains 1284')
  assert.ok(!src.includes('askPlan'), 'model.ts still contains askPlan')
})
