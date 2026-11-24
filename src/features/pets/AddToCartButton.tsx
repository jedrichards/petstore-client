import { Check, ShoppingBag } from 'lucide-react'

import type { Pet } from '@/api'
import { Button } from '@/design-system'
import type { ButtonProps } from '@/design-system'
import { useCart } from '@/features/store/CartProvider'

interface AddToCartButtonProps extends Pick<ButtonProps, 'size' | 'variant' | 'fullWidth'> {
  pet: Pick<Pet, 'id' | 'name' | 'status'>
}

/** Adds an available pet to the cart. Other statuses cannot be ordered. */
export function AddToCartButton({ pet, variant = 'secondary', ...rest }: AddToCartButtonProps) {
  const cart = useCart()
  const inCart = cart.has(pet.id)

  if (pet.status !== 'available') {
    return (
      <Button variant={variant} disabled {...rest}>
        Not available
      </Button>
    )
  }

  return (
    <Button
      variant={inCart ? 'secondary' : variant}
      iconStart={inCart ? <Check /> : <ShoppingBag />}
      onClick={() => cart.add(pet)}
      {...rest}
    >
      {inCart ? 'In cart · add another' : 'Add to cart'}
    </Button>
  )
}
