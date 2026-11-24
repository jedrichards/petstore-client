import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

import { cx } from '@/lib/cx'

import { IconButton } from './Button'
import styles from './Dialog.module.css'
import { Heading, Text } from './Text'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  /** Buttons shown in the footer, primary action last. */
  actions?: ReactNode
  size?: 'sm' | 'md'
}

/** A modal dialog built on the native dialog element. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  size = 'sm',
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current

    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={cx(styles.dialog, styles[size])}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop lands on the dialog element itself.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <Heading level={2} size="md" id={titleId}>
              {title}
            </Heading>
            {description ? (
              <Text tone="muted" id={descriptionId}>
                {description}
              </Text>
            ) : null}
          </div>
          <IconButton label="Close" size="sm" onClick={onClose}>
            <X />
          </IconButton>
        </header>

        {children ? <div className={styles.body}>{children}</div> : null}

        {actions ? <footer className={styles.footer}>{actions}</footer> : null}
      </div>
    </dialog>
  )
}
