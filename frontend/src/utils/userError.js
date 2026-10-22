import axios from 'axios'

export function getUserError(error) {
  if (!axios.isAxiosError(error)) return error.message || 'No se pudo completar la operación.'
  const status = error.response?.status
  if (status === 401) return 'Tu sesión ha vencido. Inicia sesión nuevamente.'
  if (status === 403) return 'No tienes permiso para gestionar usuarios.'
  if (status === 404) return 'El usuario o el rol ya no está disponible.'
  if (status === 400) return 'Los datos del usuario no son válidos. Revisa el formulario.'
  if (status === 409) return 'La operación tiene un conflicto con los datos actuales. Recarga e intenta nuevamente.'
  return 'No se pudo conectar con el servicio de usuarios. Intenta nuevamente.'
}
