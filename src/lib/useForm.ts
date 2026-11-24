import { useCallback, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

export type FormErrors<T> = Partial<Record<keyof T, string>>

interface UseFormOptions<T> {
  initialValues: T
  validate?: (values: T) => FormErrors<T>
  onSubmit: (values: T) => void | Promise<void>
}

export interface FormApi<T> {
  values: T
  errors: FormErrors<T>
  isDirty: boolean
  isSubmitting: boolean
  setValue: <K extends keyof T>(name: K, value: T[K]) => void
  touch: (name: keyof T) => void
  /** The error for a field, shown once it was touched or a submit was tried. */
  errorFor: (name: keyof T) => string | undefined
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
  reset: (values?: T) => void
}

export function useForm<T extends object>(options: UseFormOptions<T>): FormApi<T> {
  const { initialValues, validate, onSubmit } = options

  const [initial, setInitial] = useState(initialValues)
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const errors = useMemo<FormErrors<T>>(
    () => (validate ? validate(values) : {}),
    [validate, values],
  )

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initial),
    [values, initial],
  )

  const setValue = useCallback<FormApi<T>['setValue']>((name, value) => {
    setValues((previous) => ({ ...previous, [name]: value }))
  }, [])

  const touch = useCallback((name: keyof T) => {
    setTouched((previous) => (previous[name] ? previous : { ...previous, [name]: true }))
  }, [])

  const errorFor = useCallback(
    (name: keyof T) => (submitAttempted || touched[name] ? errors[name] : undefined),
    [errors, submitAttempted, touched],
  )

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setSubmitAttempted(true)

      if (Object.values(errors).some(Boolean)) return

      const result = onSubmit(values)

      if (result instanceof Promise) {
        setIsSubmitting(true)
        void result.finally(() => setIsSubmitting(false))
      }
    },
    [errors, onSubmit, values],
  )

  const reset = useCallback(
    (next?: T) => {
      if (next) setInitial(next)

      setValues(next ?? initial)
      setTouched({})
      setSubmitAttempted(false)
    },
    [initial],
  )

  return { values, errors, isDirty, isSubmitting, setValue, touch, errorFor, handleSubmit, reset }
}
