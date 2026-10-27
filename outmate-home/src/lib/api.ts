// Typed client for the Outmate backend (HC-2). No fallback data: when
// VITE_API_BASE_URL is unset every call fails loudly with
// "backend_not_configured" instead of silently showing demo numbers.

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export const API_BASE = RAW_BASE + '/api/v1'

export class ApiError extends Error {
  status: number | undefined
  code: string
  details: unknown

  constructor(code: string, message: string, status?: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

type PostOptions = { idempotencyKey?: string }

async function request(
  method: string,
  path: string,
  body?: unknown,
  idempotencyKey?: string,
): Promise<unknown> {
  if (!RAW_BASE) {
    throw new ApiError(
      'backend_not_configured',
      'The backend URL is not configured (VITE_API_BASE_URL).',
    )
  }
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
  let res: Response
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('network_error', 'The search service is unreachable.')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const err = (data && data.error) || {}
    throw new ApiError(
      err.code || `http_${res.status}`,
      err.message || res.statusText,
      res.status,
      err.details,
    )
  }
  return data
}

export function apiPost(path: string, body?: unknown, opts?: PostOptions) {
  return request('POST', path, body, opts?.idempotencyKey)
}

export function apiGet(path: string) {
  return request('GET', path)
}

export function jobEventsUrl(jobId: string): string {
  return `${API_BASE}/jobs/${jobId}/events`
}
