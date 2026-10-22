import api from './api.js'
import { toSupplierRequest } from '../utils/supplierRules.js'

const endpoint = '/api/suppliers'

export async function getAllSuppliers() {
  const { data } = await api.get(endpoint)
  if (!Array.isArray(data)) throw new Error('La respuesta de proveedores no es válida.')
  return data
}

export async function getSupplierById(id) {
  const { data } = await api.get(`${endpoint}/${encodeURIComponent(id)}`)
  return data
}

export async function createSupplier(data) {
  const response = await api.post(endpoint, toSupplierRequest(data))
  return response.data
}

export async function updateSupplier(id, data) {
  const response = await api.put(`${endpoint}/${encodeURIComponent(id)}`, toSupplierRequest(data))
  return response.data
}

export async function deactivateSupplier(id) {
  await api.patch(`${endpoint}/${encodeURIComponent(id)}/deactivate`)
}
