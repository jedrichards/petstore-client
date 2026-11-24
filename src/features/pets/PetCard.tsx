import { Link } from 'react-router'

import type { Pet } from '@/api'
import { Badge, Card, Text } from '@/design-system'

import { AddToCartButton } from './AddToCartButton'
import { FavoriteButton } from './FavoriteButton'
import styles from './PetCard.module.css'
import { PetPhoto } from './PetPhoto'
import { PetStatusBadge } from './PetStatusBadge'

const MAX_TAGS = 3

export function PetCard({ pet }: { pet: Pet }) {
  const extraTags = pet.tags.length - MAX_TAGS

  return (
    <Card as="article" interactive className={styles.card}>
      <div className={styles.photo}>
        <PetPhoto pet={pet} size="fill" />
        <div className={styles.status}>
          <PetStatusBadge status={pet.status} />
        </div>
        <FavoriteButton pet={pet} size="sm" variant="secondary" className={styles.favorite} />
      </div>

      <div className={styles.body}>
        <div className={styles.heading}>
          <Link to={`/pets/${pet.id}`} className={styles.name}>
            {pet.name}
          </Link>
          <Text size="sm" tone="muted" truncate>
            {pet.category?.name ?? 'Uncategorised'} · #{pet.id}
          </Text>
        </div>

        {pet.tags.length > 0 ? (
          <ul className={styles.tags} aria-label="Tags">
            {pet.tags.slice(0, MAX_TAGS).map((tag) => (
              <li key={tag.name} className={styles.tag}>
                <Badge>{tag.name}</Badge>
              </li>
            ))}
            {extraTags > 0 ? (
              <li>
                <Badge>+{extraTags}</Badge>
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className={styles.action}>
          <AddToCartButton pet={pet} size="sm" fullWidth />
        </div>
      </div>
    </Card>
  )
}
