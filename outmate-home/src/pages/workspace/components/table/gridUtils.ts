export type CellIdentity = { row: string; col: string }
export type CellRect = { r1: number; c1: number; r2: number; c2: number }

export const EDITABLE_SOURCE_COLUMNS = ['domain', 'emp', 'loc', 'gap', 'last']

export function parseClipboard(text: string): string[][] {
  const src = text.replace(/\r\n?/g, '\n')
  if (!src) return []
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i += 1
        } else quoted = false
      } else field += ch
      continue
    }
    if (ch === '"' && field === '') {
      quoted = true
      continue
    }
    if (ch === '\t') {
      row.push(field)
      field = ''
      continue
    }
    if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      continue
    }
    field += ch
  }
  row.push(field)
  rows.push(row)
  if (rows.length > 1) {
    const last = rows[rows.length - 1]
    if (last.length === 1 && last[0] === '') rows.pop()
  }
  return rows
}

export function serializeTsv(matrix: string[][]): string {
  return matrix.map((row) => row.join('\t')).join('\n')
}

export function rectBetween(
  anchor: CellIdentity | null,
  active: CellIdentity | null,
  rows: string[],
  cols: string[],
): CellRect | null {
  if (!anchor || !active) return null
  const ar = rows.indexOf(anchor.row)
  const ac = cols.indexOf(anchor.col)
  const br = rows.indexOf(active.row)
  const bc = cols.indexOf(active.col)
  if (ar < 0 || ac < 0 || br < 0 || bc < 0) return null
  return {
    r1: Math.min(ar, br),
    c1: Math.min(ac, bc),
    r2: Math.max(ar, br),
    c2: Math.max(ac, bc),
  }
}

export function cellText(c: Record<string, unknown> | null | undefined): string {
  if (!c) return ''
  if (c.isCheck) return String(c.check ?? '')
  if (c.isCustom) return c.hasVal && c.value != null ? String(c.value) : ''
  if (c.isChips) {
    const list = (c.list as Array<{ label?: unknown }> | undefined) ?? []
    return list.map((x) => String(x.label ?? '')).join(', ')
  }
  if (
    c.isScore ||
    c.isBadge ||
    c.isText ||
    c.isCompany ||
    c.isLink ||
    c.isLinkedIn ||
    c.isContact ||
    c.isEmail ||
    c.isNum
  ) {
    return c.value == null ? '' : String(c.value)
  }
  return ''
}

export function sanitizeEdit(col: string, raw: string): string | null {
  const value = raw.replace(/\r\n?/g, '\n').trim()
  if (!value) return null
  if (col === 'emp') {
    const digits = value.replace(/[^0-9]/g, '')
    if (!digits) return null
    return String(Math.min(10_000_000, Number.parseInt(digits, 10)))
  }
  return value.slice(0, 500)
}

export function canEditColumn(key: string, kind: string, plainCustom: boolean): boolean {
  if (kind === 'custom') return plainCustom
  return EDITABLE_SOURCE_COLUMNS.indexOf(key) > -1
}
