import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

import { cx } from '@/lib/cx'

import styles from './Alert.module.css'

type AlertTone = 'info' | 'success' | 'warning' | 'danger'

const icons: Record<AlertTone, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
}

export interface AlertProps {
  tone?: AlertTone
  title?: ReactNode
  children?: ReactNode
  /** A button or link placed at the trailing edge. */
  action?: ReactNode
  className?: string
}

export function Alert({ tone = 'info', title, children, action, className }: AlertProps) {
  const Icon = icons[tone]

  return (
    <div
      className={cx(styles.alert, styles[tone], className)}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <Icon className={styles.icon} aria-hidden />
      <div className={styles.content}>
        {title ? <p className={styles.title}>{title}</p> : null}
        {children ? <div className={styles.body}>{children}</div> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}
