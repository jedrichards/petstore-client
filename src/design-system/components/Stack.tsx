import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react'

import { cx } from '@/lib/cx'

import { spaceVar } from '../tokens/tokens'
import type { Space } from '../tokens/tokens'
import styles from './Stack.module.css'

type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
type Justify = 'start' | 'center' | 'end' | 'between'

export interface StackProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  direction?: 'column' | 'row'
  gap?: Space
  align?: Align
  justify?: Justify
  wrap?: boolean
  children?: ReactNode
}

/** A flex container that spaces its children on the token scale. */
export function Stack({
  as: Component = 'div',
  direction = 'column',
  gap = 4,
  align,
  justify,
  wrap = false,
  className,
  style,
  ...rest
}: StackProps) {
  const stackStyle = { '--stack-gap': spaceVar(gap), ...style } as CSSProperties

  return (
    <Component
      className={cx(
        styles.stack,
        styles[direction],
        align && styles[`align-${align}`],
        justify && styles[`justify-${justify}`],
        wrap && styles.wrap,
        className,
      )}
      style={stackStyle}
      {...rest}
    />
  )
}

/** A horizontal stack, centred on the cross axis by default. */
export function Inline({ align = 'center', gap = 2, ...rest }: Omit<StackProps, 'direction'>) {
  return <Stack direction="row" align={align} gap={gap} {...rest} />
}
