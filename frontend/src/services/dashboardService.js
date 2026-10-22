import { getAllBatches } from './productBatchService.js'
import { getAllProducts } from './productService.js'
import { getAllPurchases } from './purchaseService.js'
import { getAllSales } from './saleService.js'
import { getAllStockMovements } from './stockMovementService.js'

const SOURCE_LABELS = {
  batches: 'los lotes',
  movements: 'los movimientos de stock',
  products: 'los productos',
  purchases: 'las compras',
  sales: 'las ventas',
}

function getRequestErrorMessage(error, source) {
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    return `No se pudieron cargar ${SOURCE_LABELS[source]}.`
  }

  return `No se pudieron cargar ${SOURCE_LABELS[source]}.`
}

async function settleSources(loaders) {
  const entries = Object.entries(loaders)
  const results = await Promise.allSettled(entries.map(([, loader]) => loader()))

  return results.reduce(
    (dashboardSources, result, index) => {
      const [source] = entries[index]

      if (result.status === 'fulfilled') {
        dashboardSources.data[source] = Array.isArray(result.value) ? result.value : []
      } else {
        dashboardSources.data[source] = []
        dashboardSources.errors[source] = getRequestErrorMessage(result.reason, source)
      }

      return dashboardSources
    },
    { data: {}, errors: {} },
  )
}

export async function getDashboardSources({ includeAdminData = false } = {}) {
  const loaders = {
    products: getAllProducts,
    batches: getAllBatches,
    sales: getAllSales,
  }

  if (includeAdminData) {
    Object.assign(loaders, {
      purchases: getAllPurchases,
      movements: getAllStockMovements,
    })
  }

  return settleSources(loaders)
}
