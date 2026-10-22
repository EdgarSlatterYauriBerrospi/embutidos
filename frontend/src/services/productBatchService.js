import api from './api.js'

const endpoint = '/api/product-batches'

export async function getAllBatches() {
  const { data } = await api.get(endpoint)
  if (!Array.isArray(data)) throw new Error('La respuesta de lotes no es válida.')
  return data
}

export async function getBatchesByProduct(productId) {
  const { data } = await api.get(`${endpoint}/product/${encodeURIComponent(productId)}`)
  if (!Array.isArray(data)) throw new Error('La respuesta de lotes no es válida.')
  return data
}

export async function getExpiringBatches(fromDate, toDate) {
  const { data } = await api.get(`${endpoint}/expiring`, { params: { fromDate, toDate } })
  if (!Array.isArray(data)) throw new Error('La respuesta de lotes próximos a vencer no es válida.')
  return data
}
