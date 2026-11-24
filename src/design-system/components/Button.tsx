import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import type { LinkProps } from 'react-router'

import { cx } from '@/lib/cx'

import type { Size } from '../tokens/tokens'
import styles from './Button.module.css'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonStyleProps {
  variant?: ButtonVariant
  size?: Size
  fullWidth?: boolean
  iconStart?: ReactNode
  iconEnd?: ReactNode
}

function buttonClassName(
  { variant = 'secondary', size = 'md', fullWidth = false }: ButtonStyleProps,
  className?: string,
): string {
  return cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className)
}

export interface ButtonProps extends ButtonStyleProps, ButtonHTMLAttributes<HTMLButtonElement> {
  /** Shows a spinner and blocks interaction while work is in flight. */
  loading?: boolean
}

export function Button({
  variant,
  size,
  fullWidth,
  iconStart,
  iconEnd,
  loading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : iconStart}
      {children}
      {iconEnd}
    </button>
  )
}

export interface LinkButtonProps extends ButtonStyleProps, LinkProps {}

/** A router link that looks like a button. */
export function LinkButton({
  variant,
  size,
  fullWidth,
  iconStart,
  iconEnd,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link className={buttonClassName({ variant, size, fullWidth }, className)} {...rest}>
      {iconStart}
      {children}
      {iconEnd}
    </Link>
  )
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: the button has no visible text. */
  label: string
  variant?: Exclude<ButtonVariant, 'primary'>
  size?: Size
  pressed?: boolean
}

export function IconButton({
  label,
  variant = 'ghost',
  size = 'md',
  pressed,
  type = 'button',
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        styles.button,
        styles.iconOnly,
        styles[variant],
        styles[size],
        pressed && styles.pressed,
        className,
      )}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      {...rest}
    />
  )
}
