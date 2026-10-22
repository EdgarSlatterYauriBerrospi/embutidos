// Currency is not included in ProductResponse; configure it for the deployment.
const money = new Intl.NumberFormat(import.meta.env.VITE_LOCALE || 'es-CO', {
  style: 'currency', currency: import.meta.env.VITE_CURRENCY || 'COP',
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})

export function formatProductPrice(value) {
  return money.format(value)
}
