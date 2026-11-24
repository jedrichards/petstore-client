import { ChevronLeft, ChevronRight } from 'lucide-react'

import { IconButton } from './Button'
import styles from './Pagination.module.css'

export interface PaginationProps {
  /** The current page, starting at 1. */
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  /** What is being counted, such as "pets". */
  itemLabel?: string
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  itemLabel = 'items',
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const first = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(totalItems, page * pageSize)

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <p className={styles.summary}>
        {first}–{last} of {totalItems} {itemLabel}
      </p>
      <div className={styles.controls}>
        <IconButton
          label="Previous page"
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </IconButton>
        <span className={styles.page}>
          Page {page} of {pageCount}
        </span>
        <IconButton
          label="Next page"
          variant="secondary"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </IconButton>
      </div>
    </nav>
  )
}
