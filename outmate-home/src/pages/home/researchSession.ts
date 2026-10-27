// Pure helpers for the Home research thread (HC-2). Erasable TypeScript
// only — no imports — so `node --test` can load this file directly
// (same pattern as workspace gridUtils.ts).
//
// Every number shown here comes from the server's dry-run plan or the
// job's done summary. Nothing is estimated.

export type Plan = {
  query: string
  requestedCount: number
  countSource: 'prompt' | 'default'
  requestedRaw: number | null
  capped: boolean
  maxCount: number
  columns: { key: string; label: string }[]
}

export type DiscoverSummary = {
  requested: number
  returnedByProvider?: number
  companies: number
  duplicatesRemoved?: number
  skippedNoHost?: number
  capped?: boolean
}

export type ThreadItem = {
  role?: string
  status?: string
  plan?: Plan
  summary?: DiscoverSummary
}

const fmt = (n: number | null | undefined): string => Number(n || 0).toLocaleString()

export function previewText(plan: Plan): string {
  if (plan.capped) {
    return `You asked for ${fmt(plan.requestedRaw)}; one search returns at most ${fmt(plan.maxCount)}, so I'll search for up to ${fmt(plan.maxCount)} companies. Nothing runs until you confirm.`
  }
  if (plan.countSource === 'default') {
    return `You didn't give a number, so I'll search for up to ${fmt(plan.requestedCount)} companies. Nothing runs until you confirm.`
  }
  return `I'll search the web for up to ${fmt(plan.requestedCount)} companies matching your request. Nothing runs until you confirm.`
}

export function runningText(plan: Plan): string {
  return `Searching for up to ${fmt(plan.requestedCount)} companies…`
}

export function doneText(summary: DiscoverSummary): string {
  const companies = Number(summary.companies || 0)
  const requested = Number(summary.requested || 0)
  let text: string
  if (companies === 0) {
    text = 'No companies matched this search. Try describing the companies more broadly.'
  } else if (companies === requested) {
    text = `Found ${fmt(companies)} companies.`
  } else {
    text = `Found ${fmt(companies)} of ${fmt(requested)} requested companies.`
  }
  const d = Number(summary.duplicatesRemoved || 0)
  if (d === 1) text += ' 1 duplicate removed.'
  else if (d > 1) text += ` ${fmt(d)} duplicates removed.`
  const k = Number(summary.skippedNoHost || 0)
  if (k === 1) text += ' 1 result had no website and was skipped.'
  else if (k > 1) text += ` ${fmt(k)} results had no website and were skipped.`
  return text
}

export function failedText(code: string, message?: string): string {
  switch (code) {
    case 'provider_out_of_credits':
      return "The search provider's quota is used up. Nothing was saved."
    case 'provider_auth':
      return 'The search provider rejected our credentials. Nothing was saved.'
    case 'provider_unavailable':
    case 'network_error':
      return 'The search service is unavailable right now. Try again in a few minutes.'
    case 'backend_not_configured':
      return 'The backend URL is not configured (VITE_API_BASE_URL).'
    case 'validation_error':
      return message || 'The request was invalid.'
    default:
      return `The search failed (${code || 'unknown_error'}).`
  }
}

export function statsFor(item: ThreadItem): { label: string; value: string }[] {
  if (item.status === 'preview' && item.plan) {
    return [{ label: 'Companies requested', value: fmt(item.plan.requestedCount) }]
  }
  if (item.status === 'done' && item.summary) {
    return [
      { label: 'Companies found', value: fmt(item.summary.companies) },
      { label: 'Requested', value: fmt(item.summary.requested) },
    ]
  }
  return []
}

export function threadMeta(items: ThreadItem[]): string {
  const turns = items.filter((m) => m.role === 'user').length
  let meta = `${turns} ${turns === 1 ? 'request' : 'requests'}`
  const lastDone = [...items].reverse().find((m) => m.status === 'done' && m.summary)
  if (lastDone && lastDone.summary) {
    meta += ` · ${fmt(lastDone.summary.companies)} companies`
  }
  return meta
}
