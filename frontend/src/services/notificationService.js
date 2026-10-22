import api from './api.js'

const endpoint = '/api/notifications'

export async function getNotifications() {
  const { data } = await api.get(endpoint)
  if (!Array.isArray(data)) throw new Error('La respuesta de notificaciones no es válida.')
  return data
}

export async function markNotificationAsRead(id) {
  const { data } = await api.patch(`${endpoint}/${encodeURIComponent(id)}/read`)
  return data
}

export async function markAllNotificationsAsRead() {
  await api.patch(`${endpoint}/read-all`)
}
