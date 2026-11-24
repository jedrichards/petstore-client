import { createContext, use, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'

import { createStoredState, useStoredState } from '@/lib/storedState'

export const pageSizes = [12, 24, 48] as const
export type PageSize = (typeof pageSizes)[number]

export type PetView = 'grid' | 'table'

export interface Preferences {
  /** Sent as the api_key header on every request. */
  apiKey: string
  pageSize: PageSize
  petView: PetView
  /** Marks a pet as pending when an order for it is placed. */
  reserveOnOrder: boolean
}

const defaults: Preferences = {
  apiKey: 'special-key',
  pageSize: 24,
  petView: 'grid',
  reserveOnOrder: true,
}

export const preferencesStore = createStoredState<Preferences>('pawprint:preferences', defaults, {
  // Stored preferences may predate a newer field, so fill gaps from defaults.
  parse: (raw) => ({ ...defaults, ...(typeof raw === 'object' && raw !== null ? raw : {}) }),
})

interface PreferencesContextValue {
  preferences: Preferences
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void
  resetPreferences: () => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function usePreferences(): PreferencesContextValue {
  const context = use(PreferencesContext)

  if (!context) throw new Error('usePreferences must be used inside a PreferencesProvider')

  return context
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useStoredState(preferencesStore)

  const setPreference = useCallback<PreferencesContextValue['setPreference']>(
    (key, value) => setPreferences((previous) => ({ ...previous, [key]: value })),
    [setPreferences],
  )

  const value = useMemo<PreferencesContextValue>(
    () => ({ preferences, setPreference, resetPreferences: preferencesStore.reset }),
    [preferences, setPreference],
  )

  return <PreferencesContext value={value}>{children}</PreferencesContext>
}
