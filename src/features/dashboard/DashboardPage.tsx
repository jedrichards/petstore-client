import { CircleCheck, Clock, Heart, PawPrint, Plus, Receipt, ShoppingBag, Tag } from 'lucide-react'
import { Link } from 'react-router'

import { petStatuses } from '@/api'
import {
  Alert,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Grid,
  Heading,
  LinkButton,
  PageHeader,
  Skeleton,
  Stack,
  StatTile,
} from '@/design-system'
import { useFavorites } from '@/features/pets/FavoritesProvider'
import { PetCard } from '@/features/pets/PetCard'
import { petStatusLabels } from '@/features/pets/petPresentation'
import { usePetsById, usePetsByStatus } from '@/features/pets/petQueries'
import { useSession } from '@/features/session/SessionProvider'
import { useCart } from '@/features/store/CartProvider'
import { useOrderHistory } from '@/features/store/orderHistory'
import { OrdersTable } from '@/features/store/OrdersTable'
import { useInventory, useOrders } from '@/features/store/storeQueries'
import { formatNumber } from '@/lib/format'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import styles from './DashboardPage.module.css'
import { InventoryBar } from './InventoryBar'

const RECENT_ORDERS = 5
const FEATURED_PETS = 4

export function DashboardPage() {
  useDocumentTitle(undefined)

  const { session } = useSession()
  const { itemCount } = useCart()
  const { favoriteIds } = useFavorites()
  const inventory = useInventory()
  const available = usePetsByStatus('available')
  const orderIds = useOrderHistory()
  const recentOrders = useOrders(orderIds.slice(0, RECENT_ORDERS))
  const favorites = usePetsById(favoriteIds.slice(0, FEATURED_PETS))

  const counts = inventory.data?.counts
  const total = inventory.data?.total ?? 0

  const share = (value: number | undefined) =>
    value !== undefined && total > 0 ? `${Math.round((value / total) * 100)}% of stock` : undefined

  // Favourites when there are any, otherwise the newest available pets.
  const showingFavorites = favoriteIds.length > 0

  const featured = showingFavorites
    ? favorites.pets
    : [...(available.data ?? [])].sort((a, b) => b.id - a.id).slice(0, FEATURED_PETS)

  const featuredLoading = showingFavorites ? favorites.isPending : available.isPending

  return (
    <>
      <PageHeader
        title={session ? `Welcome back, ${session.username}` : 'Welcome to Pawprint'}
        description="Your friendly neighbourhood pet shop, with live stock from the Swagger Petstore."
        actions={
          <>
            <LinkButton to="/pets">Browse pets</LinkButton>
            <LinkButton to="/pets/new" variant="primary" iconStart={<Plus />}>
              Add pet
            </LinkButton>
          </>
        }
      />

      {inventory.isError ? (
        <Alert tone="warning" title="Stock numbers are unavailable">
          The server could not report its inventory. The rest of the app still works.
        </Alert>
      ) : null}

      <Grid minColumnWidth={200}>
        <StatTile
          label="Available"
          value={counts ? formatNumber(counts.available) : '—'}
          detail={share(counts?.available)}
          icon={<CircleCheck />}
          tone="success"
          loading={inventory.isPending}
        />
        <StatTile
          label="Pending"
          value={counts ? formatNumber(counts.pending) : '—'}
          detail={share(counts?.pending)}
          icon={<Clock />}
          tone="warning"
          loading={inventory.isPending}
        />
        <StatTile
          label="Sold"
          value={counts ? formatNumber(counts.sold) : '—'}
          detail={share(counts?.sold)}
          icon={<Tag />}
          tone="neutral"
          loading={inventory.isPending}
        />
        <StatTile
          label="In your cart"
          value={formatNumber(itemCount)}
          detail={<Link to="/cart">Go to cart</Link>}
          icon={<ShoppingBag />}
          tone="accent"
        />
      </Grid>

      <Card>
        <CardHeader
          title="Stock by status"
          description={
            inventory.data?.source === 'derived'
              ? 'Counted from the pet lists, because the inventory endpoint is failing.'
              : 'From the store inventory endpoint.'
          }
        />
        <CardBody>
          {counts ? (
            <InventoryBar
              segments={petStatuses.map((status) => ({
                status,
                label: petStatusLabels[status],
                value: counts[status],
              }))}
            />
          ) : (
            <Skeleton height={44} />
          )}
        </CardBody>
      </Card>

      <div className={styles.columns}>
        <Stack gap={4}>
          <div className={styles.sectionHeading}>
            <Heading level={2} size="md">
              {showingFavorites ? 'Your favorites' : 'New arrivals'}
            </Heading>
            <Link
              to={showingFavorites ? '/favorites' : '/pets?sort=newest'}
              className={styles.more}
            >
              View all
            </Link>
          </div>

          {featuredLoading && featured.length === 0 ? (
            <Grid columns={2}>
              <Skeleton height={240} radius="lg" />
              <Skeleton height={240} radius="lg" />
            </Grid>
          ) : featured.length === 0 ? (
            <EmptyState
              icon={showingFavorites ? <Heart /> : <PawPrint />}
              title="Nothing to show yet"
              description="Add a pet to get the store started."
            />
          ) : (
            <Grid columns={2}>
              {featured.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </Grid>
          )}
        </Stack>

        <Card>
          <CardHeader
            title="Recent orders"
            actions={
              <Link to="/orders" className={styles.more}>
                View all
              </Link>
            }
          />
          {recentOrders.length > 0 ? (
            <OrdersTable entries={recentOrders} />
          ) : (
            <EmptyState
              plain
              icon={<Receipt />}
              title="No orders yet"
              description="Orders you place appear here."
            />
          )}
        </Card>
      </div>
    </>
  )
}
