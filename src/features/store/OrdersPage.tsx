import { Receipt, Search } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'

import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Inline,
  Input,
  LinkButton,
  PageHeader,
} from '@/design-system'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { useOrderHistory } from './orderHistory'
import { OrdersTable } from './OrdersTable'
import { useOrders } from './storeQueries'

export function OrdersPage() {
  useDocumentTitle('Orders')

  const navigate = useNavigate()
  const orderIds = useOrderHistory()
  const entries = useOrders(orderIds)
  const [lookup, setLookup] = useState('')

  const onLookup = (event: FormEvent) => {
    event.preventDefault()

    const orderId = lookup.trim()

    if (/^\d+$/.test(orderId)) void navigate(`/orders/${orderId}`)
  }

  return (
    <>
      <PageHeader
        title="Orders"
        description="Orders placed or looked up in this browser. The API cannot list every order."
        actions={
          <form onSubmit={onLookup}>
            <Inline gap={2}>
              <Input
                aria-label="Order ID"
                placeholder="Look up an order ID"
                inputMode="numeric"
                leading={<Search />}
                value={lookup}
                onChange={(event) => setLookup(event.target.value)}
              />
              <Button type="submit" disabled={!/^\d+$/.test(lookup.trim())}>
                Find
              </Button>
            </Inline>
          </form>
        }
      />

      {entries.length === 0 ? (
        <EmptyState
          icon={<Receipt />}
          title="No orders yet"
          description="Add a pet to your cart and check out to place your first order."
          action={
            <LinkButton to="/pets?status=available" variant="primary">
              Browse available pets
            </LinkButton>
          }
        />
      ) : (
        <Card>
          <CardHeader title="Your orders" description="Newest first." />
          <OrdersTable entries={entries} />
        </Card>
      )}
    </>
  )
}
