import { filterProducts } from './productRules.js'

const decimalCost = /^\d{1,10}(\.\d{1,2})?$/
const isoDate = /^\d{4}-\d{2}-\d{2}$/

export function canManagePurchases(user) {
  return user?.role === 'ADMIN'
}

export function availablePurchaseProducts(products, query) {
  return filterProducts(products.filter((product) => product.active), query)
}

export function availableSuppliers(suppliers) {
  return suppliers.filter((supplier) => supplier.active)
}

export function purchaseLineSubtotal(line) {
  return Number(line.quantity) * Number(line.unitCost)
}

export function purchaseTotal(lines) {
  return lines.reduce((total, line) => total + (Number.isFinite(purchaseLineSubtotal(line)) ? purchaseLineSubtotal(line) : 0), 0)
}

export function validatePurchase({ supplierId, userId, invoiceNumber, lines }) {
  if (!Number.isSafeInteger(Number(userId)) || Number(userId) < 1) return 'No se pudo identificar al usuario autenticado.'
  if (!Number.isSafeInteger(Number(supplierId)) || Number(supplierId) < 1) return 'Selecciona un proveedor.'
  if ((invoiceNumber ?? '').trim().length > 100) return 'El número de comprobante debe tener máximo 100 caracteres.'
  if (!lines.length) return 'Agrega al menos un producto.'
  for (const line of lines) {
    if (!Number.isSafeInteger(Number(line.productId)) || Number(line.productId) < 1) return 'Selecciona un producto válido.'
    if (!/^\d+$/.test(String(line.quantity)) || Number(line.quantity) < 1 || Number(line.quantity) > 2147483647) return 'Ingresa una cantidad entera mayor que cero.'
    if (!decimalCost.test(String(line.unitCost))) return 'Ingresa un costo unitario válido, con hasta dos decimales.'
    if (!isoDate.test(line.entryDate ?? '') || !isoDate.test(line.expirationDate ?? '')) return 'Completa las fechas de ingreso y vencimiento de cada producto.'
  }
  return ''
}

// PurchaseRequest and PurchaseLineRequest fields only; totals and stock belong to the backend.
export function toPurchaseRequest({ supplierId, userId, invoiceNumber, lines }) {
  return {
    supplierId: Number(supplierId),
    userId: Number(userId),
    invoiceNumber: (invoiceNumber ?? '').trim() || null,
    lines: lines.map((line) => ({
      productId: Number(line.productId),
      quantity: Number(line.quantity),
      unitCost: String(line.unitCost),
      entryDate: line.entryDate,
      expirationDate: line.expirationDate,
    })),
  }
}

export function purchaseReferenceLabel(id, records, singular) {
  return records.find((record) => String(record.id) === String(id))?.name ?? `${singular} #${id}`
}
