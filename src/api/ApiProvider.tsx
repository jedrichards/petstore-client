import { createContext, use, useMemo } from 'react'
import type { ReactNode } from 'react'

import { createPetstoreApi } from './petstoreApi'
import type { PetstoreApi } from './petstoreApi'

export const DEFAULT_API_URL =
  import.meta.env.VITE_PETSTORE_API_URL ?? 'https://petstore3.swagger.io/api/v3'

const ApiContext = createContext<PetstoreApi | null>(null)

/** The API client for the current tree. Tests provide a fake through ApiProvider. */
export function useApi(): PetstoreApi {
  const api = use(ApiContext)

  if (!api) throw new Error('useApi must be used inside an ApiProvider')

  return api
}

interface ApiProviderProps {
  /** A ready-made client, used by tests. */
  api?: PetstoreApi
  baseUrl?: string
  getApiKey?: () => string | undefined
  children: ReactNode
}

export function ApiProvider({
  api,
  baseUrl = DEFAULT_API_URL,
  getApiKey,
  children,
}: ApiProviderProps) {
  const value = useMemo(
    () => api ?? createPetstoreApi({ baseUrl, getApiKey }),
    [api, baseUrl, getApiKey],
  )

  return <ApiContext value={value}>{children}</ApiContext>
}
