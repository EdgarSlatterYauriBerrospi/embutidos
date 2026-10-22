import assert from 'node:assert/strict'
import test from 'node:test'
import { buildDashboardData } from '../src/utils/dashboardData.js'
import { formatRelativeTime } from '../src/utils/dateTime.js'

const now = new Date(2026, 8, 29, 12, 0, 0)

test('dashboard derives real metrics and seven calendar days from backend DTO values', () => {
  const data = buildDashboardData({
    sales: [
      { id: 1, saleDate: '2026-09-29T10:00:00', total: '12.50', userId: 7, lines: [{ productId: 1, quantity: '2', subtotal: '12.50' }] },
      { id: 2, saleDate: '2026-09-24T09:00:00', total: 20, userId: 8, lines: [] },
      { id: 3, saleDate: '2026-08-31T09:00:00', total: 99, userId: 8, lines: [] },
      { id: 4, saleDate: '2026-09-29T09:00:00', cancellationDate: '2026-09-29T11:30:00', status: 'CANCELLED', total: 100, userId: 8, lines: [] },
    ],
    products: [
      { id: 1, name: 'Jamón', stock: '4', minimumStock: 4, active: true },
      { id: 2, name: 'Inactivo', stock: 0, minimumStock: 5, active: false },
    ],
    batches: [
      { id: 1, productId: 1, quantity: '3', expirationDate: '2026-10-10', active: true },
      { id: 2, productId: 1, quantity: 0, expirationDate: '2026-10-01', active: true },
      { id: 3, productId: 1, quantity: 2, expirationDate: '2026-09-20', active: true },
    ],
    purchases: [],
    movements: [],
  }, { userId: 7, name: 'Ernesto' }, now)

  assert.equal(data.summary.todaySales, 12.5)
  assert.equal(data.summary.monthSales, 32.5)
  assert.equal(data.summary.salesCount, 2)
  assert.equal(data.summary.lowStockCount, 1)
  assert.equal(data.summary.expiringCount, 1)
  assert.equal(data.dailySales.length, 7)
  assert.deepEqual(data.dailySales.map((day) => day.total), [0, 20, 0, 0, 0, 0, 12.5])
})

test('recent activity is ordered by real LocalDateTime values and uses relative labels', () => {
  const data = buildDashboardData({
    sales: [{ id: 1, saleDate: '2026-09-29T11:57:00', total: 10, lines: [] }],
    purchases: [{ id: 2, purchaseDate: '2026-09-29T11:00:00', total: 50 }],
    movements: [{ id: 3, movementDate: '2026-09-28T18:00:00', type: 'ADJUSTMENT_IN' }],
    products: [],
    batches: [],
  }, null, now)

  assert.deepEqual(data.recentActivity.map((item) => item.type), ['sale', 'purchase', 'movement'])
  assert.equal(data.recentActivity[0].timeLabel, 'Hace 3 min')
  assert.equal(data.recentActivity[1].timeLabel, 'Hace 1 h')
  assert.equal(data.recentActivity[2].timeLabel, 'Ayer')
  assert.equal(formatRelativeTime('2026-09-29T11:59:30', now), 'Ahora')
})

test('employee dashboard metrics and activity include only the current employee sales', () => {
  const data = buildDashboardData({
    sales: [
      { id: 1, saleDate: '2026-09-29T10:00:00', total: 12, userId: 7, lines: [] },
      { id: 2, saleDate: '2026-09-29T11:00:00', total: 90, userId: 8, lines: [] },
    ],
    products: [],
    batches: [],
    purchases: [{ id: 3, purchaseDate: '2026-09-29T09:00:00', total: 50, userId: 8 }],
    movements: [{ id: 4, movementDate: '2026-09-29T09:30:00', type: 'ADJUSTMENT_IN', userId: 8 }],
  }, { userId: 7, name: 'Ana', role: 'EMPLOYEE' }, now)

  assert.equal(data.summary.todaySales, 12)
  assert.equal(data.summary.salesCount, 1)
  assert.equal(data.recentActivity.length, 1)
  assert.equal(data.recentActivity[0].id, 'sale-1')
})
