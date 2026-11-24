import { Link } from 'react-router'

import type { Pet } from '@/api'
import { Badge, Inline, Table, Td, Text, Th } from '@/design-system'

import { AddToCartButton } from './AddToCartButton'
import { FavoriteButton } from './FavoriteButton'
import styles from './PetTable.module.css'
import { PetPhoto } from './PetPhoto'
import { PetStatusBadge } from './PetStatusBadge'

export function PetTable({ pets }: { pets: ReadonlyArray<Pet> }) {
  return (
    <Table caption="Pets">
      <thead>
        <tr>
          <Th>Pet</Th>
          <Th>Category</Th>
          <Th>Tags</Th>
          <Th>Status</Th>
          <Th align="end">Actions</Th>
        </tr>
      </thead>
      <tbody>
        {pets.map((pet) => (
          <tr key={pet.id}>
            <Td>
              <Inline gap={3}>
                <PetPhoto pet={pet} size="sm" />
                <div className={styles.identity}>
                  <Link to={`/pets/${pet.id}`} className={styles.name}>
                    {pet.name}
                  </Link>
                  <Text size="xs" tone="subtle" mono>
                    #{pet.id}
                  </Text>
                </div>
              </Inline>
            </Td>
            <Td>{pet.category?.name ?? <Text tone="subtle">—</Text>}</Td>
            <Td>
              <Inline gap={1} wrap>
                {pet.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag.name}>{tag.name}</Badge>
                ))}
              </Inline>
            </Td>
            <Td>
              <PetStatusBadge status={pet.status} />
            </Td>
            <Td align="end">
              <Inline gap={1} justify="end">
                <FavoriteButton pet={pet} size="sm" />
                <AddToCartButton pet={pet} size="sm" />
              </Inline>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
