import type { PetStatus } from './types'

/** One place that names every cached query, so invalidation stays consistent. */
export const queryKeys = {
  pets: {
    all: ['pets'] as const,
    lists: () => [...queryKeys.pets.all, 'list'] as const,
    byStatus: (status: PetStatus) => [...queryKeys.pets.lists(), 'status', status] as const,
    byTags: (tags: ReadonlyArray<string>) =>
      [...queryKeys.pets.lists(), 'tags', [...tags].sort()] as const,
    details: () => [...queryKeys.pets.all, 'detail'] as const,
    detail: (petId: number) => [...queryKeys.pets.details(), petId] as const,
  },
  store: {
    all: ['store'] as const,
    inventory: () => [...queryKeys.store.all, 'inventory'] as const,
    orders: () => [...queryKeys.store.all, 'order'] as const,
    order: (orderId: number) => [...queryKeys.store.orders(), orderId] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (username: string) => [...queryKeys.users.all, username] as const,
  },
}
