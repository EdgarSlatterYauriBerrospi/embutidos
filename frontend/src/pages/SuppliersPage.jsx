import { Link, useLocation } from 'react-router-dom'
import { Plus, Truck } from 'lucide-react'
import useAuth from '../hooks/useAuth.js'
import useSuppliers from '../hooks/useSuppliers.js'
import { canManageSuppliers } from '../utils/supplierRules.js'
import ProductFeedback from '../components/products/ProductFeedback.jsx'
import SupplierCard from '../components/suppliers/SupplierCard.jsx'
import SupplierFilters from '../components/suppliers/SupplierFilters.jsx'

export default function SuppliersPage() {
  const { user } = useAuth()
  const canManage = canManageSuppliers(user)
  const { allSuppliers, suppliers, loading, error, query, setQuery, status, setStatus, reload } = useSuppliers(canManage)
  const { state } = useLocation()

  return <div className="space-y-5">
    <div className="rounded-2xl bg-[#48231f] px-5 py-5 text-white sm:flex sm:items-center sm:justify-between sm:gap-5 sm:px-7 sm:py-7"><div><div className="flex items-center gap-3"><Truck size={24} aria-hidden="true" className="text-[#e5c9a6]" /><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Proveedores</h1></div><p className="mt-2 text-sm text-[#e9d7c5]">Contactos para tus ingresos de mercadería.</p></div>{canManage && <Link to="/suppliers/new" className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#7a2638] sm:mt-0"><Plus size={18} aria-hidden="true" />Nuevo proveedor</Link>}</div>
    {!canManage ? <ProductFeedback kind="error" message="Solo ADMIN puede consultar y gestionar proveedores." /> : <>
      {state?.supplierSuccess && <ProductFeedback kind="success" message={state.supplierSuccess} />}
      <SupplierFilters query={query} onQueryChange={setQuery} status={status} onStatusChange={setStatus} />
      {loading ? <ProductFeedback kind="loading" message="Cargando proveedores…" /> : error ? <ProductFeedback kind="error" message={error} onRetry={reload} /> : suppliers.length ? <section aria-label="Proveedores registrados" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{suppliers.map((supplier) => <SupplierCard key={supplier.id} supplier={supplier} />)}</section> : <ProductFeedback message={allSuppliers.length ? 'No encontramos proveedores con esos filtros.' : 'Todavía no hay proveedores registrados.'} />}
    </>}
  </div>
}
