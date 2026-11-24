import { createContext, use, useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'

import type { Pet } from '@/api'
import { createStoredState } from '@/lib/storedState'

export interface CartLine {
  petId: number
  /** Kept with the line so the cart renders without refetching every pet. */
  name: string
  quantity: number
}

type CartAction =
  | { type: 'add'; pet: Pick<Pet, 'id' | 'name'> }
  | { type: 'setQuantity'; petId: number; quantity: number }
  | { type: 'remove'; petId: number }
  | { type: 'clear' }

export const MAX_QUANTITY = 99

export function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'add': {
      const existing = lines.find((line) => line.petId === action.pet.id)

      if (existing) {
        return lines.map((line) =>
          line === existing
            ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + 1) }
            : line,
        )
      }

      return [...lines, { petId: action.pet.id, name: action.pet.name, quantity: 1 }]
    }

    case 'setQuantity': {
      const quantity = Math.max(1, Math.min(MAX_QUANTITY, Math.round(action.quantity) || 1))

      return lines.map((line) => (line.petId === action.petId ? { ...line, quantity } : line))
    }

    case 'remove':
      return lines.filter((line) => line.petId !== action.petId)

    case 'clear':
      return []
  }
}

interface CartContextValue {
  lines: ReadonlyArray<CartLine>
  /** Total quantity across every line. */
  itemCount: number
  has: (petId: number) => boolean
  add: (pet: Pick<Pet, 'id' | 'name'>) => void
  setQuantity: (petId: number, quantity: number) => void
  remove: (petId: number) => void
  clear: () => void
}

export const cartStore = createStoredState<CartLine[]>('pawprint:cart', [], {
  parse: (raw) => (Array.isArray(raw) ? (raw as CartLine[]) : []),
})

const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const context = use(CartContext)

  if (!context) throw new Error('useCart must be used inside a CartProvider')

  return context
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, undefined, cartStore.get)

  useEffect(() => {
    cartStore.set(lines)
  }, [lines])

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      itemCount: lines.reduce((total, line) => total + line.quantity, 0),
      has: (petId) => lines.some((line) => line.petId === petId),
      add: (pet) => dispatch({ type: 'add', pet }),
      setQuantity: (petId, quantity) => dispatch({ type: 'setQuantity', petId, quantity }),
      remove: (petId) => dispatch({ type: 'remove', petId }),
      clear: () => dispatch({ type: 'clear' }),
    }),
    [lines],
  )

  return <CartContext value={value}>{children}</CartContext>
}
