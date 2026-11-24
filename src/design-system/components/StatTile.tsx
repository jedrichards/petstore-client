import type { ReactNode } from 'react'

import { cx } from '@/lib/cx'

import type { Tone } from '../tokens/tokens'
import { Skeleton } from './Skeleton'
import styles from './StatTile.module.css'

export interface StatTileProps {
  label: string
  value: ReactNode
  /** Context under the value, such as a share of the total. */
  detail?: ReactNode
  icon?: ReactNode
  tone?: Tone
  loading?: boolean
  className?: string
}

/** A single headline number with its label. */
export function StatTile({
  label,
  value,
  detail,
  icon,
  tone = 'neutral',
  loading = false,
  className,
}: StatTileProps) {
  return (
    <div className={cx(styles.tile, className)}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {icon ? (
          <span className={cx(styles.icon, styles[tone])} aria-hidden>
            {icon}
          </span>
        ) : null}
      </div>
      {loading ? (
        <Skeleton width={72} height={32} />
      ) : (
        <span className={styles.value}>{value}</span>
      )}
      {detail ? <span className={styles.detail}>{detail}</span> : null}
    </div>
  )
}
