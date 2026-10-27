import { useEffect, useRef, useSyncExternalStore } from 'react'
import { resolveLegacyPath } from './legacyRoutes'

type Patch<S> = Partial<S> | ((prev: S) => Partial<S>)
type Timer = ReturnType<typeof setTimeout>

let navigatorFn: ((to: string) => void) | null = null
export function setNavigator(fn: ((to: string) => void) | null) {
  navigatorFn = fn
}

export class ModelBase<S extends object = object> {
  // Generated models assign `state` as a class field.
  state!: S
  props: Record<string, unknown>
  private version = 0
  private listeners = new Set<() => void>()
  private timers = new Set<Timer>()

  constructor(props: Record<string, unknown> = {}) {
    this.props = props
  }

  setState(patch: Patch<S>, cb?: () => void) {
    const next = typeof patch === 'function' ? (patch as (prev: S) => Partial<S>)(this.state) : patch
    if (next == null) return
    this.state = { ...this.state, ...next }
    this.version++
    this.listeners.forEach((l) => l())
    if (cb) cb()
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getVersion = () => this.version

  setTimeout(fn: () => void, ms: number): Timer {
    const id = setTimeout(() => {
      this.timers.delete(id)
      fn()
    }, ms)
    this.timers.add(id)
    return id
  }

  clearTimeout(id?: Timer | null) {
    if (id == null) return
    clearTimeout(id)
    this.timers.delete(id)
  }

  navigate(to: string) {
    navigatorFn?.(to)
  }

  goFile(file: string) {
    this.navigate(resolveLegacyPath(file) ?? '/')
  }

  dispose() {
    this.timers.forEach((t) => clearTimeout(t))
    this.timers.clear()
    this.listeners.clear()
  }
}

type ModelLike = {
  subscribe: (listener: () => void) => () => void
  getVersion: () => number
  dispose: () => void
}

export function useModel<M extends ModelLike, V>(
  create: () => M,
  values: (model: M) => V,
): V {
  const ref = useRef<M | null>(null)
  if (ref.current === null) ref.current = create()
  const model = ref.current
  useSyncExternalStore(model.subscribe, model.getVersion, model.getVersion)
  useEffect(() => () => model.dispose(), [model])
  return values(model)
}
