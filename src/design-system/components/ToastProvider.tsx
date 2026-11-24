import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { cx } from '@/lib/cx'

import styles from './ToastProvider.module.css'

type ToastTone = 'success' | 'danger' | 'info'

export interface ToastOptions {
  title: string
  description?: string
  tone?: ToastTone
  /** Milliseconds before the toast dismisses itself. Zero keeps it open. */
  duration?: number
}

interface ToastRecord extends Required<Pick<ToastOptions, 'title' | 'tone' | 'duration'>> {
  id: number
  description: string | undefined
}

export interface ToastApi {
  show: (options: ToastOptions) => number
  success: (title: string, description?: string) => number
  error: (title: string, description?: string) => number
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const toast = use(ToastContext)

  if (!toast) throw new Error('useToast must be used inside a ToastProvider')

  return toast
}

const icons: Record<ToastTone, typeof Info> = {
  success: CircleCheck,
  danger: CircleAlert,
  info: Info,
}

const MAX_VISIBLE = 4

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback((options: ToastOptions) => {
    const id = nextId.current++
    const tone = options.tone ?? 'info'

    const record: ToastRecord = {
      id,
      title: options.title,
      description: options.description,
      tone,
      duration: options.duration ?? (tone === 'danger' ? 8000 : 4500),
    }

    setToasts((current) => [...current, record].slice(-MAX_VISIBLE))

    return id
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      show,
      dismiss,
      success: (title, description) => show({ title, description, tone: 'success' }),
      error: (title, description) => show({ title, description, tone: 'danger' }),
    }),
    [show, dismiss],
  )

  return (
    <ToastContext value={api}>
      {children}
      <ol className={styles.region} aria-label="Notifications">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </ol>
    </ToastContext>
  )
}

function ToastItem({ toast, onDismiss }: { toast: ToastRecord; onDismiss: (id: number) => void }) {
  const Icon = icons[toast.tone]

  useEffect(() => {
    if (toast.duration === 0) return

    const timer = window.setTimeout(() => onDismiss(toast.id), toast.duration)

    return () => window.clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  return (
    <li
      className={cx(styles.toast, styles[toast.tone])}
      role={toast.tone === 'danger' ? 'alert' : 'status'}
    >
      <Icon className={styles.icon} aria-hidden />
      <div className={styles.content}>
        <p className={styles.title}>{toast.title}</p>
        {toast.description ? <p className={styles.description}>{toast.description}</p> : null}
      </div>
      <button
        type="button"
        className={styles.close}
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
      >
        <X />
      </button>
    </li>
  )
}
