import type { ElementType, HTMLAttributes } from 'react'

import { cx } from '@/lib/cx'

import styles from './Text.module.css'

type TextSize = 'xs' | 'sm' | 'md' | 'lg'
type TextTone = 'default' | 'muted' | 'subtle' | 'accent' | 'danger' | 'success'
type TextWeight = 'regular' | 'medium' | 'semibold'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  size?: TextSize
  tone?: TextTone
  weight?: TextWeight
  mono?: boolean
  truncate?: boolean
}

export function Text({
  as: Component = 'p',
  size = 'md',
  tone = 'default',
  weight = 'regular',
  mono = false,
  truncate = false,
  className,
  ...rest
}: TextProps) {
  return (
    <Component
      className={cx(
        styles.text,
        styles[`size-${size}`],
        styles[`tone-${tone}`],
        styles[`weight-${weight}`],
        mono && styles.mono,
        truncate && styles.truncate,
        className,
      )}
      {...rest}
    />
  )
}

type HeadingLevel = 1 | 2 | 3 | 4

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel
  /** The visual size, when it should differ from the semantic level. */
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const defaultHeadingSize: Record<HeadingLevel, NonNullable<HeadingProps['size']>> = {
  1: 'xl',
  2: 'lg',
  3: 'md',
  4: 'sm',
}

export function Heading({ level = 2, size, className, ...rest }: HeadingProps) {
  const Component = `h${level}` as const

  return (
    <Component
      className={cx(
        styles.heading,
        styles[`heading-${size ?? defaultHeadingSize[level]}`],
        className,
      )}
      {...rest}
    />
  )
}
