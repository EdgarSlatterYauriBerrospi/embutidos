import { Link, useLocation } from 'react-router-dom'
import { Plus, UsersRound } from 'lucide-react'
import useUsers from '../hooks/useUsers.js'
import UserFilters from '../components/users/UserFilters.jsx'
import UserList from '../components/users/UserList.jsx'
import ProductFeedback from '../components/products/ProductFeedback.jsx'

export default function UsersPage() {
  const { allUsers, users, loading, error, query, setQuery, role, setRole, status, setStatus, reload } = useUsers(true)
  const { state } = useLocation()

  return <div className="space-y-5">
    <div className="rounded-2xl bg-[#48231f] px-5 py-5 text-white sm:flex sm:items-center sm:justify-between sm:gap-5 sm:px-7 sm:py-7"><div><div className="flex items-center gap-3"><UsersRound size={24} aria-hidden="true" className="text-[#e5c9a6]" /><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Usuarios y empleados</h1></div><p className="mt-2 text-sm text-[#e9d7c5]">Gestiona los accesos del equipo.</p></div><Link to="/users/new" aria-label="Nuevo usuario" className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#7a2638] sm:mt-0"><Plus size={20} aria-hidden="true" /><span>Nuevo usuario</span></Link></div>
    {state?.userSuccess && <ProductFeedback kind="success" message={state.userSuccess} />}
    <UserFilters query={query} onQueryChange={setQuery} role={role} onRoleChange={setRole} status={status} onStatusChange={setStatus} />
    {loading ? <ProductFeedback kind="loading" message="Cargando usuarios…" /> : error ? <ProductFeedback kind="error" message={error} onRetry={reload} /> : users.length ? <UserList users={users} /> : <ProductFeedback message={allUsers.length ? 'No encontramos usuarios con esos filtros.' : 'Todavía no hay usuarios registrados.'} />}
  </div>
}
