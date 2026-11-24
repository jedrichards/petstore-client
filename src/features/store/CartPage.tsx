import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import {
  Alert,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  EmptyState,
  IconButton,
  Inline,
  LinkButton,
  PageHeader,
  Stack,
  Switch,
  Text,
} from '@/design-system'
import { PetPhoto } from '@/features/pets/PetPhoto'
import { usePreferences } from '@/features/preferences/PreferencesProvider'
import { useSession } from '@/features/session/SessionProvider'
import { pluralize } from '@/lib/format'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import styles from './CartPage.module.css'
import { MAX_QUANTITY, useCart } from './CartProvider'
import type { CheckoutResult } from './storeQueries'
import { useCheckout } from './storeQueries'

export function CartPage() {
  useDocumentTitle('Cart')

  const cart = useCart()
  const { session } = useSession()
  const { preferences, setPreference } = usePreferences()
  const checkout = useCheckout()
  const [result, setResult] = useState<CheckoutResult | null>(null)

  const onCheckout = () => {
    checkout.mutate(cart.lines, {
      onSuccess: (outcome) => {
        setResult(outcome)

        // Keep the lines that failed so they can be retried.
        for (const order of outcome.placed) cart.remove(order.petId)
      },
    })
  }

  return (
    <>
      <PageHeader
        title="Cart"
        description="Each pet becomes its own order, because a Petstore order holds one pet."
      />

      {result && result.placed.length > 0 ? (
        <Alert
          tone="success"
          title={`${pluralize(result.placed.length, 'order')} placed`}
          action={
            <LinkButton to="/orders" size="sm">
              View orders
            </LinkButton>
          }
        >
          <Inline gap={2} wrap>
            {result.placed.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className={styles.orderLink}>
                #{order.id}
              </Link>
            ))}
          </Inline>
        </Alert>
      ) : null}

      {result && result.failed.length > 0 ? (
        <Alert tone="danger" title="Some pets could not be ordered">
          <ul>
            {result.failed.map(({ line, reason }) => (
              <li key={line.petId}>
                {line.name}: {reason}
              </li>
            ))}
          </ul>
        </Alert>
      ) : null}

      {cart.lines.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag />}
          title="Your cart is empty"
          description="Add an available pet to place an order."
          action={
            <LinkButton to="/pets?status=available" variant="primary">
              Browse available pets
            </LinkButton>
          }
        />
      ) : (
        <div className={styles.layout}>
          <Card>
            <CardHeader
              title={pluralize(cart.lines.length, 'pet')}
              actions={
                <Button variant="ghost" size="sm" onClick={cart.clear}>
                  Empty cart
                </Button>
              }
            />
            <ul>
              {cart.lines.map((line) => (
                <li key={line.petId} className={styles.line}>
                  <PetPhoto pet={{ id: line.petId }} />
                  <div className={styles.lineText}>
                    <Link to={`/pets/${line.petId}`} className={styles.lineName}>
                      {line.name}
                    </Link>
                    <Text size="sm" tone="subtle" mono>
                      #{line.petId}
                    </Text>
                  </div>

                  <div className={styles.stepper}>
                    <IconButton
                      label={`Decrease quantity of ${line.name}`}
                      size="sm"
                      disabled={line.quantity <= 1}
                      onClick={() => cart.setQuantity(line.petId, line.quantity - 1)}
                    >
                      <Minus />
                    </IconButton>
                    <span className={styles.quantity} aria-label={`Quantity ${line.quantity}`}>
                      {line.quantity}
                    </span>
                    <IconButton
                      label={`Increase quantity of ${line.name}`}
                      size="sm"
                      disabled={line.quantity >= MAX_QUANTITY}
                      onClick={() => cart.setQuantity(line.petId, line.quantity + 1)}
                    >
                      <Plus />
                    </IconButton>
                  </div>

                  <IconButton
                    label={`Remove ${line.name} from the cart`}
                    size="sm"
                    onClick={() => cart.remove(line.petId)}
                  >
                    <Trash2 />
                  </IconButton>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Summary" />
            <CardBody>
              <Stack gap={4}>
                <dl className={styles.summary}>
                  <dt>Orders to place</dt>
                  <dd>{cart.lines.length}</dd>
                  <dt>Total quantity</dt>
                  <dd>{cart.itemCount}</dd>
                  <dt>Ordering as</dt>
                  <dd>{session ? session.username : 'Guest'}</dd>
                </dl>

                <Switch
                  checked={preferences.reserveOnOrder}
                  onCheckedChange={(checked) => setPreference('reserveOnOrder', checked)}
                  label="Reserve pets"
                  description="Mark each ordered pet as pending."
                />
              </Stack>
            </CardBody>
            <CardFooter>
              <Button variant="primary" fullWidth loading={checkout.isPending} onClick={onCheckout}>
                Place {pluralize(cart.lines.length, 'order')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  )
}
