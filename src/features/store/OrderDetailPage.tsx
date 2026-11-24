import { Receipt, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { ApiError } from '@/api'
import { QueryError } from '@/components/QueryError'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DescriptionList,
  EmptyState,
  Inline,
  LinkButton,
  PageHeader,
  Skeleton,
  Stack,
  Text,
  useConfirm,
} from '@/design-system'
import { PetPhoto } from '@/features/pets/PetPhoto'
import { usePet } from '@/features/pets/petQueries'
import { PetStatusBadge } from '@/features/pets/PetStatusBadge'
import { formatDateTime } from '@/lib/format'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import styles from './OrderDetailPage.module.css'
import { rememberOrders } from './orderHistory'
import { OrderStatusBadge } from './orderPresentation'
import { useDeleteOrder, useOrder } from './storeQueries'

export function OrderDetailPage() {
  const orderId = Number(useParams().orderId)
  const navigate = useNavigate()
  const confirm = useConfirm()
  const order = useOrder(orderId)
  const deleteOrder = useDeleteOrder()

  useDocumentTitle(`Order #${orderId}`)

  // An order found by lookup joins the list, so it is easy to find again.
  const foundId = order.data?.id

  useEffect(() => {
    if (foundId !== undefined) rememberOrders([foundId])
  }, [foundId])

  const breadcrumbs = [{ label: 'Orders', to: '/orders' }, { label: `#${orderId}` }]

  if (!Number.isFinite(orderId) || (order.error instanceof ApiError && order.error.isNotFound)) {
    return (
      <EmptyState
        icon={<Receipt />}
        title="Order not found"
        description="No order has this ID. The demo server clears its data from time to time."
        action={
          <LinkButton to="/orders" variant="primary">
            Back to orders
          </LinkButton>
        }
      />
    )
  }

  if (order.isError) {
    return (
      <QueryError
        title="Could not load this order"
        error={order.error}
        onRetry={() => void order.refetch()}
      />
    )
  }

  if (!order.data) {
    return (
      <Stack gap={6} aria-busy aria-label="Loading order">
        <Skeleton width={220} height={28} />
        <Skeleton height={220} radius="lg" />
      </Stack>
    )
  }

  const data = order.data

  const onCancel = async () => {
    const confirmed = await confirm({
      title: `Cancel order #${data.id}?`,
      description: 'This deletes the order from the server. It cannot be undone.',
      confirmLabel: 'Cancel order',
      cancelLabel: 'Keep order',
      danger: true,
    })

    if (confirmed) deleteOrder.mutate(data.id, { onSuccess: () => void navigate('/orders') })
  }

  return (
    <>
      <PageHeader
        title={`Order #${data.id}`}
        meta={<OrderStatusBadge status={data.status} />}
        breadcrumbs={breadcrumbs}
        actions={
          <Button
            variant="danger"
            iconStart={<Trash2 />}
            loading={deleteOrder.isPending}
            onClick={() => void onCancel()}
          >
            Cancel order
          </Button>
        }
      />

      <div className={styles.layout}>
        <Card>
          <CardHeader title="Order" />
          <CardBody>
            <DescriptionList
              items={[
                { term: 'Order ID', detail: <Text mono>{data.id}</Text> },
                { term: 'Quantity', detail: data.quantity },
                { term: 'Ships', detail: formatDateTime(data.shipDate) },
                { term: 'Status', detail: <OrderStatusBadge status={data.status} /> },
                { term: 'Complete', detail: data.complete ? 'Yes' : 'No' },
              ]}
            />
          </CardBody>
        </Card>

        <OrderedPet petId={data.petId} />
      </div>
    </>
  )
}

function OrderedPet({ petId }: { petId: number }) {
  const pet = usePet(petId)

  return (
    <Card>
      <CardHeader title="Pet" />
      <CardBody>
        {pet.data ? (
          <Inline gap={3}>
            <PetPhoto pet={pet.data} size="lg" />
            <Stack gap={1}>
              <Link to={`/pets/${petId}`} className={styles.petName}>
                {pet.data.name}
              </Link>
              <Text size="sm" tone="muted">
                {pet.data.category?.name ?? 'Uncategorised'} · #{petId}
              </Text>
              <Inline>
                <PetStatusBadge status={pet.data.status} />
              </Inline>
            </Stack>
          </Inline>
        ) : pet.isError ? (
          <Text tone="muted">Pet #{petId} is no longer on the server.</Text>
        ) : (
          <Skeleton height={72} />
        )}
      </CardBody>
    </Card>
  )
}
