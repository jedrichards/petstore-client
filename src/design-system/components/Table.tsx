import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'

import { cx } from '@/lib/cx'

import styles from './Table.module.css'

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Describes the table for assistive technology. */
  caption: string
  children: ReactNode
}

export function Table({ caption, className, children, ...rest }: TableProps) {
  return (
    <div className={styles.scroller}>
      <table className={cx(styles.table, className)} {...rest}>
        <caption className={styles.caption}>{caption}</caption>
        {children}
      </table>
    </div>
  )
}

interface CellAlign {
  align?: 'start' | 'end'
}

export function Th({
  align = 'start',
  className,
  ...rest
}: CellAlign & Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'>) {
  return <th scope="col" className={cx(styles.th, styles[align], className)} {...rest} />
}

export function Td({
  align = 'start',
  className,
  ...rest
}: CellAlign & Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'>) {
  return <td className={cx(styles.td, styles[align], className)} {...rest} />
}
