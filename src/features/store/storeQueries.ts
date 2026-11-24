import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'

import { describeError, petStatuses, queryKeys, useApi } from '@/api'
import type { Inventory, Order, PetstoreApi } from '@/api'
import { useToast } from '@/design-system'
import { petsByStatusOptions } from '@/features/pets/petQueries'
import { usePreferences } from '@/features/preferences/PreferencesProvider'
import { generateId } from '@/lib/ids'

import type { CartLine } from './CartProvider'
import { forgetOrder, rememberOrders } from './orderHistory'

export interface InventorySummary {
  counts: Inventory
  total: number
  /** Whether the counts came from the inventory endpoint or from counting pets. */
  source: 'inventory' | 'derived'
}

/**
 * Stock by status. The inventory endpoint on the demo server fails often, so
 * when it does the counts are derived from the three status lists instead.
 */
export function useInventory() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: queryKeys.store.inventory(),
    queryFn: async ({ signal }): Promise<InventorySummary> => {
      try {
        const raw = await api.store.inventory(signal)

        return summarize(
          { available: raw.available ?? 0, pending: raw.pending ?? 0, sold: raw.sold ?? 0 },
          'inventory',
        )
      } catch (error) {
        if (signal.aborted) throw error

        const lists = await Promise.all(
          petStatuses.map((status) => queryClient.fetchQuery(petsByStatusOptions(api, status))),
        )

        return summarize(
          {
            available: lists[0]?.length ?? 0,
            pending: lists[1]?.length ?? 0,
            sold: lists[2]?.length ?? 0,
          },
          'derived',
        )
      }
    },
    retry: false,
  })
}

function summarize(counts: Inventory, source: InventorySummary['source']): InventorySummary {
  return { counts, total: counts.available + counts.pending + counts.sold, source }
}

function orderOptions(api: PetstoreApi, orderId: number) {
  return {
    queryKey: queryKeys.store.order(orderId),
    queryFn: ({ signal }: { signal: AbortSignal }) => api.store.getOrder(orderId, signal),
  }
}

export function useOrder(orderId: number) {
  const api = useApi()

  return useQuery({ ...orderOptions(api, orderId), enabled: Number.isFinite(orderId) })
}

export interface OrderEntry {
  orderId: number
  order: Order | undefined
  isPending: boolean
  isMissing: boolean
}

/** Fetches every remembered order in parallel, keeping the remembered sequence. */
export function useOrders(orderIds: ReadonlyArray<number>): OrderEntry[] {
  const api = useApi()

  return useQueries({
    queries: orderIds.map((orderId) => ({ ...orderOptions(api, orderId), retry: false })),
    combine: (results) =>
      results.map((result, index) => ({
        orderId: orderIds[index] ?? 0,
        order: result.data,
        isPending: result.isPending,
        isMissing: result.isError,
      })),
  })
}

export interface CheckoutResult {
  placed: Order[]
  failed: Array<{ line: CartLine; reason: string }>
}

/**
 * Places one order per cart line, since an API order holds a single pet.
 * Lines succeed or fail on their own, so one bad pet does not sink the rest.
 */
export function useCheckout() {
  const api = useApi()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { preferences } = usePreferences()

  return useMutation({
    mutationFn: async (lines: ReadonlyArray<CartLine>): Promise<CheckoutResult> => {
      const shipDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()

      const outcomes = await Promise.allSettled(
        lines.map((line) =>
          api.store.placeOrder({
            id: generateId(),
            petId: line.petId,
            quantity: line.quantity,
            shipDate,
            status: 'placed',
            complete: false,
          }),
        ),
      )

      const result: CheckoutResult = { placed: [], failed: [] }
      const placedLines: CartLine[] = []

      outcomes.forEach((outcome, index) => {
        const line = lines[index]

        if (!line) return

        if (outcome.status === 'fulfilled') {
          result.placed.push(outcome.value)
          placedLines.push(line)
        } else {
          result.failed.push({ line, reason: describeError(outcome.reason) })
        }
      })

      if (preferences.reserveOnOrder) {
        // Best effort: an order still stands if its pet cannot be reserved.
        await Promise.allSettled(
          placedLines.map((line) =>
            api.pets.patch(line.petId, { name: line.name, status: 'pending' }),
          ),
        )
      }

      return result
    },

    onSuccess: (result) => {
      for (const order of result.placed) {
        queryClient.setQueryData(queryKeys.store.order(order.id), order)
      }

      rememberOrders(result.placed.map((order) => order.id))

      if (result.failed.length > 0) {
        toast.error(
          'Some orders failed',
          `${result.failed.length} of ${result.placed.length + result.failed.length} could not be placed.`,
        )
      }

      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.pets.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.store.inventory() }),
      ])
    },

    onError: (error) => toast.error('Checkout failed', describeError(error)),
  })
}

export function useDeleteOrder() {
  const api = useApi()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (orderId: number) => api.store.deleteOrder(orderId),
    onSuccess: (_result, orderId) => {
      forgetOrder(orderId)
      queryClient.removeQueries({ queryKey: queryKeys.store.order(orderId) })
      toast.success('Order cancelled', `Order #${orderId} was deleted.`)
    },
    onError: (error) => toast.error('Could not cancel the order', describeError(error)),
  })
}
