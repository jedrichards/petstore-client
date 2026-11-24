/**
 * The live demo server is shared and holds whatever other clients wrote, so
 * every response is treated as untrusted and repaired into the app's types.
 */

import { orderStatuses, petStatuses } from './types'
import type { Category, Order, OrderStatus, Pet, PetStatus, Tag, User } from './types'

type Json = Record<string, unknown>

function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asNamed(value: unknown): Category | undefined {
  if (!isRecord(value)) return undefined

  const name = asString(value.name).trim()

  return name === '' ? undefined : { id: asNumber(value.id), name }
}

export function normalizePet(raw: unknown): Pet {
  const source = isRecord(raw) ? raw : {}

  const status = petStatuses.find((candidate) => candidate === source.status) as
    PetStatus | undefined

  const tags = Array.isArray(source.tags)
    ? source.tags.map(asNamed).filter((tag): tag is Tag => tag !== undefined)
    : []

  const photoUrls = Array.isArray(source.photoUrls)
    ? source.photoUrls.filter((url): url is string => typeof url === 'string' && url !== '')
    : []

  return {
    id: asNumber(source.id),
    name: asString(source.name).trim() || 'Unnamed pet',
    category: asNamed(source.category),
    photoUrls,
    tags: dedupeBy(tags, (tag) => tag.name),
    status,
  }
}

export function normalizePets(raw: unknown): Pet[] {
  if (!Array.isArray(raw)) return []

  // The server returns the same pet several times when it matches several tags.
  return dedupeBy(raw.map(normalizePet), (pet) => pet.id)
}

export function normalizeOrder(raw: unknown): Order {
  const source = isRecord(raw) ? raw : {}

  const status = orderStatuses.find((candidate) => candidate === source.status) as
    OrderStatus | undefined

  return {
    id: asNumber(source.id),
    petId: asNumber(source.petId),
    quantity: asNumber(source.quantity, 1),
    shipDate: typeof source.shipDate === 'string' ? source.shipDate : undefined,
    status,
    complete: source.complete === true,
  }
}

export function normalizeUser(raw: unknown): User {
  const source = isRecord(raw) ? raw : {}

  return {
    id: asNumber(source.id),
    username: asString(source.username),
    firstName: asString(source.firstName),
    lastName: asString(source.lastName),
    email: asString(source.email),
    phone: asString(source.phone),
    userStatus: asNumber(source.userStatus),
  }
}

export function normalizeInventory(raw: unknown): Record<string, number> {
  if (!isRecord(raw)) return {}

  const inventory: Record<string, number> = {}

  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'number') inventory[key] = value
  }

  return inventory
}

function dedupeBy<T, K>(items: T[], keyOf: (item: T) => K): T[] {
  const seen = new Set<K>()

  return items.filter((item) => {
    const key = keyOf(item)

    if (seen.has(key)) return false

    seen.add(key)

    return true
  })
}
