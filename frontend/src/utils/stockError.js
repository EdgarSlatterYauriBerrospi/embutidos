import axios from 'axios'

export function getStockError(error, subject = 'stock') {
  if (!axios.isAxiosError(error)) return error.message || `No se pudo cargar ${subject}.`
  const status = error.response?.status
  if (status === 401) return 'Tu sesión ha vencido. Inicia sesión nuevamente.'
  if (status === 403) return `No tienes permiso para consultar ${subject}.`
  if (status === 404) return 'El producto ya no está disponible.'
  return `No se pudo cargar ${subject}. Intenta nuevamente.`
}
