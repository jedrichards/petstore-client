import { useNavigate, useParams } from 'react-router'

import { QueryError } from '@/components/QueryError'
import { Card, PageHeader, Skeleton, Stack } from '@/design-system'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { PetForm } from './PetForm'
import { usePet, useUpdatePet } from './petQueries'

export function PetEditPage() {
  const petId = Number(useParams().petId)
  const navigate = useNavigate()
  const pet = usePet(petId)
  const updatePet = useUpdatePet()

  useDocumentTitle(pet.data ? `Edit ${pet.data.name}` : 'Edit pet')

  const detailPath = `/pets/${petId}`

  return (
    <>
      <PageHeader
        title={pet.data ? `Edit ${pet.data.name}` : 'Edit pet'}
        breadcrumbs={[
          { label: 'Pets', to: '/pets' },
          { label: pet.data?.name ?? `#${petId}`, to: detailPath },
          { label: 'Edit' },
        ]}
      />

      {pet.isError ? (
        <QueryError
          title="Could not load this pet"
          error={pet.error}
          onRetry={() => void pet.refetch()}
        />
      ) : pet.data && !pet.isPlaceholderData ? (
        <PetForm
          // Remount if the route moves to another pet, so the form starts clean.
          key={pet.data.id}
          pet={pet.data}
          submitLabel="Save changes"
          cancelTo={detailPath}
          onSubmit={async (input) => {
            await updatePet.mutateAsync(input)

            void navigate(detailPath)
          }}
        />
      ) : (
        <Card padding="lg">
          <Stack gap={5}>
            <Skeleton height={36} />
            <Skeleton height={36} />
            <Skeleton height={36} />
            <Skeleton height={84} />
          </Stack>
        </Card>
      )}
    </>
  )
}
