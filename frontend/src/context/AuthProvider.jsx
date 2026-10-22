import { useCallback, useMemo, useState } from 'react'
import AuthContext from './AuthContext.js'
import { login as requestLogin } from '../services/authService.js'
import { clearAuthSession, restoreAuthSession, saveAuthSession } from '../services/authSession.js'

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(restoreAuthSession)

  const login = useCallback(async (email, password, rememberMe = false) => {
    const nextSession = await requestLogin(email, password)
    saveAuthSession(nextSession, rememberMe)
    setSession(nextSession)
    return nextSession
  }, [])

  const logout = useCallback(() => {
    try {
      clearAuthSession()
    } finally {
      setSession(null)
    }
  }, [])

  const value = useMemo(() => ({
    user: session?.user ?? null,
    token: session?.token ?? null,
    isAuthenticated: Boolean(session),
    login,
    logout,
  }), [session, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
