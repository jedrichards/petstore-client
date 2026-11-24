import type { CSSProperties } from 'react'
import { Link } from 'react-router'

import type { PetStatus } from '@/api'
import { formatNumber } from '@/lib/format'

import styles from './InventoryBar.module.css'

interface InventorySegment {
  status: PetStatus
  label: string
  value: number
}

/** One bar split by status, with a legend that links to each filtered list. */
export function InventoryBar({ segments }: { segments: ReadonlyArray<InventorySegment> }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.bar}
        role="img"
        aria-label={segments
          .map((segment) => `${segment.label}: ${formatNumber(segment.value)}`)
          .join(', ')}
      >
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => (
            <span
              key={segment.status}
              className={styles[segment.status]}
              style={{ '--share': segment.value / (total || 1) } as CSSProperties}
            />
          ))}
      </div>

      <ul className={styles.legend}>
        {segments.map((segment) => (
          <li key={segment.status}>
            <Link to={`/pets?status=${segment.status}`} className={styles.legendItem}>
              <span className={`${styles.swatch} ${styles[segment.status]}`} aria-hidden />
              {segment.label}
              <span className={styles.legendValue}>{formatNumber(segment.value)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
