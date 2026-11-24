import { describe, expect, it } from 'vitest'

import { portraitTraits, species, speciesForCategory } from './portraitTraits'

describe('portraitTraits', () => {
  it('draws the same portrait for the same pet every time', () => {
    expect(portraitTraits(42, 'Dogs')).toEqual(portraitTraits(42, 'Dogs'))
  })

  it('gives different pets different portraits', () => {
    const looks = new Set(
      Array.from({ length: 40 }, (_, id) => {
        const traits = portraitTraits(id)

        return [traits.species, traits.fur.base, traits.accessory, traits.backdrop].join('|')
      }),
    )

    expect(looks.size).toBeGreaterThan(20)
  })

  it('takes the species from the category when it names one', () => {
    expect(portraitTraits(1, 'Dogs').species).toBe('dog')
    expect(portraitTraits(1, 'house cats').species).toBe('cat')
    expect(portraitTraits(1, 'Bunnies').species).toBe('rabbit')
    expect(speciesForCategory('Reptiles')).toBeUndefined()
    expect(species).toContain(portraitTraits(1, 'Reptiles').species)
  })

  it('never puts a hat on a rabbit, whose ears are in the way', () => {
    const accessories = Array.from(
      { length: 60 },
      (_, id) => portraitTraits(id, 'Rabbits').accessory,
    )

    expect(accessories).not.toContain('partyHat')
    expect(accessories).not.toContain('crown')
  })
})
