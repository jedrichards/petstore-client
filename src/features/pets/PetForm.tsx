import { useCallback } from 'react'

import { petStatuses } from '@/api'
import type { Pet, PetInput, PetStatus } from '@/api'
import { FormActions } from '@/components/FormActions'
import {
  Button,
  Card,
  CardBody,
  Field,
  Input,
  LinkButton,
  Select,
  Stack,
  TagInput,
  Textarea,
} from '@/design-system'
import { generateId } from '@/lib/ids'
import { useForm } from '@/lib/useForm'
import type { FormErrors } from '@/lib/useForm'

import styles from './PetForm.module.css'
import { isWebUrl, petStatusLabels } from './petPresentation'

interface PetFormValues {
  name: string
  status: PetStatus
  category: string
  tags: string[]
  photoUrls: string
}

/** The demo server's seeded categories and their ids. */
const knownCategories: Record<string, number> = {
  dogs: 1,
  cats: 2,
  rabbits: 3,
  lions: 4,
}

const categoryDatalistId = 'pet-form-categories'

function toFormValues(pet: Pet | undefined): PetFormValues {
  return {
    name: pet?.name ?? '',
    status: pet?.status ?? 'available',
    category: pet?.category?.name ?? '',
    tags: pet?.tags.map((tag) => tag.name) ?? [],
    photoUrls: pet?.photoUrls.join('\n') ?? '',
  }
}

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function validate(values: PetFormValues): FormErrors<PetFormValues> {
  const errors: FormErrors<PetFormValues> = {}

  if (values.name.trim() === '') errors.name = 'Give the pet a name.'
  else if (values.name.trim().length > 60) errors.name = 'Keep the name under 60 characters.'

  const badUrl = splitLines(values.photoUrls).find((url) => !isWebUrl(url))

  if (badUrl) errors.photoUrls = `"${badUrl}" is not a web address. Start it with https://.`

  return errors
}

function toPetInput(values: PetFormValues, existing: Pet | undefined): PetInput {
  const categoryName = values.category.trim()

  return {
    id: existing?.id ?? generateId(),
    name: values.name.trim(),
    status: values.status,
    category: categoryName
      ? {
          id:
            existing?.category?.name === categoryName
              ? existing.category.id
              : (knownCategories[categoryName.toLowerCase()] ?? 0),
          name: categoryName,
        }
      : undefined,
    tags: values.tags.map((name, index) => ({
      id: existing?.tags.find((tag) => tag.name === name)?.id ?? index + 1,
      name,
    })),
    photoUrls: splitLines(values.photoUrls),
  }
}

interface PetFormProps {
  /** The pet being edited. Omit to create one. */
  pet?: Pet
  submitLabel: string
  cancelTo: string
  onSubmit: (pet: PetInput) => Promise<unknown>
}

export function PetForm({ pet, submitLabel, cancelTo, onSubmit }: PetFormProps) {
  const submit = useCallback(
    async (values: PetFormValues) => {
      try {
        await onSubmit(toPetInput(values, pet))
      } catch {
        // The mutation reports its own failure; the form stays open for another try.
      }
    },
    [onSubmit, pet],
  )

  const form = useForm({ initialValues: toFormValues(pet), validate, onSubmit: submit })

  return (
    <Card>
      <CardBody>
        <form onSubmit={form.handleSubmit} noValidate>
          <Stack gap={5}>
            <div className={styles.row}>
              <Field label="Name" required error={form.errorFor('name')}>
                <Input
                  value={form.values.name}
                  onChange={(event) => form.setValue('name', event.target.value)}
                  onBlur={() => form.touch('name')}
                  placeholder="Biscuit"
                  autoComplete="off"
                  autoFocus={!pet}
                />
              </Field>

              <Field label="Status">
                <Select
                  value={form.values.status}
                  onValueChange={(status) => form.setValue('status', status)}
                  options={petStatuses.map((value) => ({
                    value,
                    label: petStatusLabels[value],
                  }))}
                />
              </Field>
            </div>

            <Field label="Category" hint="Pick a suggestion or type your own.">
              <Input
                value={form.values.category}
                onChange={(event) => form.setValue('category', event.target.value)}
                placeholder="Dogs"
                list={categoryDatalistId}
                autoComplete="off"
              />
            </Field>
            <datalist id={categoryDatalistId}>
              <option value="Dogs" />
              <option value="Cats" />
              <option value="Rabbits" />
              <option value="Lions" />
            </datalist>

            <Field label="Tags" hint="Press Enter or comma to add a tag.">
              <TagInput
                value={form.values.tags}
                onValueChange={(tags) => form.setValue('tags', tags)}
                placeholder="friendly, vaccinated"
              />
            </Field>

            <Field
              label="Photo URLs"
              hint="One web address per line. The first is used as the main photo."
              error={form.errorFor('photoUrls')}
            >
              <Textarea
                value={form.values.photoUrls}
                onChange={(event) => form.setValue('photoUrls', event.target.value)}
                onBlur={() => form.touch('photoUrls')}
                placeholder="https://example.com/biscuit.jpg"
                rows={3}
                spellCheck={false}
              />
            </Field>

            <FormActions>
              <LinkButton to={cancelTo} variant="ghost">
                Cancel
              </LinkButton>
              <Button
                type="submit"
                variant="primary"
                loading={form.isSubmitting}
                disabled={Boolean(pet) && !form.isDirty}
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
