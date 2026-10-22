export const emptyProductForm = {
  name: '', description: '', price: '', minimumStock: '', imageUrl: '',
}

export function canManageProducts(user) {
  return user?.role === 'ADMIN'
}

export function isLowStock(product) {
  return product.stock <= product.minimumStock
}

function searchable(value) {
  return (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function filterProducts(products, query) {
  const term = searchable(query.trim())
  return products.filter((product) => searchable(`${product.name} ${product.description ?? ''}`).includes(term))
}

export function isSafeImageUrl(value) {
  if (!value) return false
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

export function validateProduct(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Ingresa el nombre del producto.'
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(String(values.price)) || Number(values.price) <= 0) {
    errors.price = 'Ingresa un precio mayor que cero, con hasta 10 dígitos enteros y 2 decimales.'
  }
  const minimumStock = String(values.minimumStock)
  if (!/^\d+$/.test(minimumStock) || !Number.isInteger(Number(minimumStock)) || Number(minimumStock) > 2147483647) {
    errors.minimumStock = 'Ingresa una cantidad entera entre 0 y 2147483647.'
  }
  const imageUrl = values.imageUrl.trim()
  if (imageUrl && (!isSafeImageUrl(imageUrl) || imageUrl.length > 2048)) {
    errors.imageUrl = 'Usa una URL http o https de hasta 2048 caracteres.'
  }
  return errors
}

export function toProductRequest(values) {
  // Inventory is changed by purchases, batches, and sales; product writes only manage catalog data.
  return {
    name: values.name.trim(),
    description: values.description.trim() || null,
    price: String(values.price),
    minimumStock: Number(values.minimumStock),
    imageUrl: values.imageUrl.trim() || null,
  }
}

export function toProductForm(product) {
  return Object.fromEntries(Object.keys(emptyProductForm).map((key) => [key, String(product[key] ?? '')]))
}
