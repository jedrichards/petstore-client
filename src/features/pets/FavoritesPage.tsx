import { Heart } from 'lucide-react'

import {
  Alert,
  Button,
  Card,
  EmptyState,
  Grid,
  LinkButton,
  PageHeader,
  Skeleton,
} from '@/design-system'
import { pluralize } from '@/lib/format'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { useFavorites } from './FavoritesProvider'
import { PetCard } from './PetCard'
import { usePetsById } from './petQueries'

export function FavoritesPage() {
  useDocumentTitle('Favorites')

  const { favoriteIds, clearFavorites } = useFavorites()
  const { pets, isPending, missingCount } = usePetsById(favoriteIds)

  return (
    <>
      <PageHeader
        title="Favorites"
        description="Pets you marked with a heart. Saved in this browser only."
        actions={
          favoriteIds.length > 0 ? <Button onClick={clearFavorites}>Clear all</Button> : undefined
        }
      />

      {missingCount > 0 ? (
        <Alert tone="warning" title="Some favorites are gone">
          {pluralize(missingCount, 'favorite')} could not be loaded. The pet may have been deleted
          from the shared server.
        </Alert>
      ) : null}

      {favoriteIds.length === 0 ? (
        <EmptyState
          icon={<Heart />}
          title="No favorites yet"
          description="Tap the heart on any pet to keep it here."
          action={
            <LinkButton to="/pets" variant="primary">
              Browse pets
            </LinkButton>
          }
        />
      ) : (
        <Grid minColumnWidth={220}>
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
          {isPending ? (
            <Card padding="md">
              <Skeleton height={180} radius="md" />
            </Card>
          ) : null}
        </Grid>
      )}
    </>
  )
}
