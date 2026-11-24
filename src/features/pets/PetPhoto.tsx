import { useState } from 'react'

import type { Pet } from '@/api'
import { cx } from '@/lib/cx'

import styles from './PetPhoto.module.css'
import { primaryPhotoUrl } from './petPresentation'
import { PetPortrait } from './PetPortrait'

export interface PetPhotoProps {
  /** Only the id is required, so a cart line can show its pet too. */
  pet: Pick<Pet, 'id'> & Partial<Pick<Pet, 'category' | 'photoUrls'>>
  size?: 'sm' | 'md' | 'lg' | 'fill'
  className?: string
}

/**
 * A pet's picture. The generated portrait is always drawn, and a real photo
 * paints over it once it loads, so a slow or broken address never shows a gap.
 */
export function PetPhoto({ pet, size = 'md', className }: PetPhotoProps) {
  const src = primaryPhotoUrl({ photoUrls: pet.photoUrls ?? [] })
  const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined)

  return (
    <span className={cx(styles.photo, styles[size], className)}>
      <PetPortrait seed={pet.id} category={pet.category?.name} />
      {src !== undefined && src !== failedSrc ? (
        <img
          className={styles.image}
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src)}
        />
      ) : null}
    </span>
  )
}
