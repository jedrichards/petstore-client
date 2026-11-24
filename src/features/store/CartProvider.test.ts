import { describe, expect, it } from 'vitest'

import { cartReducer, MAX_QUANTITY } from './CartProvider'
import type { CartLine } from './CartProvider'

const biscuit = { id: 1, name: 'Biscuit' }

describe('cartReducer', () => {
  it('adds a line, then raises its quantity on a repeat add', () => {
    const once = cartReducer([], { type: 'add', pet: biscuit })
    const twice = cartReducer(once, { type: 'add', pet: biscuit })

    expect(once).toEqual([{ petId: 1, name: 'Biscuit', quantity: 1 }])
    expect(twice).toEqual([{ petId: 1, name: 'Biscuit', quantity: 2 }])
  })

  it('clamps a quantity to the allowed range', () => {
    const lines: CartLine[] = [{ petId: 1, name: 'Biscuit', quantity: 2 }]

    const quantityAfter = (quantity: number) =>
      cartReducer(lines, { type: 'setQuantity', petId: 1, quantity })[0]?.quantity

    expect(quantityAfter(0)).toBe(1)
    expect(quantityAfter(1000)).toBe(MAX_QUANTITY)
    expect(quantityAfter(Number.NaN)).toBe(1)
  })

  it('removes one line and clears all lines', () => {
    const lines: CartLine[] = [
      { petId: 1, name: 'Biscuit', quantity: 1 },
      { petId: 2, name: 'Mochi', quantity: 1 },
    ]

    expect(cartReducer(lines, { type: 'remove', petId: 1 })).toEqual([lines[1]])
    expect(cartReducer(lines, { type: 'clear' })).toEqual([])
  })
})
