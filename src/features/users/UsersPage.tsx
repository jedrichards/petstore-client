import { ChevronRight, Search, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Inline,
  Input,
  LinkButton,
  PageHeader,
  Text,
} from '@/design-system'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { forgetUser, seededUsernames, useKnownUsers } from './knownUsers'
import styles from './UsersPage.module.css'

export function UsersPage() {
  useDocumentTitle('Users')

  const navigate = useNavigate()
  const knownUsers = useKnownUsers()
  const [lookup, setLookup] = useState('')

  const onLookup = (event: FormEvent) => {
    event.preventDefault()

    const username = lookup.trim()

    if (username !== '') void navigate(`/users/${encodeURIComponent(username)}`)
  }

  const suggestions = seededUsernames.filter((username) => !knownUsers.includes(username))

  return (
    <>
      <PageHeader
        title="Users"
        description="Look up an account by username. The API cannot list every user."
        actions={
          <LinkButton to="/users/new" variant="primary" iconStart={<UserPlus />}>
            New user
          </LinkButton>
        }
      />

      <Card>
        <CardHeader title="Find a user" />
        <CardBody>
          <form onSubmit={onLookup}>
            <Inline gap={2}>
              <Input
                className={styles.lookup}
                aria-label="Username"
                placeholder="Username, for example user1"
                leading={<Search />}
                value={lookup}
                onChange={(event) => setLookup(event.target.value)}
                autoCapitalize="none"
                spellCheck={false}
              />
              <Button type="submit" variant="primary" disabled={lookup.trim() === ''}>
                Look up
              </Button>
            </Inline>
          </form>
        </CardBody>
      </Card>

      {knownUsers.length > 0 ? (
        <Card>
          <CardHeader
            title="Recent"
            description="Users you created or looked up in this browser."
          />
          <ul>
            {knownUsers.map((username) => (
              <li key={username} className={styles.row}>
                <Link to={`/users/${encodeURIComponent(username)}`} className={styles.rowLink}>
                  <Avatar name={username} size="sm" />
                  <span className={styles.rowName}>{username}</span>
                  <ChevronRight className={styles.chevron} aria-hidden />
                </Link>
                <IconButton
                  label={`Forget ${username}`}
                  size="sm"
                  onClick={() => forgetUser(username)}
                >
                  <X />
                </IconButton>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {suggestions.length > 0 ? (
        <Card>
          <CardHeader
            title="Sample accounts"
            description="The demo server ships with these usernames."
          />
          <CardBody>
            <Inline gap={2} wrap>
              {suggestions.map((username) => (
                <LinkButton key={username} to={`/users/${username}`} size="sm">
                  {username}
                </LinkButton>
              ))}
            </Inline>
            <Text size="sm" tone="subtle" className={styles.note}>
              The server resets now and then, so a sample may be missing.
            </Text>
          </CardBody>
        </Card>
      ) : null}
    </>
  )
}
