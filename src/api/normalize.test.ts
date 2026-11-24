import { describe, expect, it } from 'vitest'

import { normalizeOrder, normalizePet, normalizePets } from './normalize'

describe('normalizePet', () => {
  it('repairs the malformed records the shared server holds', () => {
    const pet = normalizePet({
      id: 7,
      name: '  ',
      status: 'adopted',
      category: { id: 1 },
      tags: [{ id: 1, name: 'calm' }, { id: 2 }, { id: 3, name: 'calm' }, null],
      photoUrls: ['https://example.com/a.png', '', 42],
    })

    expect(pet).toEqual({
      id: 7,
      name: 'Unnamed pet',
      status: undefined,
      category: undefined,
      tags: [{ id: 1, name: 'calm' }],
      photoUrls: ['https://example.com/a.png'],
    })
  })

  it('survives a response that is not an object', () => {
    expect(normalizePet('nope').name).toBe('Unnamed pet')
  })
})

describe('normalizePets', () => {
  it('drops repeated pets and tolerates a non-list response', () => {
    expect(
      normalizePets([
        { id: 1, name: 'A' },
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ]),
    ).toHaveLength(2)
    expect(normalizePets({ message: 'error' })).toEqual([])
  })
})

describe('normalizeOrder', () => {
  it('defaults missing fields', () => {
    expect(normalizeOrder({ id: 5, petId: 9, status: 'shipped' })).toEqual({
      id: 5,
      petId: 9,
      quantity: 1,
      shipDate: undefined,
      status: undefined,
      complete: false,
    })
  })
})
