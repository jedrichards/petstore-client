import { createContext, use, useEffect, useMemo, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'

import { createStoredState, useStoredState } from '@/lib/storedState'

export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  /** What the user chose. */
  preference: ThemePreference
  /** What is on screen once "system" is resolved. */
  theme: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
  toggle: () => void
}

const themeStore = createStoredState<ThemePreference>('pawprint:theme', 'system', {
  parse: (raw) => (raw === 'light' || raw === 'dark' ? raw : 'system'),
})

const DARK_QUERY = '(prefers-color-scheme: dark)'

function subscribeToSystemTheme(listener: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY)

  media.addEventListener('change', listener)

  return () => media.removeEventListener('change', listener)
}

function systemPrefersDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const context = use(ThemeContext)

  if (!context) throw new Error('useTheme must be used inside a ThemeProvider')

  return context
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useStoredState(themeStore)
  const prefersDark = useSyncExternalStore(subscribeToSystemTheme, systemPrefersDark, () => false)

  const theme: ResolvedTheme =
    preference === 'system' ? (prefersDark ? 'dark' : 'light') : preference

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      theme,
      setPreference,
      toggle: () => setPreference(theme === 'dark' ? 'light' : 'dark'),
    }),
    [preference, theme, setPreference],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}
