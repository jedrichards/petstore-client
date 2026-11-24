import { createStoredState, useStoredState } from '@/lib/storedState'

/**
 * The API cannot list orders, so the app remembers the ids of the orders it
 * placed or looked up and fetches each one by id.
 */
export const orderHistoryStore = createStoredState<number[]>('pawprint:orders', [], {
  parse: (raw) =>
    Array.isArray(raw) ? raw.filter((id): id is number => typeof id === 'number') : [],
})

export function rememberOrders(orderIds: ReadonlyArray<number>): void {
  orderHistoryStore.set((current) => [...new Set([...orderIds, ...current])].slice(0, 50))
}

export function forgetOrder(orderId: number): void {
  orderHistoryStore.set((current) => current.filter((id) => id !== orderId))
}

export function useOrderHistory(): ReadonlyArray<number> {
  const [orderIds] = useStoredState(orderHistoryStore)

  return orderIds
}
