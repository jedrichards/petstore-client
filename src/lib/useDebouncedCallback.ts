import { useCallback, useEffect, useRef } from 'react'

/**
 * Returns a stable function that calls `callback` once calls have stopped
 * for `delayMs`. A pending call is dropped when the component unmounts.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs = 250,
): (...args: Args) => void {
  const latest = useRef(callback)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    latest.current = callback
  }, [callback])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return useCallback(
    (...args: Args) => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => latest.current(...args), delayMs)
    },
    [delayMs],
  )
}
