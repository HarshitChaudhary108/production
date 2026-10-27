import { Navigate } from 'react-router-dom'

export const LEGACY_ROUTES: Record<string, string> = {
  'index.html': '/',
  'Outmate Radar.dc.html': '/radar',
  'Outmate Copilot v2.dc.html': '/copilot',
  'Outmate Workspace v3.dc.html': '/workspace',
}

export function resolveLegacyPath(file: string): string | null {
  const name = decodeURIComponent(file).replace(/^\.?\//, '')
  return LEGACY_ROUTES[name] ?? null
}

export function LegacyRedirect({ to }: { to: string }) {
  return <Navigate to={to} replace />
}
