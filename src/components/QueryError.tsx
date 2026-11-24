import { RotateCw } from 'lucide-react'

import { describeError } from '@/api'
import { Alert, Button } from '@/design-system'

interface QueryErrorProps {
  title: string
  error: unknown
  onRetry?: () => void
}

/** The standard way to show a failed query, with a retry. */
export function QueryError({ title, error, onRetry }: QueryErrorProps) {
  return (
    <Alert
      tone="danger"
      title={title}
      action={
        onRetry ? (
          <Button size="sm" iconStart={<RotateCw />} onClick={onRetry}>
            Try again
          </Button>
        ) : undefined
      }
    >
      {describeError(error)}
    </Alert>
  )
}
