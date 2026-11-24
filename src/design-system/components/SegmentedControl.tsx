import { useId } from 'react'
import type { ReactNode } from 'react'

import { cx } from '@/lib/cx'

import styles from './SegmentedControl.module.css'

export interface Segment<T extends string> {
  value: T
  label: ReactNode
  /** A count or other short detail shown after the label. */
  detail?: ReactNode
}

export interface SegmentedControlProps<T extends string> {
  /** Names the group for assistive technology. */
  label: string
  segments: ReadonlyArray<Segment<T>>
  value: T
  onValueChange: (value: T) => void
  size?: 'sm' | 'md'
  className?: string
}

/** A single choice among a few options, shown side by side. */
export function SegmentedControl<T extends string>({
  label,
  segments,
  value,
  onValueChange,
  size = 'md',
  className,
}: SegmentedControlProps<T>) {
  const name = useId()

  return (
    <div className={cx(styles.group, styles[size], className)} role="radiogroup" aria-label={label}>
      {segments.map((segment) => (
        <label key={segment.value} className={styles.segment}>
          <input
            type="radio"
            className={styles.input}
            name={name}
            value={segment.value}
            checked={segment.value === value}
            onChange={() => onValueChange(segment.value)}
          />
          <span className={styles.label}>
            {segment.label}
            {segment.detail !== undefined ? (
              <span className={styles.detail}>{segment.detail}</span>
            ) : null}
          </span>
        </label>
      ))}
    </div>
  )
}
