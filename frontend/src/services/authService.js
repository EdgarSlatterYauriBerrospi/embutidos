import api from './api.js'

export async function login(email, password) {
  const { data } = await api.post('/api/auth/login', {
    email: email.trim(),
    password,
  })

  if (
    typeof data?.token !== 'string' || !data.token.trim() ||
    !Number.isInteger(data.userId) ||
    typeof data.name !== 'string' ||
    typeof data.email !== 'string' ||
    typeof data.role !== 'string'
  ) {
    throw new Error('La respuesta de inicio de sesión no es válida. Intenta nuevamente.')
  }

  return {
    token: data.token,
    user: {
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
    },
  }
}
