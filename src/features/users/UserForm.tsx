import { useCallback } from 'react'

import type { User, UserInput } from '@/api'
import { FormActions } from '@/components/FormActions'
import {
  Button,
  Card,
  CardBody,
  Field,
  Grid,
  Input,
  LinkButton,
  Stack,
  Switch,
} from '@/design-system'
import { generateId } from '@/lib/ids'
import { useForm } from '@/lib/useForm'
import type { FormErrors } from '@/lib/useForm'

interface UserFormValues {
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  active: boolean
}

function toFormValues(user: User | undefined): UserFormValues {
  return {
    username: user?.username ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    password: '',
    active: user ? user.userStatus === 1 : true,
  }
}

function makeValidator(isNew: boolean) {
  return (values: UserFormValues): FormErrors<UserFormValues> => {
    const errors: FormErrors<UserFormValues> = {}

    if (!/^[A-Za-z0-9._-]{3,30}$/.test(values.username)) {
      errors.username = 'Use 3 to 30 letters, numbers, dots, dashes or underscores.'
    }

    if (values.email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Enter an email address like name@example.com.'
    }

    if (isNew && values.password.length < 4) {
      errors.password = 'Use at least 4 characters.'
    }

    return errors
  }
}

const validateNew = makeValidator(true)
const validateExisting = makeValidator(false)

interface UserFormProps {
  /** The user being edited. Omit to create one. */
  user?: User
  submitLabel: string
  cancelTo: string
  onSubmit: (user: UserInput) => Promise<unknown>
}

export function UserForm({ user, submitLabel, cancelTo, onSubmit }: UserFormProps) {
  const submit = useCallback(
    async (values: UserFormValues) => {
      const input: UserInput = {
        id: user?.id ?? generateId(),
        username: values.username,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        userStatus: values.active ? 1 : 0,
        ...(values.password ? { password: values.password } : {}),
      }

      try {
        await onSubmit(input)
      } catch {
        // The mutation reports its own failure; the form stays open for another try.
      }
    },
    [onSubmit, user],
  )

  const form = useForm({
    initialValues: toFormValues(user),
    validate: user ? validateExisting : validateNew,
    onSubmit: submit,
  })

  return (
    <Card>
      <CardBody>
        <form onSubmit={form.handleSubmit} noValidate>
          <Stack gap={5}>
            <Field
              label="Username"
              required
              error={form.errorFor('username')}
              hint="Shown in the address of the profile page."
            >
              <Input
                value={form.values.username}
                onChange={(event) => form.setValue('username', event.target.value)}
                onBlur={() => form.touch('username')}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
              />
            </Field>

            <Grid columns={2} gap={4}>
              <Field label="First name">
                <Input
                  value={form.values.firstName}
                  onChange={(event) => form.setValue('firstName', event.target.value)}
                  autoComplete="off"
                />
              </Field>
              <Field label="Last name">
                <Input
                  value={form.values.lastName}
                  onChange={(event) => form.setValue('lastName', event.target.value)}
                  autoComplete="off"
                />
              </Field>
              <Field label="Email" error={form.errorFor('email')}>
                <Input
                  type="email"
                  value={form.values.email}
                  onChange={(event) => form.setValue('email', event.target.value)}
                  onBlur={() => form.touch('email')}
                  autoComplete="off"
                />
              </Field>
              <Field label="Phone">
                <Input
                  type="tel"
                  value={form.values.phone}
                  onChange={(event) => form.setValue('phone', event.target.value)}
                  autoComplete="off"
                />
              </Field>
            </Grid>

            <Field
              label="Password"
              required={!user}
              error={form.errorFor('password')}
              hint={
                user
                  ? 'Leave empty to keep the current password.'
                  : 'This is a public demo server. Do not reuse a real password.'
              }
            >
              <Input
                type="password"
                value={form.values.password}
                onChange={(event) => form.setValue('password', event.target.value)}
                onBlur={() => form.touch('password')}
                autoComplete="new-password"
              />
            </Field>

            <Switch
              checked={form.values.active}
              onCheckedChange={(active) => form.setValue('active', active)}
              label="Active"
              description="Inactive users keep their profile but are marked as disabled."
            />

            <FormActions>
              <LinkButton to={cancelTo} variant="ghost">
                Cancel
              </LinkButton>
              <Button
                type="submit"
                variant="primary"
                loading={form.isSubmitting}
                disabled={Boolean(user) && !form.isDirty}
              >
                {submitLabel}
              </Button>
            </FormActions>
          </Stack>
        </form>
      </CardBody>
    </Card>
  )
}
