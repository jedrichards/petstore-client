import { PawPrint } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'

import { describeError } from '@/api'
import { Alert, Button, Card, Field, Heading, Input, Stack, Text, useToast } from '@/design-system'
import { useForm } from '@/lib/useForm'
import type { FormErrors } from '@/lib/useForm'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { useSession } from './SessionProvider'
import styles from './SignInPage.module.css'

interface SignInValues {
  username: string
  password: string
}

function validate(values: SignInValues): FormErrors<SignInValues> {
  const errors: FormErrors<SignInValues> = {}

  if (values.username.trim() === '') errors.username = 'Enter your username.'
  if (values.password === '') errors.password = 'Enter your password.'

  return errors
}

/** Only in-app paths are honoured, so a crafted link cannot redirect elsewhere. */
function safeReturnPath(from: string | null): string {
  return from && from.startsWith('/') && !from.startsWith('//') ? from : '/account'
}

export function SignInPage() {
  useDocumentTitle('Sign in')

  const navigate = useNavigate()
  const toast = useToast()
  const { isSignedIn, signIn } = useSession()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  const returnPath = safeReturnPath(searchParams.get('from'))

  const onSubmit = useCallback(
    async (values: SignInValues) => {
      setError(null)

      try {
        const session = await signIn(values.username.trim(), values.password)

        toast.success('Signed in', `Welcome, ${session.username}.`)
        void navigate(returnPath, { replace: true })
      } catch (cause) {
        setError(describeError(cause))
      }
    },
    [navigate, returnPath, signIn, toast],
  )

  const form = useForm<SignInValues>({
    initialValues: { username: '', password: '' },
    validate,
    onSubmit,
  })

  if (isSignedIn && !form.isSubmitting) return <Navigate to={returnPath} replace />

  return (
    <div className={styles.page}>
      <Card padding="lg" className={styles.card}>
        <Stack gap={5}>
          <Stack gap={2} align="center">
            <span className={styles.mark} aria-hidden>
              <PawPrint />
            </span>
            <Heading level={1} size="lg">
              Sign in to Pawprint
            </Heading>
            <Text tone="muted" className={styles.center}>
              Use any Petstore account, such as <strong>user1</strong>.
            </Text>
          </Stack>

          {error ? (
            <Alert tone="danger" title="Could not sign in">
              {error}
            </Alert>
          ) : null}

          <form onSubmit={form.handleSubmit} noValidate>
            <Stack gap={4}>
              <Field label="Username" error={form.errorFor('username')}>
                <Input
                  value={form.values.username}
                  onChange={(event) => form.setValue('username', event.target.value)}
                  onBlur={() => form.touch('username')}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoFocus
                />
              </Field>
              <Field
                label="Password"
                error={form.errorFor('password')}
                hint="The demo API sends this in the request address. Never use a real password."
              >
                <Input
                  type="password"
                  value={form.values.password}
                  onChange={(event) => form.setValue('password', event.target.value)}
                  onBlur={() => form.touch('password')}
                  autoComplete="current-password"
                />
              </Field>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={form.isSubmitting}
              >
                Sign in
              </Button>
            </Stack>
          </form>

          <Text size="sm" tone="muted" className={styles.center}>
            No account?{' '}
            <Link to="/users/new" className={styles.link}>
              Create a user
            </Link>
          </Text>
        </Stack>
      </Card>
    </div>
  )
}
