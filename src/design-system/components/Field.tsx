import { createContext, use, useId, useMemo } from 'react'
import type { ReactNode } from 'react'

import { cx } from '@/lib/cx'

import styles from './Field.module.css'

interface FieldContextValue {
  controlId: string
  hintId: string | undefined
  errorId: string | undefined
  invalid: boolean
  required: boolean
}

const FieldContext = createContext<FieldContextValue | null>(null)

/**
 * Wiring for a control rendered inside a Field: its id and ARIA attributes.
 * Controls work without a Field too, in which case this returns nothing.
 */
export function useFieldControlProps(): {
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: true
  required?: true
} {
  const field = use(FieldContext)

  if (!field) return {}

  const describedBy = [field.errorId, field.hintId].filter(Boolean).join(' ')

  return {
    id: field.controlId,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': field.invalid || undefined,
    required: field.required || undefined,
  }
}

export interface FieldProps {
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  className?: string
  children: ReactNode
}

/** Labels a single control and shows its hint and validation error. */
export function Field({ label, hint, error, required = false, className, children }: FieldProps) {
  const id = useId()
  const hasError = Boolean(error)
  const hasHint = Boolean(hint)

  const context = useMemo<FieldContextValue>(
    () => ({
      controlId: `${id}-control`,
      hintId: hasHint ? `${id}-hint` : undefined,
      errorId: hasError ? `${id}-error` : undefined,
      invalid: hasError,
      required,
    }),
    [id, hasHint, hasError, required],
  )

  return (
    <FieldContext value={context}>
      <div className={cx(styles.field, className)}>
        <label className={styles.label} htmlFor={context.controlId}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden>
              *
            </span>
          ) : null}
        </label>

        {children}

        {hasError ? (
          <p className={styles.error} id={context.errorId} role="alert">
            {error}
          </p>
        ) : null}

        {hasHint && !hasError ? (
          <p className={styles.hint} id={context.hintId}>
            {hint}
          </p>
        ) : null}
      </div>
    </FieldContext>
  )
}
