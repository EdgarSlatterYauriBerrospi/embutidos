import { daysUntilExpiration } from './expirationRules.js'
import {
  formatLocalDate,
  formatLocalDateTime,
  formatRelativeTime,
  parseLocalDateTime,
  toLocalDateKey,
} from './dateTime.js'
import { MOVEMENT_TYPES } from './stockRules.js'

const LOCALE = 'es-PE'

function numberValue(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function productMap(products) {
  return new Map(products.map((product) => [String(product.id), product]))
}

function registrantLabel(userId, user) {
  return user && String(userId) === String(user.userId)
    ? user.name
    : `Usuario #${userId}`
}

function createSevenDaySeries(sales, now) {
  const totalsByDay = sales.reduce((totals, sale) => {
    const key = toLocalDateKey(sale.saleDate)
    if (key) totals.set(key, (totals.get(key) ?? 0) + numberValue(sale.total))
    return totals
  }, new Map())

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index))
    const key = toLocalDateKey(date)
    return {
      day: new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: 'short' })
        .format(date)
        .replace('.', ''),
      total: totalsByDay.get(key) ?? 0,
    }
  })
}

function createTopProducts(sales, productsById) {
  const totals = new Map()

  sales.forEach((sale) => {
    sale.lines?.forEach((line) => {
      const key = String(line.productId)
      const current = totals.get(key) ?? { quantity: 0, total: 0 }
      current.quantity += numberValue(line.quantity)
      current.total += numberValue(line.subtotal)
      totals.set(key, current)
    })
  })

  return [...totals.entries()]
    .map(([id, totalsForProduct]) => ({
      id,
      name: productsById.get(id)?.name ?? `Producto #${id}`,
      quantity: `${totalsForProduct.quantity} unidades`,
      total: totalsForProduct.total,
    }))
    .sort((first, second) => second.total - first.total)
    .slice(0, 5)
}

function createRecentActivity({ sales, purchases, movements }, now) {
  const saleActivity = sales.map((sale) => sale.status === 'CANCELLED' ? ({
    id: `sale-cancelled-${sale.id}`,
    type: 'cancellation',
    title: 'Venta anulada',
    timestamp: sale.cancellationDate,
    amount: numberValue(sale.total),
  }) : ({
    id: `sale-${sale.id}`,
    type: 'sale',
    title: 'Venta registrada',
    timestamp: sale.saleDate,
    amount: numberValue(sale.total),
  }))
  const purchaseActivity = purchases.map((purchase) => ({
    id: `purchase-${purchase.id}`,
    type: 'purchase',
    title: 'Mercadería recibida',
    timestamp: purchase.purchaseDate,
    amount: numberValue(purchase.total),
  }))
  const movementActivity = movements
    .filter((movement) => !['SALE_OUT', 'PURCHASE_IN', 'SALE_CANCELLATION_IN'].includes(movement.type))
    .map((movement) => ({
      id: `movement-${movement.id}`,
      type: 'movement',
      title: MOVEMENT_TYPES[movement.type]?.label ?? 'Movimiento de stock',
      timestamp: movement.movementDate,
    }))

  return [...saleActivity, ...purchaseActivity, ...movementActivity]
    .filter((activity) => parseLocalDateTime(activity.timestamp))
    .sort(
      (first, second) =>
        parseLocalDateTime(second.timestamp).getTime() -
        parseLocalDateTime(first.timestamp).getTime(),
    )
    .slice(0, 5)
    .map((activity) => ({
      ...activity,
      timeLabel: formatRelativeTime(activity.timestamp, now),
    }))
}

export function buildDashboardData(sources = {}, user, now = new Date()) {
  const employeeView = user?.role === 'EMPLOYEE'
  const belongsToUser = (record) => String(record.userId) === String(user?.userId)
  const sales = employeeView ? (sources.sales ?? []).filter(belongsToUser) : (sources.sales ?? [])
  const completedSales = sales.filter((sale) => sale.status !== 'CANCELLED')
  const products = sources.products ?? []
  const batches = sources.batches ?? []
  const purchases = employeeView ? (sources.purchases ?? []).filter(belongsToUser) : (sources.purchases ?? [])
  const movements = employeeView ? (sources.movements ?? []).filter(belongsToUser) : (sources.movements ?? [])
  const todayKey = toLocalDateKey(now)
  const currentMonthSales = completedSales.filter((sale) => {
    const date = parseLocalDateTime(sale.saleDate)
    return date && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  })
  const todaySales = completedSales.filter((sale) => toLocalDateKey(sale.saleDate) === todayKey)
  const productsById = productMap(products)
  const lowStock = products
    .filter(
      (product) =>
        product.active && numberValue(product.stock) <= numberValue(product.minimumStock),
    )
    .sort((first, second) => numberValue(first.stock) - numberValue(second.stock))
  const expiringBatches = batches
    .filter((batch) => {
      const days = daysUntilExpiration(batch.expirationDate, now)
      return batch.active && numberValue(batch.quantity) > 0 && days !== null && days >= 0 && days <= 30
    })
    .sort((first, second) => String(first.expirationDate).localeCompare(String(second.expirationDate)))

  return {
    locale: LOCALE,
    currency: 'PEN',
    periodLabel: new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' }).format(now),
    summary: {
      todaySales: todaySales.reduce((total, sale) => total + numberValue(sale.total), 0),
      monthSales: currentMonthSales.reduce((total, sale) => total + numberValue(sale.total), 0),
      salesCount: currentMonthSales.length,
      lowStockCount: lowStock.length,
      expiringCount: expiringBatches.length,
    },
    dailySales: createSevenDaySeries(completedSales, now),
    lowStock: lowStock.slice(0, 5).map((product) => ({
      id: product.id,
      name: product.name,
      stock: numberValue(product.stock),
      minimum: numberValue(product.minimumStock),
    })),
    expiringProducts: expiringBatches.slice(0, 5).map((batch) => ({
      id: batch.id,
      name: productsById.get(String(batch.productId))?.name ?? `Producto #${batch.productId}`,
      batch: batch.id,
      expiryLabel: formatLocalDate(batch.expirationDate),
      quantity: `${numberValue(batch.quantity)} unidades`,
    })),
    topProducts: createTopProducts(currentMonthSales, productsById),
    recentSales: [...sales]
      .filter((sale) => parseLocalDateTime(sale.saleDate))
      .sort(
        (first, second) =>
          parseLocalDateTime(second.saleDate).getTime() -
          parseLocalDateTime(first.saleDate).getTime(),
      )
      .slice(0, 5)
      .map((sale) => ({
        id: sale.id,
        reference: `Venta #${sale.id}`,
        registeredBy: registrantLabel(sale.userId, user),
        dateLabel: formatLocalDateTime(sale.saleDate),
        total: numberValue(sale.total),
        statusLabel: sale.status === 'CANCELLED' ? 'Anulada' : 'Registrada',
      })),
    recentActivity: createRecentActivity({ sales, purchases, movements }, now),
  }
}
