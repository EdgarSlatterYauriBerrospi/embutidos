import { localDateIso } from './expirationRules.js'

export const REPORT_TYPES = [
  { id: 'sales', label: 'Ventas', usesDateRange: true },
  { id: 'stock', label: 'Stock', usesDateRange: false },
  { id: 'expirations', label: 'Vencimientos', usesDateRange: true },
  { id: 'purchases', label: 'Compras', usesDateRange: true },
  { id: 'stock-movements', label: 'Movimientos de stock', usesDateRange: true },
]

export function reportDefinition(reportType) {
  return REPORT_TYPES.find(({ id }) => id === reportType)
}

export function defaultReportDates(today = new Date()) {
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  return { fromDate: localDateIso(firstDay), toDate: localDateIso(today) }
}

export function validateReportFilters(reportType, filters) {
  if (!reportDefinition(reportType)?.usesDateRange) return ''
  if (!filters.fromDate || !filters.toDate) return 'Selecciona ambas fechas.'
  if (filters.fromDate > filters.toDate) return 'La fecha inicial no puede ser posterior a la fecha final.'
  return ''
}
