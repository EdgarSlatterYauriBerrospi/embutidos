import axios from 'axios'

export function getReportError(error, action = 'load') {
  if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status)) {
    return 'No tienes autorización para acceder a este reporte.'
  }
  if (action === 'export') return 'No se pudo generar el PDF. Inténtalo nuevamente.'
  return 'No se pudo cargar el resumen del reporte.'
}
