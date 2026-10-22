import { filterProducts, isLowStock } from './productRules.js'

export const EXPIRING_SOON_DAYS = 7

export function filterStockProducts(products, query, lowStockOnly) {
  const matching = filterProducts(products, query)
  return lowStockOnly ? matching.filter(isLowStock) : matching
}

export function countLowStock(products) {
  return products.filter(isLowStock).length
}

export function sortBatchesByExpiration(batches) {
  return [...batches].sort((a, b) => String(a.expirationDate).localeCompare(String(b.expirationDate)) || Number(a.id) - Number(b.id))
}

// ISO LocalDate strings can be compared as calendar dates without UTC timezone shifts.
export function batchStatus(batch, today = new Date()) {
  if (!batch.active) return { label: 'Inactivo', tone: 'neutral' }
  if (Number(batch.quantity) <= 0) return { label: 'Agotado', tone: 'neutral' }
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const expiry = /^\d{4}-\d{2}-\d{2}$/.test(batch.expirationDate ?? '')
    ? new Date(...batch.expirationDate.split('-').map((part, index) => Number(part) - (index === 1 ? 1 : 0)))
    : null
  if (!expiry || Number.isNaN(expiry.getTime())) return { label: 'Sin fecha', tone: 'neutral' }
  if (expiry < current) return { label: 'Vencido', tone: 'danger' }
  const daysUntilExpiry = Math.round((expiry - current) / 86400000)
  if (daysUntilExpiry <= EXPIRING_SOON_DAYS) return { label: 'Próximo a vencer', tone: 'warning' }
  return { label: 'Vigente', tone: 'success' }
}

export const MOVEMENT_TYPES = {
  PURCHASE_IN: { label: 'Entrada por compra', direction: 'in' },
  SALE_OUT: { label: 'Salida por venta', direction: 'out' },
  ADJUSTMENT_IN: { label: 'Ajuste de entrada', direction: 'in' },
  ADJUSTMENT_OUT: { label: 'Ajuste de salida', direction: 'out' },
  EXPIRED_OUT: { label: 'Salida por vencimiento', direction: 'out' },
  SALE_CANCELLATION_IN: { label: 'Reversión de venta', direction: 'in' },
}

export function movementRegistrant(movement, user, users) {
  if (String(movement.userId) === String(user?.userId)) return user.name
  return users.find((entry) => String(entry.id) === String(movement.userId))?.name ?? `Usuario #${movement.userId}`
}
