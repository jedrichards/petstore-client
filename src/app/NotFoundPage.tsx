import { Compass } from 'lucide-react'

import { EmptyState, LinkButton } from '@/design-system'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('Page not found')

  return (
    <EmptyState
      icon={<Compass />}
      title="Page not found"
      description="That address does not match anything in the app."
      action={
        <LinkButton to="/" variant="primary">
          Back to the dashboard
        </LinkButton>
      }
    />
  )
}
