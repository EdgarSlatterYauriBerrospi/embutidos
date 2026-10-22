import axios from 'axios'

export function getSaleError(error) {
  if (!axios.isAxiosError(error)) return error.message || 'No se pudo completar la operación.'
  const status = error.response?.status
  const backendMessage = error.response?.data?.message
  if (status === 401) return 'Tu sesión no es válida o ha vencido. Inicia sesión nuevamente.'
  if (status === 403) return 'No tienes permiso para consultar estas ventas.'
  if (status === 404) return 'La venta no existe o ya no está disponible.'
  if (status === 400 && typeof backendMessage === 'string' && /already cancelled/i.test(backendMessage)) return 'Esta venta ya fue anulada.'
  if (status === 400 && typeof backendMessage === 'string' && /batch allocation data/i.test(backendMessage)) return 'Esta venta es anterior al registro de lotes por venta y no puede anularse automáticamente.'
  if (status === 400 && typeof backendMessage === 'string' && /insufficient stock/i.test(backendMessage)) return 'El servidor indica que no hay stock disponible suficiente para completar la venta.'
  if (status === 400) return 'Los datos enviados no son válidos. Revisa la venta e intenta nuevamente.'
  if (status === 409) return 'La venta no pudo completarse por un conflicto con los datos actuales. Revisa la selección.'
  return 'No se pudo conectar con el servicio de ventas. Intenta nuevamente.'
}
