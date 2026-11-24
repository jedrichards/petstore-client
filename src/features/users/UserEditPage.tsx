import { useNavigate, useParams } from 'react-router'

import { QueryError } from '@/components/QueryError'
import { PageHeader, Skeleton } from '@/design-system'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { UserForm } from './UserForm'
import { useUpdateUser, useUser } from './userQueries'

export function UserEditPage() {
  const username = useParams().username ?? ''
  const navigate = useNavigate()
  const user = useUser(username)
  const updateUser = useUpdateUser(username)

  useDocumentTitle(`Edit ${username}`)

  const detailPath = `/users/${encodeURIComponent(username)}`

  return (
    <>
      <PageHeader
        title={`Edit ${username}`}
        breadcrumbs={[
          { label: 'Users', to: '/users' },
          { label: username, to: detailPath },
          { label: 'Edit' },
        ]}
      />

      {user.isError ? (
        <QueryError
          title="Could not load this user"
          error={user.error}
          onRetry={() => void user.refetch()}
        />
      ) : user.data ? (
        <UserForm
          key={user.data.username}
          user={user.data}
          submitLabel="Save changes"
          cancelTo={detailPath}
          onSubmit={async (input) => {
            await updateUser.mutateAsync(input)

            void navigate(`/users/${encodeURIComponent(input.username)}`)
          }}
        />
      ) : (
        <Skeleton height={420} radius="lg" />
      )}
    </>
  )
}
