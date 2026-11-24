import { Link } from 'react-router'

import { Skeleton, Table, Td, Text, Th } from '@/design-system'
import { formatDate } from '@/lib/format'

import { OrderStatusBadge } from './orderPresentation'
import styles from './OrdersTable.module.css'
import type { OrderEntry } from './storeQueries'

export function OrdersTable({ entries }: { entries: ReadonlyArray<OrderEntry> }) {
  return (
    <Table caption="Orders">
      <thead>
        <tr>
          <Th>Order</Th>
          <Th>Pet</Th>
          <Th align="end">Quantity</Th>
          <Th>Ships</Th>
          <Th>Status</Th>
        </tr>
      </thead>
      <tbody>
        {entries.map(({ orderId, order, isPending, isMissing }) => (
          <tr key={orderId}>
            <Td>
              <Link to={`/orders/${orderId}`} className={styles.link}>
                #{orderId}
              </Link>
            </Td>
            {order ? (
              <>
                <Td>
                  <Link to={`/pets/${order.petId}`} className={styles.link}>
                    #{order.petId}
                  </Link>
                </Td>
                <Td align="end">{order.quantity}</Td>
                <Td>{formatDate(order.shipDate)}</Td>
                <Td>
                  <OrderStatusBadge status={order.status} />
                </Td>
              </>
            ) : isPending ? (
              <Td colSpan={4}>
                <Skeleton width="70%" />
              </Td>
            ) : (
              <Td colSpan={4}>
                <Text size="sm" tone="subtle">
                  {isMissing ? 'No longer on the server' : '—'}
                </Text>
              </Td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
