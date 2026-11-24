import type { ReactNode } from 'react'

import { cx } from '@/lib/cx'

import styles from './EmptyState.module.css'
import { Heading, Text } from './Text'

export interface EmptyStateProps {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  /** Drops the dashed frame, for use inside a card. */
  plain?: boolean
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  plain = false,
  className,
}: EmptyStateProps) {
  return (
    <div className={cx(styles.empty, plain && styles.plain, className)}>
      {icon ? (
        <div className={styles.icon} aria-hidden>
          {icon}
        </div>
      ) : null}
      <Heading level={3}>{title}</Heading>
      {description ? (
        <Text tone="muted" className={styles.description}>
          {description}
        </Text>
      ) : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}
