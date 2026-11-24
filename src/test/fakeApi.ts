import { ApiError } from '@/api'
import type { Order, Pet, PetstoreApi, User } from '@/api'

export function makePet(overrides: Partial<Pet> = {}): Pet {
  return {
    id: 1,
    name: 'Biscuit',
    category: { id: 1, name: 'Dogs' },
    photoUrls: [],
    tags: [],
    status: 'available',
    ...overrides,
  }
}

interface FakeData {
  pets?: Pet[]
  orders?: Order[]
  users?: User[]
}

/** An in-memory Petstore that behaves like the real one, quirks included. */
export function createFakeApi(seed: FakeData = {}): PetstoreApi {
  const pets = new Map((seed.pets ?? []).map((pet) => [pet.id, pet]))
  const orders = new Map((seed.orders ?? []).map((order) => [order.id, order]))
  const users = new Map((seed.users ?? []).map((user) => [user.username, user]))

  const findPet = (petId: number): Pet => {
    const pet = pets.get(petId)

    if (!pet) throw new ApiError(404, 'Pet not found', 'Pet not found')

    return pet
  }

  return {
    pets: {
      findByStatus: async (status) => [...pets.values()].filter((pet) => pet.status === status),
      findByTags: async (tags) =>
        [...pets.values()].filter((pet) => pet.tags.some((tag) => tags.includes(tag.name))),
      get: async (petId) => findPet(petId),
      create: async (pet) => {
        pets.set(pet.id, pet)

        return pet
      },
      update: async (pet) => {
        findPet(pet.id)
        pets.set(pet.id, pet)

        return pet
      },
      patch: async (petId, changes) => {
        const next = { ...findPet(petId), ...changes }

        pets.set(petId, next)

        return next
      },
      remove: async (petId) => {
        pets.delete(petId)
      },
      uploadImage: async (petId) => findPet(petId),
    },
    store: {
      // The live endpoint fails, so the fake does too: the app must cope.
      inventory: async () => {
        throw new ApiError(500, 'The Petstore server hit an error. Try again shortly.', null)
      },
      placeOrder: async (order) => {
        orders.set(order.id, order)

        return order
      },
      getOrder: async (orderId) => {
        const order = orders.get(orderId)

        if (!order) throw new ApiError(404, 'Order not found', 'Order not found')

        return order
      },
      deleteOrder: async (orderId) => {
        orders.delete(orderId)
      },
    },
    users: {
      get: async (username) => {
        const user = users.get(username)

        if (!user) throw new ApiError(500, 'The Petstore server hit an error.', null)

        return user
      },
      create: async ({ password: _password, ...user }) => {
        users.set(user.username, user)

        return user
      },
      createMany: async () => {},
      update: async (username, { password: _password, ...user }) => {
        users.delete(username)
        users.set(user.username, user)
      },
      remove: async (username) => {
        users.delete(username)
      },
      login: async () => ({ token: 'test-session' }),
      logout: async () => {},
    },
  }
}
