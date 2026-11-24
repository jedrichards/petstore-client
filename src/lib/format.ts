const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })
const numberFormat = new Intl.NumberFormat()

export function formatDateTime(value: string | number | Date | undefined): string {
  if (value === undefined || value === '') return '—'

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormat.format(date)
}

export function formatDate(value: string | number | Date | undefined): string {
  if (value === undefined || value === '') return '—'

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? '—' : dateFormat.format(date)
}

export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`
}

export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** Converts an ISO timestamp to the value a datetime-local input expects. */
export function toDateTimeLocal(value: string | undefined): string {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)

  return local.toISOString().slice(0, 16)
}
