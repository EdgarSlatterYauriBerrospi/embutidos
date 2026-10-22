const DEFAULT_LOCALE = 'es-PE'

export function parseLocalDateTime(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime())
  }

  if (typeof value !== 'string' && typeof value !== 'number') return null

  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

export function toLocalDateKey(value) {
  const date = parseLocalDateTime(value)
  if (!date) return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatLocalDateTime(value, locale = DEFAULT_LOCALE) {
  const date = parseLocalDateTime(value)
  if (!date) return 'Fecha no disponible'

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function formatLocalDate(value, locale = DEFAULT_LOCALE) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return 'Fecha no disponible'
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return 'Fecha no disponible'
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
}

export function formatRelativeTime(value, now = new Date(), locale = DEFAULT_LOCALE) {
  const date = parseLocalDateTime(value)
  const reference = parseLocalDateTime(now)
  if (!date || !reference) return 'Fecha no disponible'

  const differenceMilliseconds = reference.getTime() - date.getTime()
  if (differenceMilliseconds < 0) {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
    }).format(date)
  }

  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const referenceDay = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
  )
  const calendarDays = Math.round(
    (referenceDay.getTime() - dateDay.getTime()) / 86_400_000,
  )

  if (calendarDays === 1) return 'Ayer'
  if (calendarDays > 1) return `Hace ${calendarDays} días`

  const minutes = Math.floor(differenceMilliseconds / 60_000)
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  return `Hace ${Math.floor(minutes / 60)} h`
}
