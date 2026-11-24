import type { OrderStatus } from '@/api'
import { Badge } from '@/design-system'
import type { Tone } from '@/design-system'
import { titleCase } from '@/lib/format'

const orderStatusTones: Record<OrderStatus, Tone> = {
  placed: 'info',
  approved: 'highlight',
  delivered: 'success',
}

export function OrderStatusBadge({ status }: { status: OrderStatus | undefined }) {
  if (!status) return <Badge>Unknown</Badge>

  return (
    <Badge tone={orderStatusTones[status]} dot>
      {titleCase(status)}
    </Badge>
  )
}
