import api from './api.js'
import { toProductRequest } from '../utils/productRules.js'

const endpoint = '/api/products'

export async function getAllProducts() {
  const { data } = await api.get(endpoint)
  if (!Array.isArray(data)) throw new Error('La respuesta de productos no es válida.')
  return data
}

export async function getProductById(id) {
  const { data } = await api.get(`${endpoint}/${encodeURIComponent(id)}`)
  return data
}

export async function createProduct(data) {
  const response = await api.post(endpoint, toProductRequest(data))
  return response.data
}

export async function updateProduct(id, data) {
  const response = await api.put(`${endpoint}/${encodeURIComponent(id)}`, toProductRequest(data))
  return response.data
}

export async function deactivateProduct(id) {
  await api.patch(`${endpoint}/${encodeURIComponent(id)}/deactivate`)
}
