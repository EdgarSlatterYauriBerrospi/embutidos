import api from './api.js'
import { getAllBatches } from './productBatchService.js'
import { getAllProducts } from './productService.js'
import { getAllPurchases } from './purchaseService.js'
import { getAllSales } from './saleService.js'
import { getAllStockMovements } from './stockMovementService.js'
import { reportDefinition } from '../utils/reportDefinitions.js'

const previewLoaders = {
  sales: getAllSales,
  stock: getAllProducts,
  expirations: getAllBatches,
  purchases: getAllPurchases,
  'stock-movements': getAllStockMovements,
}

const exportsByType = {
  sales: { endpoint: '/api/reports/sales/pdf', filename: 'sales-report.pdf' },
  stock: { endpoint: '/api/reports/stock/pdf', filename: 'stock-report.pdf' },
  expirations: { endpoint: '/api/reports/expirations/pdf', filename: 'expirations-report.pdf' },
  purchases: { endpoint: '/api/reports/purchases/pdf', filename: 'purchases-report.pdf' },
  'stock-movements': { endpoint: '/api/reports/stock-movements/pdf', filename: 'stock-movements-report.pdf' },
}

function requireReportEntry(entries, reportType) {
  const entry = entries[reportType]
  if (!entry) throw new Error('Tipo de reporte no válido.')
  return entry
}

export async function getReportPreviewRecords(reportType) {
  return requireReportEntry(previewLoaders, reportType)()
}

export async function exportReportPdf(reportType, filters) {
  const reportExport = requireReportEntry(exportsByType, reportType)
  const params = reportDefinition(reportType)?.usesDateRange
    ? { fromDate: filters.fromDate, toDate: filters.toDate }
    : undefined
  const { data } = await api.get(reportExport.endpoint, {
    params,
    responseType: 'blob',
    headers: { Accept: 'application/pdf' },
  })

  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = reportExport.filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  return reportExport.filename
}
