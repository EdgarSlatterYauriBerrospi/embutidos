import api from './api.js'
import { toUserRequest } from '../utils/userRules.js'

const endpoint = '/api/users'

// The backend restricts this endpoint to ADMIN.
export async function getAllUsers() {
  const { data } = await api.get(endpoint)
  if (!Array.isArray(data)) throw new Error('La respuesta de usuarios no es válida.')
  return data
}

export async function getUserById(id) {
  const { data } = await api.get(`${endpoint}/${encodeURIComponent(id)}`)
  return data
}

export async function createUser(data) {
  const response = await api.post(endpoint, toUserRequest(data, false))
  return response.data
}

export async function updateUser(id, data) {
  const response = await api.put(`${endpoint}/${encodeURIComponent(id)}`, toUserRequest(data, true))
  return response.data
}

export async function deactivateUser(id) {
  await api.patch(`${endpoint}/${encodeURIComponent(id)}/deactivate`)
}
