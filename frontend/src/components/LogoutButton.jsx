import { useState } from 'react'
import { LogOut } from 'lucide-react'
import useAuth from '../hooks/useAuth.js'

export default function LogoutButton() {
  const { logout } = useAuth()
  const [error, setError] = useState('')

  function handleLogout() {
    try {
      logout()
    } catch (cause) {
      setError(cause.message)
    }
  }

  return (
    <div>
      <button type="button" onClick={handleLogout} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-50">
        <LogOut size={18} aria-hidden="true" />
        Cerrar sesión
      </button>
      {error && <p role="alert" className="max-w-xs text-sm text-red-900">{error}</p>}
    </div>
  )
}
