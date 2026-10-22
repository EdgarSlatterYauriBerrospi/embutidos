import { daysUntilExpiration } from './expirationRules.js'
import { toLocalDateKey } from './dateTime.js'

function numberValue(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function withinRange(value, fromDate, toDate) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') ? value : toLocalDateKey(value)
  return Boolean(date && date >= fromDate && date <= toDate)
}

function dateFiltered(records, dateField, filters) {
  return records.filter((record) => withinRange(record[dateField], filters.fromDate, filters.toDate))
}

const builders = {
  sales(records, filters) {
    const sales = dateFiltered(records, 'saleDate', filters).filter((sale) => sale.status !== 'CANCELLED')
    return [
      { label: 'Total vendido', value: sales.reduce((total, sale) => total + numberValue(sale.total), 0), format: 'money' },
      { label: 'Número de ventas', value: sales.length, format: 'count' },
    ]
  },
  stock(records) {
    return [
      { label: 'Total de productos', value: records.length, format: 'count' },
      { label: 'Stock bajo', value: records.filter((product) => product.active && numberValue(product.stock) <= numberValue(product.minimumStock)).length, format: 'count' },
    ]
  },
  expirations(records, filters, now) {
    const batches = dateFiltered(records, 'expirationDate', filters)
      .filter((batch) => batch.active && numberValue(batch.quantity) > 0)
    return [
      { label: 'Por vencer', value: batches.filter((batch) => {
        const days = daysUntilExpiration(batch.expirationDate, now)
        return days !== null && days >= 0 && days <= 30
      }).length, format: 'count' },
      { label: 'Vencidos', value: batches.filter((batch) => {
        const days = daysUntilExpiration(batch.expirationDate, now)
        return days !== null && days < 0
      }).length, format: 'count' },
    ]
  },
  purchases(records, filters) {
    const purchases = dateFiltered(records, 'purchaseDate', filters)
    return [
      { label: 'Número de compras', value: purchases.length, format: 'count' },
      { label: 'Total comprado', value: purchases.reduce((total, purchase) => total + numberValue(purchase.total), 0), format: 'money' },
    ]
  },
  'stock-movements'(records, filters) {
    const movements = dateFiltered(records, 'movementDate', filters)
    return [
      { label: 'Movimientos', value: movements.length, format: 'count' },
      { label: 'Unidades movidas', value: movements.reduce((total, movement) => total + Math.abs(numberValue(movement.quantity)), 0), format: 'count' },
    ]
  },
}

export function buildReportSummary(reportType, records = [], filters = {}, now = new Date()) {
  return builders[reportType]?.(records, filters, now) ?? []
}
