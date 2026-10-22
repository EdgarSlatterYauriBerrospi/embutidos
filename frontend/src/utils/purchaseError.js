import axios from 'axios'

export function getPurchaseError(error) {
  if (!axios.isAxiosError(error)) return error.message || 'No se pudo completar la operación.'
  const status = error.response?.status
  if (status === 401) return 'Tu sesión ha vencido. Inicia sesión nuevamente.'
  if (status === 403) return 'No tienes permiso para consultar o registrar compras.'
  if (status === 404) return 'La compra o alguno de sus datos relacionados ya no está disponible.'
  if (status === 400) return 'El servidor rechazó los datos de la compra. Revísalos e intenta nuevamente.'
  if (status === 409) return 'La compra no pudo completarse por un conflicto con los datos actuales.'
  return 'No se pudo conectar con el servicio de compras. Intenta nuevamente.'
}
