export function formatMoney(value, { locale = 'es-PE', currency = 'PEN' } = {}) {
  return new Intl.NumberFormat(locale, {
    style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(value)
}

export function formatCount(value, locale = 'es-PE') {
  return new Intl.NumberFormat(locale).format(value)
}
