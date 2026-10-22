import api from './api.js'
import { toSaleRequest } from '../utils/saleRules.js'

const endpoint = '/api/sales'

export async function getAllSales() {
  const { data } = await api.get(endpoint)
  if (!Array.isArray(data)) throw new Error('La respuesta de ventas no es válida.')
  return data
}

export async function getSaleById(id) {
  const { data } = await api.get(`${endpoint}/${encodeURIComponent(id)}`)
  return data
}

export async function createSale(data) {
  const { data: sale } = await api.post(endpoint, toSaleRequest(data))
  return sale
}

export async function cancelSale(id, reason) {
  const { data } = await api.post(`${endpoint}/${encodeURIComponent(id)}/cancel`, {
    reason: reason.trim(),
  })
  return data
}
