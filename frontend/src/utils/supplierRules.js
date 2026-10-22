export const emptySupplierForm = { name: '', phone: '', email: '', address: '' }

export function canManageSuppliers(user) {
  return user?.role === 'ADMIN'
}

function searchable(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function filterSuppliers(suppliers, query, status = 'all') {
  const term = searchable(query.trim())
  return suppliers.filter((supplier) => {
    const matchesStatus = status === 'all' || (status === 'active' ? supplier.active : !supplier.active)
    const matchesQuery = searchable(`${supplier.name} ${supplier.phone ?? ''} ${supplier.email ?? ''} ${supplier.address ?? ''}`).includes(term)
    return matchesStatus && matchesQuery
  })
}

export function validateSupplier(values) {
  const errors = {}
  const name = values.name.trim()
  const phone = values.phone.trim()
  const email = values.email.trim()
  const address = values.address.trim()
  if (!name) errors.name = 'Ingresa el nombre del proveedor.'
  else if (name.length > 255) errors.name = 'El nombre debe tener máximo 255 caracteres.'
  if (phone.length > 255) errors.phone = 'El teléfono debe tener máximo 255 caracteres.'
  if (email.length > 255 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) errors.email = 'Ingresa un correo válido de hasta 255 caracteres.'
  if (address.length > 255) errors.address = 'La dirección debe tener máximo 255 caracteres.'
  return errors
}

// SupplierRequest fields only; status is managed by the separate deactivate endpoint.
export function toSupplierRequest(values) {
  return {
    name: values.name.trim(),
    phone: values.phone.trim() || null,
    email: values.email.trim() || null,
    address: values.address.trim() || null,
  }
}

export function toSupplierForm(supplier) {
  return Object.fromEntries(Object.keys(emptySupplierForm).map((key) => [key, supplier[key] ?? '']))
}
