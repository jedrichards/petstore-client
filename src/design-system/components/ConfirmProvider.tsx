import { createContext, use, useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from './Button'
import { Dialog } from './Dialog'

export interface ConfirmOptions {
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** Styles the confirm button as destructive. */
  danger?: boolean
}

type Confirm = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<Confirm | null>(null)

/** Returns a function that asks the user to confirm and resolves their answer. */
export function useConfirm(): Confirm {
  const confirm = use(ConfirmContext)

  if (!confirm) throw new Error('useConfirm must be used inside a ConfirmProvider')

  return confirm
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [open, setOpen] = useState(false)
  const resolver = useRef<((confirmed: boolean) => void) | null>(null)

  const confirm = useCallback<Confirm>((next) => {
    // A second request while one is open cancels the first.
    resolver.current?.(false)

    setOptions(next)
    setOpen(true)

    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const settle = useCallback((confirmed: boolean) => {
    resolver.current?.(confirmed)
    resolver.current = null
    setOpen(false)
  }, [])

  const value = useMemo(() => confirm, [confirm])

  return (
    <ConfirmContext value={value}>
      {children}
      <Dialog
        open={open}
        onClose={() => settle(false)}
        title={options?.title ?? ''}
        description={options?.description}
        actions={
          <>
            <Button onClick={() => settle(false)}>{options?.cancelLabel ?? 'Cancel'}</Button>
            <Button variant={options?.danger ? 'danger' : 'primary'} onClick={() => settle(true)}>
              {options?.confirmLabel ?? 'Confirm'}
            </Button>
          </>
        }
      />
    </ConfirmContext>
  )
}
