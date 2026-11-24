import { describe, expect, it } from 'vitest'

import { makePet } from '@/test/fakeApi'

import { categoriesOf, filterPets, primaryPhotoUrl } from './petPresentation'

const pets = [
  makePet({ id: 3, name: 'Mochi', category: { id: 2, name: 'Cats' } }),
  makePet({ id: 1, name: 'biscuit', tags: [{ id: 1, name: 'Friendly' }] }),
  makePet({ id: 2, name: 'Atlas', category: { id: 1, name: 'dogs' }, status: 'sold' }),
]

describe('filterPets', () => {
  it('matches the name, a tag or the id, ignoring case', () => {
    const names = (query: string) =>
      filterPets(pets, { query, category: '', sort: 'name' }).map((pet) => pet.name)

    expect(names('BISC')).toEqual(['biscuit'])
    expect(names('friendly')).toEqual(['biscuit'])
    expect(names('3')).toEqual(['Mochi'])
  })

  it('filters by category and status together', () => {
    const result = filterPets(pets, { query: '', category: 'Dogs', status: 'sold', sort: 'name' })

    expect(result.map((pet) => pet.name)).toEqual(['Atlas'])
  })

  it('sorts without changing the input', () => {
    const before = pets.map((pet) => pet.id)

    expect(
      filterPets(pets, { query: '', category: '', sort: 'newest' }).map((pet) => pet.id),
    ).toEqual([3, 2, 1])
    expect(
      filterPets(pets, { query: '', category: '', sort: 'name' }).map((pet) => pet.name),
    ).toEqual(['Atlas', 'biscuit', 'Mochi'])
    expect(pets.map((pet) => pet.id)).toEqual(before)
  })
})

describe('categoriesOf', () => {
  it('lists each category once, whatever its case', () => {
    expect(categoriesOf(pets)).toEqual(['Cats', 'Dogs'])
  })
})

describe('primaryPhotoUrl', () => {
  it('skips entries that are not web addresses', () => {
    expect(primaryPhotoUrl({ photoUrls: ['url1', 'https://example.com/a.png'] })).toBe(
      'https://example.com/a.png',
    )
    expect(primaryPhotoUrl({ photoUrls: ['string'] })).toBeUndefined()
  })
})
