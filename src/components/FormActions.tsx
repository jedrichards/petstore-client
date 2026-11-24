import type { ReactNode } from 'react'

import styles from './FormActions.module.css'

/** The row of buttons that ends a form. */
export function FormActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>
}
