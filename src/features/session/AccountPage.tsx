import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import {
  Alert,
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  DescriptionList,
  Inline,
  LinkButton,
  PageHeader,
  Skeleton,
  Text,
  useToast,
} from '@/design-system'
import { useUser } from '@/features/users/userQueries'
import { formatDateTime } from '@/lib/format'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { useSession } from './SessionProvider'

/** The signed-in user's own page. The route guard guarantees a session. */
export function AccountPage() {
  useDocumentTitle('Account')

  const navigate = useNavigate()
  const toast = useToast()
  const { session, signOut } = useSession()
  const profile = useUser(session?.username)
  const [signingOut, setSigningOut] = useState(false)

  if (!session) return null

  const onSignOut = async () => {
    setSigningOut(true)

    try {
      await signOut()
    } catch {
      // The local session is cleared either way.
    }

    toast.success('Signed out')
    void navigate('/')
  }

  return (
    <>
      <PageHeader
        title="Account"
        description={`Signed in as ${session.username}.`}
        actions={
          <Button iconStart={<LogOut />} loading={signingOut} onClick={() => void onSignOut()}>
            Sign out
          </Button>
        }
      />

      <Card>
        <CardHeader title="Session" description="Ends when you close this tab." />
        <CardBody>
          <Inline gap={6} align="start" wrap>
            <Avatar name={session.username} size="lg" />
            <DescriptionList
              items={[
                { term: 'Username', detail: session.username },
                { term: 'Signed in', detail: formatDateTime(session.startedAt) },
                { term: 'Session token', detail: <Text mono>{session.token || '—'}</Text> },
              ]}
            />
          </Inline>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Profile"
          actions={
            profile.data ? (
              <LinkButton to={`/users/${encodeURIComponent(session.username)}/edit`} size="sm">
                Edit profile
              </LinkButton>
            ) : undefined
          }
        />
        <CardBody>
          {profile.data ? (
            <DescriptionList
              items={[
                {
                  term: 'Name',
                  detail: `${profile.data.firstName} ${profile.data.lastName}`.trim() || '—',
                },
                { term: 'Email', detail: profile.data.email || '—' },
                { term: 'Phone', detail: profile.data.phone || '—' },
              ]}
            />
          ) : profile.isError ? (
            <Alert
              tone="warning"
              title="No profile on the server"
              action={
                <LinkButton to="/users/new" size="sm">
                  Create it
                </LinkButton>
              }
            >
              The demo API accepts any sign-in, even for a username that has no account.
            </Alert>
          ) : (
            <Skeleton height={96} />
          )}
        </CardBody>
      </Card>
    </>
  )
}
