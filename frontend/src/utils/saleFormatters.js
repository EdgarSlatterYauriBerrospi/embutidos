import { formatProductPrice } from './productFormatters.js'

export const formatSaleMoney = formatProductPrice

export function formatSaleDateTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { date: 'Fecha no disponible', time: 'Hora no disponible' }
  const locale = import.meta.env.VITE_LOCALE || 'es-CO'
  return {
    date: new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date),
    time: new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date),
  }
}

export function registeredByLabel(sale, user) {
  return sale.userId === user?.userId ? user.name : `Usuario #${sale.userId}`
}
