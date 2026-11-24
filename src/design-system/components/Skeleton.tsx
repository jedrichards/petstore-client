import type { CSSProperties } from 'react'

import { cx } from '@/lib/cx'

import styles from './Skeleton.module.css'

export interface SkeletonProps {
  width?: number | string
  height?: number | string
  radius?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

/** A placeholder block shown while content loads. */
export function Skeleton({ width = '100%', height = 16, radius = 'sm', className }: SkeletonProps) {
  const style: CSSProperties = { width, height, borderRadius: `var(--ds-radius-${radius})` }

  return <span className={cx(styles.skeleton, className)} style={style} aria-hidden />
}
