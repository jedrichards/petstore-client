import { Pencil, Trash2, UserX } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DescriptionList,
  EmptyState,
  Inline,
  LinkButton,
  PageHeader,
  Skeleton,
  Stack,
  Text,
  useConfirm,
} from '@/design-system'
import { useSession } from '@/features/session/SessionProvider'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { rememberUser } from './knownUsers'
import { useDeleteUser, useUser } from './userQueries'

export function UserDetailPage() {
  const username = useParams().username ?? ''
  const navigate = useNavigate()
  const confirm = useConfirm()
  const { session } = useSession()
  const user = useUser(username)
  const deleteUser = useDeleteUser()

  useDocumentTitle(username)

  const foundUsername = user.data?.username

  useEffect(() => {
    if (foundUsername) rememberUser(foundUsername)
  }, [foundUsername])

  if (user.isError) {
    // The server answers an unknown username with a 500, so any failure reads as "not found".
    return (
      <EmptyState
        icon={<UserX />}
        title={`No user named "${username}"`}
        description="The user does not exist, or the server could not look it up."
        action={
          <>
            <Button onClick={() => void user.refetch()}>Try again</Button>
            <LinkButton to="/users" variant="primary">
              Back to users
            </LinkButton>
          </>
        }
      />
    )
  }

  if (!user.data) {
    return (
      <Stack gap={6} aria-busy aria-label="Loading user">
        <Skeleton width={220} height={28} />
        <Skeleton height={260} radius="lg" />
      </Stack>
    )
  }

  const data = user.data
  const fullName = `${data.firstName} ${data.lastName}`.trim()
  const isSelf = session?.username === data.username

  const onDelete = async () => {
    const confirmed = await confirm({
      title: `Delete ${data.username}?`,
      description: 'This removes the account from the server. It cannot be undone.',
      confirmLabel: 'Delete user',
      danger: true,
    })

    if (confirmed) deleteUser.mutate(data.username, { onSuccess: () => void navigate('/users') })
  }

  return (
    <>
      <PageHeader
        title={fullName || data.username}
        meta={
          <Inline gap={2}>
            <Badge tone={data.userStatus === 1 ? 'success' : 'neutral'} dot>
              {data.userStatus === 1 ? 'Active' : 'Inactive'}
            </Badge>
            {isSelf ? <Badge tone="accent">You</Badge> : null}
          </Inline>
        }
        description={`@${data.username}`}
        breadcrumbs={[{ label: 'Users', to: '/users' }, { label: data.username }]}
        actions={
          <>
            <LinkButton
              to={`/users/${encodeURIComponent(data.username)}/edit`}
              iconStart={<Pencil />}
            >
              Edit
            </LinkButton>
            <Button
              variant="danger"
              iconStart={<Trash2 />}
              loading={deleteUser.isPending}
              onClick={() => void onDelete()}
            >
              Delete
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader title="Profile" />
        <CardBody>
          <Inline gap={6} align="start" wrap>
            <Avatar name={fullName || data.username} size="lg" />
            <DescriptionList
              items={[
                { term: 'User ID', detail: <Text mono>{data.id}</Text> },
                { term: 'Username', detail: data.username },
                { term: 'Name', detail: fullName || '—' },
                { term: 'Email', detail: data.email || '—' },
                { term: 'Phone', detail: data.phone || '—' },
              ]}
            />
          </Inline>
        </CardBody>
      </Card>
    </>
  )
}
