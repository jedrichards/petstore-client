import type { HTMLAttributes } from 'react'

import { cx } from '@/lib/cx'

import type { Tone } from '../tokens/tokens'
import styles from './Badge.module.css'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
  /** Shows a status dot before the label. */
  dot?: boolean
}

export function Badge({ tone = 'neutral', dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[tone], className)} {...rest}>
      {dot ? <span className={styles.dot} aria-hidden /> : null}
      {children}
    </span>
  )
}
