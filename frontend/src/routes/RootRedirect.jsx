import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import { getRootDestination } from './rootDestination.js'

export default function RootRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={getRootDestination(isAuthenticated)} replace />
}
