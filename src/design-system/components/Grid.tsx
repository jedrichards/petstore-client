import type { CSSProperties, HTMLAttributes } from 'react'

import { cx } from '@/lib/cx'

import { spaceVar } from '../tokens/tokens'
import type { Space } from '../tokens/tokens'
import styles from './Grid.module.css'

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** The narrowest a column may get before the grid drops a column. */
  minColumnWidth?: number
  /** A fixed column count, used instead of minColumnWidth. */
  columns?: number
  gap?: Space
}

/** A responsive grid of equal columns. */
export function Grid({
  minColumnWidth = 240,
  columns,
  gap = 4,
  className,
  style,
  ...rest
}: GridProps) {
  const gridStyle = {
    '--grid-gap': spaceVar(gap),
    '--grid-columns': columns
      ? `repeat(${columns}, minmax(0, 1fr))`
      : `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))`,
    ...style,
  } as CSSProperties

  return <div className={cx(styles.grid, className)} style={gridStyle} {...rest} />
}
