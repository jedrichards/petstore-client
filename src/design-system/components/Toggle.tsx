import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

import { cx } from '@/lib/cx'

import styles from './Toggle.module.css'

interface ToggleProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange' | 'checked'
> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: ReactNode
  description?: ReactNode
}

export type CheckboxProps = ToggleProps
export type SwitchProps = ToggleProps

export function Checkbox(props: CheckboxProps) {
  return <Toggle kind="checkbox" {...props} />
}

/** A checkbox styled as an on/off switch, for settings that apply at once. */
export function Switch(props: SwitchProps) {
  return <Toggle kind="switch" {...props} />
}

function Toggle({
  kind,
  checked,
  onCheckedChange,
  label,
  description,
  className,
  ...rest
}: ToggleProps & { kind: 'checkbox' | 'switch' }) {
  const descriptionId = useId()

  return (
    <label className={cx(styles.toggle, className)}>
      <input
        type="checkbox"
        role={kind === 'switch' ? 'switch' : undefined}
        className={cx(styles.input, styles[kind])}
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        aria-describedby={description ? descriptionId : undefined}
        {...rest}
      />
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {description ? (
          <span className={styles.description} id={descriptionId}>
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}
