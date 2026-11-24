import type { HTMLAttributes, ReactNode } from 'react'

import { cx } from '@/lib/cx'

import styles from './Card.module.css'
import { Heading, Text } from './Text'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'li'
  /** Lifts the card on hover. Use for cards that act as a link. */
  interactive?: boolean
  padding?: 'none' | 'md' | 'lg'
}

export function Card({
  as: Component = 'div',
  interactive = false,
  padding = 'none',
  className,
  ...rest
}: CardProps) {
  return (
    <Component
      className={cx(
        styles.card,
        interactive && styles.interactive,
        styles[`padding-${padding}`],
        className,
      )}
      {...rest}
    />
  )
}

export interface CardHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export function CardHeader({ title, description, actions }: CardHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerText}>
        <Heading level={3}>{title}</Heading>
        {description ? (
          <Text size="sm" tone="muted">
            {description}
          </Text>
        ) : null}
      </div>
      {actions ? <div className={styles.headerActions}>{actions}</div> : null}
    </header>
  )
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(styles.body, className)} {...rest} />
}

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <footer className={cx(styles.footer, className)} {...rest} />
}
