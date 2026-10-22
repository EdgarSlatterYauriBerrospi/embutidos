import axios from 'axios'

export function getLoginErrorMessage(error) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'No se pudo iniciar sesión. Intenta nuevamente.'
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'El servidor tardó demasiado en responder. Intenta nuevamente.'
  }
  if (!error.response || error.response.status >= 500) {
    return 'No se pudo conectar con el servicio de inicio de sesión. Intenta nuevamente más tarde.'
  }
  if (error.response.status === 401) {
    return 'Correo electrónico o contraseña incorrectos.'
  }
  if (error.response.status === 403) {
    return 'No tienes permiso para acceder al sistema. Contacta al administrador.'
  }
  if (error.response.status === 429) {
    return 'Demasiados intentos. Espera unos minutos antes de intentar nuevamente.'
  }
  if (error.response.status === 400) {
    return 'Revisa tu correo electrónico y contraseña e intenta nuevamente.'
  }
  return 'No se pudo iniciar sesión. Intenta nuevamente.'
}
