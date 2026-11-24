import { isRouteErrorResponse, useRouteError } from 'react-router'

import { Alert, Button, Stack } from '@/design-system'

import { NotFoundPage } from './NotFoundPage'

/** Shown when a route fails to load or throws while rendering. */
export function RouteErrorPage() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />

  const message = error instanceof Error ? error.message : 'An unexpected error occurred.'

  return (
    <Stack gap={4}>
      <Alert
        tone="danger"
        title="This page failed to load"
        action={
          <Button size="sm" onClick={() => window.location.reload()}>
            Reload
          </Button>
        }
      >
        {message}
      </Alert>
    </Stack>
  )
}
