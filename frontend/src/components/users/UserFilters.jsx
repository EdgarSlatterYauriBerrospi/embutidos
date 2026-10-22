import { Search } from 'lucide-react'

const selectClass = 'min-h-11 min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:border-[#7a2638] focus:outline-none focus:ring-2 focus:ring-[#7a2638]/10'

export default function UserFilters({ query, onQueryChange, role, onRoleChange, status, onStatusChange }) {
  return <div className="space-y-3 sm:flex sm:items-center sm:gap-3 sm:space-y-0">
    <label className="relative block sm:flex-1"><span className="sr-only">Buscar por nombre o correo</span><Search size={19} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-stone-400" /><input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Buscar nombre o correo" className="min-h-12 w-full rounded-xl border border-stone-200 bg-white pr-4 pl-11 text-base focus:border-[#7a2638] focus:outline-none focus:ring-2 focus:ring-[#7a2638]/10" /></label>
    <div className="grid grid-cols-2 gap-3 sm:w-72"><label className="flex min-w-0 flex-col gap-1 text-xs text-stone-500">Rol<select value={role} onChange={(event) => onRoleChange(event.target.value)} className={selectClass}><option value="all">Todos</option><option value="ADMIN">ADMIN</option><option value="EMPLOYEE">EMPLOYEE</option></select></label><label className="flex min-w-0 flex-col gap-1 text-xs text-stone-500">Estado<select value={status} onChange={(event) => onStatusChange(event.target.value)} className={selectClass}><option value="all">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></label></div>
  </div>
}
