export const AUTH_STORAGE_KEY = 'embutidos.auth'

function isValidSession(session) {
  return typeof session?.token === 'string' && session.token.trim().length > 0 &&
    Number.isInteger(session.user?.userId) &&
    typeof session.user.name === 'string' &&
    typeof session.user.email === 'string' &&
    typeof session.user.role === 'string'
}

export function restoreAuthSession() {
  // Prefer this tab's session if both stores contain a session.
  for (const name of ['sessionStorage', 'localStorage']) {
    try {
      const storage = window[name]
      const raw = storage.getItem(AUTH_STORAGE_KEY)
      if (!raw) continue
      const session = JSON.parse(raw)
      if (isValidSession(session)) return session
      storage.removeItem(AUTH_STORAGE_KEY)
    } catch {
      // Corrupt or unavailable storage must not prevent the app from starting.
      try { window[name].removeItem(AUTH_STORAGE_KEY) } catch { /* Storage unavailable. */ }
    }
  }
  return null
}

export function clearAuthSession() {
  let failed = false
  for (const name of ['localStorage', 'sessionStorage']) {
    try {
      window[name].removeItem(AUTH_STORAGE_KEY)
    } catch {
      failed = true
    }
  }
  if (failed) {
    throw new Error('No se pudo borrar la sesión guardada. Revisa el almacenamiento del navegador.')
  }
}

export function saveAuthSession(session, rememberMe) {
  try {
    // Clear both stores so an older login cannot override the new session.
    clearAuthSession()
    const storage = rememberMe ? window.localStorage : window.sessionStorage
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  } catch {
    throw new Error('No se pudo guardar la sesión. Permite el almacenamiento del navegador e intenta nuevamente.')
  }
}
