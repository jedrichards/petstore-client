import type { PetStatus } from '@/api'
import { Badge } from '@/design-system'

import { petStatusLabels, petStatusTones } from './petPresentation'

export function PetStatusBadge({ status }: { status: PetStatus | undefined }) {
  if (!status) return <Badge>Unlisted</Badge>

  return (
    <Badge tone={petStatusTones[status]} dot>
      {petStatusLabels[status]}
    </Badge>
  )
}
