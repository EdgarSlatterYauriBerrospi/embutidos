import api from './api.js'
import { toPurchaseRequest } from '../utils/purchaseRules.js'

const endpoint = '/api/purchases'

export async function getAllPurchases() {
  const { data } = await api.get(endpoint)
  if (!Array.isArray(data)) throw new Error('La respuesta de compras no es válida.')
  return data
}

export async function getPurchaseById(id) {
  const { data } = await api.get(`${endpoint}/${encodeURIComponent(id)}`)
  return data
}

export async function createPurchase(data) {
  const { data: purchase } = await api.post(endpoint, toPurchaseRequest(data))
  return purchase
}
