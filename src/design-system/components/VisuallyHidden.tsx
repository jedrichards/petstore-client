import type { HTMLAttributes } from 'react'

import styles from './VisuallyHidden.module.css'

/** Content for assistive technology only. */
export function VisuallyHidden(props: HTMLAttributes<HTMLSpanElement>) {
  return <span className={styles.hidden} {...props} />
}
