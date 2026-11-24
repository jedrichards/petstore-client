import { useNavigate } from 'react-router'

import { PageHeader } from '@/design-system'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { PetForm } from './PetForm'
import { useCreatePet } from './petQueries'

export function PetCreatePage() {
  useDocumentTitle('Add a pet')

  const navigate = useNavigate()
  const createPet = useCreatePet()

  return (
    <>
      <PageHeader
        title="Add a pet"
        description="List a new pet in the store."
        breadcrumbs={[{ label: 'Pets', to: '/pets' }, { label: 'New' }]}
      />
      <PetForm
        submitLabel="Add pet"
        cancelTo="/pets"
        onSubmit={async (input) => {
          const pet = await createPet.mutateAsync(input)

          void navigate(`/pets/${pet.id}`)
        }}
      />
    </>
  )
}
