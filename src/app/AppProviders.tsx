import { QueryClientProvider } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { ApiProvider, createQueryClient } from '@/api'
import type { PetstoreApi } from '@/api'
import { ConfirmProvider, ToastProvider } from '@/design-system'
import { FavoritesProvider } from '@/features/pets/FavoritesProvider'
import { PreferencesProvider, preferencesStore } from '@/features/preferences/PreferencesProvider'
import { ThemeProvider } from '@/features/preferences/ThemeProvider'
import { SessionProvider } from '@/features/session/SessionProvider'
import { CartProvider } from '@/features/store/CartProvider'

interface AppProvidersProps {
  children: ReactNode
  /** Overrides for tests. */
  api?: PetstoreApi
  queryClient?: QueryClient
}

const getApiKey = () => preferencesStore.get().apiKey || undefined

/**
 * Every provider the app needs, outermost first. Order matters: the session
 * needs the API and the query cache, and features need toasts.
 */
export function AppProviders({ children, api, queryClient }: AppProvidersProps) {
  const [defaultQueryClient] = useState(createQueryClient)

  return (
    <ThemeProvider>
      <PreferencesProvider>
        <QueryClientProvider client={queryClient ?? defaultQueryClient}>
          <ApiProvider api={api} getApiKey={getApiKey}>
            <ToastProvider>
              <ConfirmProvider>
                <SessionProvider>
                  <FavoritesProvider>
                    <CartProvider>{children}</CartProvider>
                  </FavoritesProvider>
                </SessionProvider>
              </ConfirmProvider>
            </ToastProvider>
          </ApiProvider>
          {import.meta.env.DEV ? <ReactQueryDevtools buttonPosition="bottom-right" /> : null}
        </QueryClientProvider>
      </PreferencesProvider>
    </ThemeProvider>
  )
}
