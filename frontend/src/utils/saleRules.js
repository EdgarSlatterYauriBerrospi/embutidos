export const PAYMENT_METHODS = ['CASH', 'YAPE_PLIN']

const INVALID_SALE_SELECTION = 'Los datos de la venta o el stock disponible cambiaron. Revisa la selección.'

function toPositiveInteger(value) {
  const number = Number(value)
  return Number.isSafeInteger(number) && number > 0 ? number : null
}

function toStock(value) {
  const number = Number(value)
  return Number.isSafeInteger(number) && number >= 0 ? number : null
}

function toPrice(value) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

function normalizeProduct(product) {
  return {
    ...product,
    id: toPositiveInteger(product?.id),
    price: toPrice(product?.price),
    stock: toStock(product?.stock),
  }
}

export function paymentMethodLabel(method) {
  return method === 'CASH' ? 'Efectivo' : method === 'YAPE_PLIN' ? 'Yape / Plin' : method
}

export function canCancelSales(user) {
  return user?.role === 'ADMIN'
}

export function isSaleCancelled(sale) {
  return sale?.status === 'CANCELLED'
}

export function createEmployeeSaleSequence(sales, userId) {
  return new Map(
    sales
      .filter((sale) => String(sale.userId) === String(userId))
      .sort((first, second) => {
        const dateOrder = String(first.saleDate ?? '').localeCompare(String(second.saleDate ?? ''))
        return dateOrder || Number(first.id) - Number(second.id)
      })
      .map((sale, index) => [String(sale.id), index + 1]),
  )
}

export function availableProducts(products, query = '') {
  const term = query.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  return products.filter((product) => product.active && Number(product.stock) > 0 && `${product.name} ${product.description ?? ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(term))
}

export function addCartProduct(lines, product) {
  const normalizedProduct = normalizeProduct(product)
  if (!normalizedProduct.id || normalizedProduct.stock === null || normalizedProduct.stock < 1 || normalizedProduct.price === null) return lines
  const current = lines.find((line) => toPositiveInteger(line.product.id) === normalizedProduct.id)
  if (!current) return [...lines, { product: normalizedProduct, quantity: 1 }]
  return setCartQuantity(lines, normalizedProduct.id, Number(current.quantity) + 1)
}

export function setCartQuantity(lines, productId, quantity) {
  const normalizedId = toPositiveInteger(productId)
  return lines.map((line) => {
    if (toPositiveInteger(line.product.id) !== normalizedId) return line
    const stock = toStock(line.product.stock)
    const requestedQuantity = toPositiveInteger(quantity) ?? 1
    return { ...line, quantity: Math.max(1, Math.min(requestedQuantity, stock ?? 1)) }
  })
}

export function removeCartProduct(lines, productId) {
  const normalizedId = toPositiveInteger(productId)
  return lines.filter((line) => toPositiveInteger(line.product.id) !== normalizedId)
}

export function calculateCartTotal(lines) {
  return lines.reduce((total, line) => total + (toPrice(line.product.price) ?? 0) * (toPositiveInteger(line.quantity) ?? 0), 0)
}

export function revalidateSaleLines(lines, products) {
  if (!Array.isArray(lines) || !Array.isArray(products)) return { lines: [], error: INVALID_SALE_SELECTION }

  const productsById = new Map()
  products.forEach((product) => {
    const normalized = normalizeProduct(product)
    if (normalized.id) productsById.set(normalized.id, normalized)
  })

  const refreshedLines = []
  for (const line of lines) {
    const productId = toPositiveInteger(line?.product?.id)
    const quantity = toPositiveInteger(line?.quantity)
    const selectedPrice = toPrice(line?.product?.price)
    const currentProduct = productsById.get(productId)

    if (!productId || !quantity || selectedPrice === null || !currentProduct || !currentProduct.active) {
      return { lines: [], error: INVALID_SALE_SELECTION }
    }
    if (currentProduct.stock === null || currentProduct.stock < quantity || currentProduct.price === null || currentProduct.price !== selectedPrice) {
      return { lines: [], error: INVALID_SALE_SELECTION }
    }
    refreshedLines.push({ product: currentProduct, quantity })
  }

  return { lines: refreshedLines, error: '' }
}

export function toSaleRequest({ userId, paymentMethod, paymentReference, lines }) {
  return {
    userId: toPositiveInteger(userId),
    paymentMethod,
    paymentReference: paymentMethod === 'YAPE_PLIN' ? (paymentReference ?? '').trim() || null : null,
    lines: lines.map((line) => ({ productId: toPositiveInteger(line.product.id), quantity: toPositiveInteger(line.quantity) })),
  }
}

export function validateSalePayment({ userId, paymentMethod, paymentReference, lines }) {
  if (!toPositiveInteger(userId)) return 'No se pudo identificar al usuario autenticado.'
  if (!lines.length) return 'Agrega al menos un producto a la venta.'
  if (lines.some((line) => !toPositiveInteger(line?.product?.id) || !toPositiveInteger(line?.quantity))) return INVALID_SALE_SELECTION
  if (!PAYMENT_METHODS.includes(paymentMethod)) return 'Selecciona un método de pago.'
  if ((paymentReference ?? '').length > 255) return 'La referencia debe tener máximo 255 caracteres.'
  return ''
}
