import type { Pet, PetStatus } from '@/api'
import type { Tone } from '@/design-system'

export const petStatusLabels: Record<PetStatus, string> = {
  available: 'Available',
  pending: 'Pending',
  sold: 'Sold',
}

export const petStatusTones: Record<PetStatus, Tone> = {
  available: 'success',
  pending: 'warning',
  sold: 'neutral',
}

/** The first photo that is a real web address. Much of the demo data is not. */
export function primaryPhotoUrl(pet: Pick<Pet, 'photoUrls'>): string | undefined {
  return pet.photoUrls.find(isWebUrl)
}

export function isWebUrl(value: string): boolean {
  try {
    const url = new URL(value)

    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export type PetSort = 'name' | 'newest' | 'oldest'

export interface PetFilter {
  query: string
  category: string
  status?: PetStatus
  sort: PetSort
}

/** Filters and sorts a loaded list of pets. Pure, so it is easy to test. */
export function filterPets(pets: ReadonlyArray<Pet>, filter: PetFilter): Pet[] {
  const query = filter.query.trim().toLowerCase()

  const matches = pets.filter((pet) => {
    if (filter.status && pet.status !== filter.status) return false
    if (filter.category && pet.category?.name.toLowerCase() !== filter.category.toLowerCase()) {
      return false
    }

    if (query === '') return true

    return (
      pet.name.toLowerCase().includes(query) ||
      String(pet.id).includes(query) ||
      pet.tags.some((tag) => tag.name.toLowerCase().includes(query))
    )
  })

  switch (filter.sort) {
    case 'name':
      return matches.sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id)
    case 'newest':
      return matches.sort((a, b) => b.id - a.id)
    case 'oldest':
      return matches.sort((a, b) => a.id - b.id)
  }
}

/** The distinct category names in a list, ignoring case, sorted. */
export function categoriesOf(pets: ReadonlyArray<Pet>): string[] {
  const byKey = new Map<string, string>()

  for (const pet of pets) {
    const name = pet.category?.name

    if (name && !byKey.has(name.toLowerCase())) byKey.set(name.toLowerCase(), name)
  }

  return [...byKey.values()].sort((a, b) => a.localeCompare(b))
}
