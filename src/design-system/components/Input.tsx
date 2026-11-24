import type {
  InputHTMLAttributes,
  ReactNode,
  Ref,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

import { cx } from '@/lib/cx'

import { useFieldControlProps } from './Field'
import styles from './Input.module.css'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  ref?: Ref<HTMLInputElement>
  size?: 'sm' | 'md'
  /** An icon or short text shown inside the leading edge. */
  leading?: ReactNode
  /** An element shown inside the trailing edge, such as a clear button. */
  trailing?: ReactNode
}

export function Input({ size = 'md', leading, trailing, className, ref, ...rest }: InputProps) {
  const fieldProps = useFieldControlProps()

  return (
    <span className={cx(styles.control, styles[size], className)}>
      {leading ? <span className={styles.adornment}>{leading}</span> : null}
      <input ref={ref} className={styles.input} {...fieldProps} {...rest} />
      {trailing ? <span className={styles.adornment}>{trailing}</span> : null}
    </span>
  )
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>
}

export function Textarea({ className, rows = 3, ref, ...rest }: TextareaProps) {
  const fieldProps = useFieldControlProps()

  return (
    <span className={cx(styles.control, styles.multiline, className)}>
      <textarea ref={ref} className={styles.input} rows={rows} {...fieldProps} {...rest} />
    </span>
  )
}

export interface SelectOption<T extends string = string> {
  value: T
  label: string
}

export interface SelectProps<T extends string = string> extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size' | 'onChange' | 'value'
> {
  options: ReadonlyArray<SelectOption<T>>
  value: T
  onValueChange: (value: T) => void
  size?: 'sm' | 'md'
}

export function Select<T extends string = string>({
  options,
  value,
  onValueChange,
  size = 'md',
  className,
  ...rest
}: SelectProps<T>) {
  const fieldProps = useFieldControlProps()

  return (
    <span className={cx(styles.control, styles.select, styles[size], className)}>
      <select
        className={styles.input}
        value={value}
        onChange={(event) => onValueChange(event.target.value as T)}
        {...fieldProps}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg className={styles.chevron} viewBox="0 0 16 16" aria-hidden>
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </span>
  )
}
