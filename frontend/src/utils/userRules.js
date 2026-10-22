export const USER_ROLES = ['ADMIN', 'EMPLOYEE']

export const emptyUserForm = { name: '', email: '', password: '', role: '' }

export function canManageUsers(user) {
  return user?.role === 'ADMIN'
}

function searchable(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function filterUsers(users, query, role = 'all', status = 'all') {
  const term = searchable(query.trim())
  return users.filter((user) => {
    const matchesRole = role === 'all' || user.roleName === role
    const matchesStatus = status === 'all' || (status === 'active' ? user.active : !user.active)
    return matchesRole && matchesStatus && searchable(`${user.name} ${user.email}`).includes(term)
  })
}

export function validateUser(values, isEditing) {
  const errors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  if (!name) errors.name = 'Ingresa el nombre del usuario.'
  else if (name.length > 255) errors.name = 'El nombre debe tener máximo 255 caracteres.'
  if (!email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Ingresa un correo válido de hasta 255 caracteres.'
  if ((!isEditing || values.password.length > 0) && !values.password.trim()) errors.password = 'Ingresa una contraseña.'
  if (!USER_ROLES.includes(values.role)) errors.role = 'Selecciona un rol disponible.'
  return errors
}

// UserRequest fields only; active is controlled by the backend and deactivate endpoint.
export function toUserRequest(values, isEditing) {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    password: isEditing && !values.password ? null : values.password,
    role: values.role,
  }
}

export function toUserForm(user) {
  return { name: user.name ?? '', email: user.email ?? '', password: '', role: USER_ROLES.includes(user.roleName) ? user.roleName : '' }
}
