import { QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'

import type { PetstoreApi } from '@/api'
import { AppProviders } from '@/app/AppProviders'
import { routes } from '@/app/router'

interface RenderAppOptions {
  path?: string
  api: PetstoreApi
}

/** Renders the whole app at a path, against a fake API. */
export function renderApp({ path = '/', api }: RenderAppOptions) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  })

  const router = createMemoryRouter(routes, { initialEntries: [path] })

  const view = render(
    <AppProviders api={api} queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>,
  )

  return { ...view, router, queryClient, user: userEvent.setup() }
}
