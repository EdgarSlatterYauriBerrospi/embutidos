import { sortBatchesByExpiration } from './stockRules.js'

export const EXPIRATION_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: '7', label: '≤ 7 días', days: 7 },
  { id: '15', label: '≤ 15 días', days: 15 },
  { id: '30', label: '≤ 30 días', days: 30 },
  { id: 'expired', label: 'Vencidos' },
]

function calendarDay(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}

function expirationDay(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  return date.getTime()
}

export function localDateIso(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function localDatePlusDays(days, today = new Date()) {
  const date = new Date(calendarDay(today) + days * 86400000)
  return date.toISOString().slice(0, 10)
}

export function daysUntilExpiration(value, today = new Date()) {
  const expiry = expirationDay(value)
  return expiry === null ? null : (expiry - calendarDay(today)) / 86400000
}

export function expirationStatus(batch, today = new Date()) {
  const days = daysUntilExpiration(batch.expirationDate, today)
  if (days === null) return { label: 'Sin fecha', tone: 'neutral', days }
  if (days < 0) return { label: 'Vencido', tone: 'expired', days }
  if (days <= 7) return { label: 'Urgente', tone: 'urgent', days }
  if (days <= 15) return { label: 'Próximo', tone: 'soon', days }
  if (days <= 30) return { label: 'Por vencer', tone: 'upcoming', days }
  return { label: 'Vigente', tone: 'current', days }
}

export function daysRemainingLabel(days) {
  if (days === null) return 'Días no disponibles'
  if (days === 0) return 'Vence hoy'
  if (days < 0) return `Venció hace ${Math.abs(days)} ${days === -1 ? 'día' : 'días'}`
  return days === 1 ? '1 día restante' : `${days} días restantes`
}

export function filterExpirationBatches(batches, filterId, today = new Date()) {
  const days = EXPIRATION_FILTERS.find((filter) => filter.id === filterId)?.days
  return sortBatchesByExpiration(batches.filter((batch) => {
    if (!batch.active || Number(batch.quantity) <= 0) return false
    const remaining = daysUntilExpiration(batch.expirationDate, today)
    if (remaining === null) return false
    if (filterId === 'expired') return remaining < 0
    if (days !== undefined) return remaining >= 0 && remaining <= days
    return true
  }))
}
