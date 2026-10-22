const locale = import.meta.env.VITE_LOCALE || 'es-CO'

export function formatStockDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return 'Fecha no disponible'
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return 'Fecha no disponible'
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
}
