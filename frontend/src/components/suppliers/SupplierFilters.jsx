import { Search } from 'lucide-react'

export default function SupplierFilters({ query, onQueryChange, status, onStatusChange }) {
  return <div className="flex flex-col gap-3 sm:flex-row">
    <label className="relative block flex-1"><span className="sr-only">Buscar proveedores</span><Search size={19} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-stone-400" /><input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Buscar proveedor" className="min-h-12 w-full rounded-xl border border-stone-200 bg-white pr-4 pl-11 text-base outline-none focus:border-[#7a2638] focus:ring-2 focus:ring-[#7a2638]/10" /></label>
    <label className="flex items-center gap-2 text-sm text-stone-600"><span className="shrink-0">Estado</span><select value={status} onChange={(event) => onStatusChange(event.target.value)} className="min-h-12 min-w-40 flex-1 rounded-xl border border-stone-200 bg-white px-3 text-base text-stone-800 focus:border-[#7a2638] focus:outline-none focus:ring-2 focus:ring-[#7a2638]/10"><option value="all">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></label>
  </div>
}
