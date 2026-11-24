import { createHttpClient } from './client'
import type { HttpClientOptions } from './client'
import {
  normalizeInventory,
  normalizeOrder,
  normalizePet,
  normalizePets,
  normalizeUser,
} from './normalize'
import type { LoginResult, Order, Pet, PetInput, PetStatus, User, UserInput } from './types'

/** Every Petstore v3 operation, typed and normalised. */
export function createPetstoreApi(options: HttpClientOptions) {
  const request = createHttpClient(options)

  return {
    pets: {
      async findByStatus(status: PetStatus, signal?: AbortSignal): Promise<Pet[]> {
        return normalizePets(await request('/pet/findByStatus', { query: { status }, signal }))
      },

      async findByTags(tags: ReadonlyArray<string>, signal?: AbortSignal): Promise<Pet[]> {
        return normalizePets(await request('/pet/findByTags', { query: { tags }, signal }))
      },

      async get(petId: number, signal?: AbortSignal): Promise<Pet> {
        return normalizePet(await request(`/pet/${petId}`, { signal }))
      },

      async create(pet: PetInput): Promise<Pet> {
        return normalizePet(await request('/pet', { method: 'POST', body: pet }))
      },

      async update(pet: PetInput): Promise<Pet> {
        return normalizePet(await request('/pet', { method: 'PUT', body: pet }))
      },

      /**
       * Changes the name or status without sending the whole pet. The spec
       * calls the name optional, but the server rejects a request without it.
       */
      async patch(petId: number, changes: { name: string; status?: PetStatus }): Promise<Pet> {
        return normalizePet(await request(`/pet/${petId}`, { method: 'POST', query: changes }))
      },

      async remove(petId: number): Promise<void> {
        await request(`/pet/${petId}`, { method: 'DELETE' })
      },

      async uploadImage(petId: number, file: Blob, additionalMetadata?: string): Promise<Pet> {
        return normalizePet(
          await request(`/pet/${petId}/uploadImage`, {
            method: 'POST',
            query: { additionalMetadata },
            body: file,
          }),
        )
      },
    },

    store: {
      async inventory(signal?: AbortSignal): Promise<Record<string, number>> {
        return normalizeInventory(await request('/store/inventory', { signal }))
      },

      async placeOrder(order: Order): Promise<Order> {
        return normalizeOrder(await request('/store/order', { method: 'POST', body: order }))
      },

      async getOrder(orderId: number, signal?: AbortSignal): Promise<Order> {
        return normalizeOrder(await request(`/store/order/${orderId}`, { signal }))
      },

      async deleteOrder(orderId: number): Promise<void> {
        await request(`/store/order/${orderId}`, { method: 'DELETE' })
      },
    },

    users: {
      async get(username: string, signal?: AbortSignal): Promise<User> {
        return normalizeUser(await request(`/user/${encodeURIComponent(username)}`, { signal }))
      },

      async create(user: UserInput): Promise<User> {
        return normalizeUser(await request('/user', { method: 'POST', body: user }))
      },

      async createMany(users: ReadonlyArray<UserInput>): Promise<void> {
        await request('/user/createWithList', { method: 'POST', body: users })
      },

      async update(username: string, user: UserInput): Promise<void> {
        await request(`/user/${encodeURIComponent(username)}`, { method: 'PUT', body: user })
      },

      async remove(username: string): Promise<void> {
        await request(`/user/${encodeURIComponent(username)}`, { method: 'DELETE' })
      },

      /** The API defines login as a GET with the credentials in the query. */
      async login(username: string, password: string): Promise<LoginResult> {
        const message = await request('/user/login', { query: { username, password } })
        const token = typeof message === 'string' ? (message.split(':').pop()?.trim() ?? '') : ''

        return { token }
      },

      async logout(): Promise<void> {
        await request('/user/logout')
      },
    },
  }
}

export type PetstoreApi = ReturnType<typeof createPetstoreApi>
