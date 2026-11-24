import { useNavigate } from 'react-router'

import { PageHeader } from '@/design-system'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { UserForm } from './UserForm'
import { useCreateUser } from './userQueries'

export function UserCreatePage() {
  useDocumentTitle('New user')

  const navigate = useNavigate()
  const createUser = useCreateUser()

  return (
    <>
      <PageHeader
        title="New user"
        description="Create an account on the Petstore server."
        breadcrumbs={[{ label: 'Users', to: '/users' }, { label: 'New' }]}
      />
      <UserForm
        submitLabel="Create user"
        cancelTo="/users"
        onSubmit={async (input) => {
          await createUser.mutateAsync(input)

          void navigate(`/users/${encodeURIComponent(input.username)}`)
        }}
      />
    </>
  )
}
