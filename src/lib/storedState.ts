import { useCallback, useSyncExternalStore } from 'react'

type Listener = () => void

export interface StoredState<T> {
  get: () => T
  set: (next: T | ((previous: T) => T)) => void
  subscribe: (listener: Listener) => () => void
  reset: () => void
}

interface StoredStateOptions<T> {
  storage?: () => Storage
  /** Repairs or rejects persisted data from an older shape. */
  parse?: (raw: unknown) => T
}

/**
 * A tiny external store persisted to web storage. Every component that reads
 * the same store stays in sync, including across browser tabs.
 */
export function createStoredState<T>(
  key: string,
  fallback: T,
  options: StoredStateOptions<T> = {},
): StoredState<T> {
  const getStorage = options.storage ?? (() => window.localStorage)
  const listeners = new Set<Listener>()

  let cached: T | undefined
  let hasCached = false

  const read = (): T => {
    try {
      const raw = getStorage().getItem(key)

      if (raw === null) return fallback

      const parsed: unknown = JSON.parse(raw)

      return options.parse ? options.parse(parsed) : (parsed as T)
    } catch {
      return fallback
    }
  }

  const get = (): T => {
    if (!hasCached) {
      cached = read()
      hasCached = true
    }

    return cached as T
  }

  const notify = () => {
    for (const listener of listeners) listener()
  }

  const set: StoredState<T>['set'] = (next) => {
    const value = typeof next === 'function' ? (next as (previous: T) => T)(get()) : next

    cached = value
    hasCached = true

    try {
      getStorage().setItem(key, JSON.stringify(value))
    } catch {
      // Storage can be full or unavailable; the in-memory value still applies.
    }

    notify()
  }

  const reset = () => {
    cached = fallback
    hasCached = true

    try {
      getStorage().removeItem(key)
    } catch {
      // Nothing to clear.
    }

    notify()
  }

  const subscribe: StoredState<T>['subscribe'] = (listener) => {
    listeners.add(listener)

    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== key) return

      hasCached = false
      listener()
    }

    window.addEventListener('storage', onStorage)

    return () => {
      listeners.delete(listener)
      window.removeEventListener('storage', onStorage)
    }
  }

  return { get, set, subscribe, reset }
}

export function useStoredState<T>(store: StoredState<T>): [T, StoredState<T>['set']] {
  const value = useSyncExternalStore(store.subscribe, store.get, store.get)
  const set = useCallback<StoredState<T>['set']>((next) => store.set(next), [store])

  return [value, set]
}
