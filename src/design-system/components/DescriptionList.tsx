import type { ReactNode } from 'react'

import { cx } from '@/lib/cx'

import styles from './DescriptionList.module.css'

export interface DescriptionItem {
  term: string
  detail: ReactNode
}

export interface DescriptionListProps {
  items: ReadonlyArray<DescriptionItem>
  className?: string
}

/** Term and detail pairs, such as the fields of a record. */
export function DescriptionList({ items, className }: DescriptionListProps) {
  return (
    <dl className={cx(styles.list, className)}>
      {items.map((item) => (
        <div key={item.term} className={styles.row}>
          <dt className={styles.term}>{item.term}</dt>
          <dd className={styles.detail}>{item.detail}</dd>
        </div>
      ))}
    </dl>
  )
}
