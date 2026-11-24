import { QueryClient } from '@tanstack/react-query'

import { ApiError } from './client'

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        // The demo server fails at random, so retry, but never a client error.
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.isClientError) return false

          return failureCount < 2
        },
      },
      mutations: {
        retry: false,
      },
    },
  })
}
