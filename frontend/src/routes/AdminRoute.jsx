import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import { canManageUsers } from '../utils/userRules.js'

export default function AdminRoute() {
  const { user } = useAuth()
  return canManageUsers(user) ? <Outlet /> : <Navigate to="/dashboard" replace />
}
