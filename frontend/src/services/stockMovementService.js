import api from './api.js'

export async function getAllStockMovements() {
  const { data } = await api.get('/api/stock-movements')
  if (!Array.isArray(data)) throw new Error('La respuesta de movimientos no es válida.')
  return data
}

export async function getMovementsByProduct(productId) {
  const { data } = await api.get(`/api/stock-movements/product/${encodeURIComponent(productId)}`)
  if (!Array.isArray(data)) throw new Error('La respuesta de movimientos no es válida.')
  return data
}
