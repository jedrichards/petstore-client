import { useState } from 'react'
import type { KeyboardEvent } from 'react'

import { cx } from '@/lib/cx'

import { useFieldControlProps } from './Field'
import inputStyles from './Input.module.css'
import styles from './TagInput.module.css'

export interface TagInputProps {
  value: ReadonlyArray<string>
  onValueChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

/** Edits a list of short strings. Enter or comma adds, Backspace removes. */
export function TagInput({
  value,
  onValueChange,
  placeholder,
  disabled,
  className,
}: TagInputProps) {
  const fieldProps = useFieldControlProps()
  const [draft, setDraft] = useState('')

  const commit = (raw: string) => {
    const additions = raw
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '' && !value.includes(tag))

    if (additions.length > 0) onValueChange([...value, ...new Set(additions)])

    setDraft('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      if (draft.trim() === '' && event.key === 'Enter') return

      event.preventDefault()
      commit(draft)
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onValueChange(value.slice(0, -1))
    }
  }

  return (
    <span className={cx(inputStyles.control, styles.tagInput, className)}>
      {value.map((tag) => (
        <span key={tag} className={styles.tag}>
          {tag}
          <button
            type="button"
            className={styles.remove}
            aria-label={`Remove ${tag}`}
            disabled={disabled}
            onClick={() => onValueChange(value.filter((existing) => existing !== tag))}
          >
            ×
          </button>
        </span>
      ))}
      <input
        className={cx(inputStyles.input, styles.input)}
        value={draft}
        placeholder={value.length === 0 ? placeholder : undefined}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => commit(draft)}
        {...fieldProps}
        required={undefined}
      />
    </span>
  )
}
