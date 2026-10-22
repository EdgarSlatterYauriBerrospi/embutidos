import axios from 'axios'

export function getSupplierError(error) {
  if (!axios.isAxiosError(error)) return error.message || 'No se pudo completar la operación.'
  const status = error.response?.status
  if (status === 401) return 'Tu sesión ha vencido. Inicia sesión nuevamente.'
  if (status === 403) return 'No tienes permiso para gestionar proveedores.'
  if (status === 404) return 'El proveedor ya no está disponible.'
  if (status === 400) return 'Los datos del proveedor no son válidos. Revisa el formulario.'
  if (status === 409) return 'El proveedor tiene un conflicto con los datos actuales. Recarga e intenta nuevamente.'
  return 'No se pudo conectar con el servicio de proveedores. Intenta nuevamente.'
}
