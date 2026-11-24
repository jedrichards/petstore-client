import { Heart } from 'lucide-react'

import type { Pet } from '@/api'
import { IconButton } from '@/design-system'
import type { IconButtonProps } from '@/design-system'

import styles from './FavoriteButton.module.css'
import { useFavorites } from './FavoritesProvider'

interface FavoriteButtonProps extends Pick<IconButtonProps, 'size' | 'variant' | 'className'> {
  pet: Pick<Pet, 'id' | 'name'>
}

export function FavoriteButton({ pet, ...rest }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(pet.id)

  return (
    <IconButton
      label={favorite ? `Remove ${pet.name} from favorites` : `Add ${pet.name} to favorites`}
      pressed={favorite}
      onClick={() => toggleFavorite(pet.id)}
      {...rest}
    >
      <Heart className={favorite ? styles.filled : undefined} />
    </IconButton>
  )
}
