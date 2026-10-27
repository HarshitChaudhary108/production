import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  canEditColumn,
  cellText,
  parseClipboard,
  rectBetween,
  sanitizeEdit,
  serializeTsv,
} from '../src/pages/workspace/components/table/gridUtils.ts'

test('parseClipboard handles CRLF, tabs and a trailing newline', () => {
  assert.deepEqual(parseClipboard('Acme\tacme.io\r\nRevenueFlow\trevenueflow.com\r\n'), [
    ['Acme', 'acme.io'],
    ['RevenueFlow', 'revenueflow.com'],
  ])
})

test('parseClipboard supports quoted cells with tabs, newlines and escaped quotes', () => {
  assert.deepEqual(parseClipboard('"a\tb"\t"line1\nline2"\t"say ""hi"""'), [
    ['a\tb', 'line1\nline2', 'say "hi"'],
  ])
})

test('serializeTsv round-trips a plain matrix', () => {
  const matrix = [
    ['Acme', 'acme.io'],
    ['RevenueFlow', 'revenueflow.com'],
  ]
  assert.equal(serializeTsv(matrix), 'Acme\tacme.io\nRevenueFlow\trevenueflow.com')
  assert.deepEqual(parseClipboard(serializeTsv(matrix)), matrix)
})

test('rectBetween normalizes reversed anchors and rejects unknown cells', () => {
  const rows = ['Acme', 'RevenueFlow', 'Cadence HQ']
  const cols = ['domain', 'emp', 'loc']
  assert.deepEqual(
    rectBetween({ row: 'Cadence HQ', col: 'loc' }, { row: 'Acme', col: 'domain' }, rows, cols),
    { r1: 0, c1: 0, r2: 2, c2: 2 },
  )
  assert.equal(rectBetween({ row: 'Missing', col: 'domain' }, { row: 'Acme', col: 'loc' }, rows, cols), null)
})

test('sanitizeEdit trims, clears empties and keeps employee counts numeric', () => {
  assert.equal(sanitizeEdit('domain', '  acme.dev  '), 'acme.dev')
  assert.equal(sanitizeEdit('domain', '   '), null)
  assert.equal(sanitizeEdit('emp', '~300 employees'), '300')
  assert.equal(sanitizeEdit('emp', 'none'), null)
  assert.equal(sanitizeEdit('emp', '99999999'), '10000000')
  assert.equal(sanitizeEdit('gap', 'x'.repeat(600)).length, 500)
})

test('cellText extracts display text from every rendered cell shape', () => {
  assert.equal(cellText({ isChips: true, list: [{ label: 'HubSpot' }, { label: 'Segment' }] }), 'HubSpot, Segment')
  assert.equal(cellText({ isScore: true, value: '87 / 100' }), '87 / 100')
  assert.equal(cellText({ isText: true, value: 'Austin, TX' }), 'Austin, TX')
  assert.equal(cellText({ isCustom: true, hasVal: true, value: 'Series B' }), 'Series B')
  assert.equal(cellText({ isCustom: true, hasVal: false }), '')
  assert.equal(cellText({ isCheck: true, check: '✓' }), '✓')
})

test('canEditColumn only opens safe source and plain custom columns', () => {
  assert.equal(canEditColumn('domain', 'link', false), true)
  assert.equal(canEditColumn('emp', 'text', false), true)
  assert.equal(canEditColumn('company', 'company', false), false)
  assert.equal(canEditColumn('email', 'email', false), false)
  assert.equal(canEditColumn('signals', 'chips', false), false)
  assert.equal(canEditColumn('cc:1', 'custom', true), true)
  assert.equal(canEditColumn('cc:2', 'custom', false), false)
})
