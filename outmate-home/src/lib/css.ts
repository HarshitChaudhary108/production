import type { CSSProperties } from 'react'

export function cssToObj(css: string | CSSProperties | null | undefined): CSSProperties {
  if (css == null) return {}
  if (typeof css !== 'string') return css
  const out: Record<string, string> = {}
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':')
    if (i < 0) continue
    const prop = decl.slice(0, i).trim()
    if (!prop) continue
    const key = prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    out[key] = decl.slice(i + 1).trim()
  }
  return out as CSSProperties
}
