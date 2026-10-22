import axios from 'axios'

export function getProductError(error) {
  if (!axios.isAxiosError(error)) return error.message || 'No se pudo completar la operación.'
  const status = error.response?.status
  if (status === 401) return 'Tu sesión no es válida o ha vencido. Cierra sesión e inicia nuevamente.'
  if (status === 403) return 'No tienes permiso para realizar esta operación.'
  if (status === 404) return 'El producto no existe o ya no está disponible.'
  if (status === 400) return 'Los datos no son válidos. Revisa los campos e intenta nuevamente.'
  if (status === 409) return 'La operación tiene un conflicto con los datos actuales. Recarga e intenta nuevamente.'
  return 'No se pudo conectar con el servicio de productos. Intenta nuevamente.'
}
