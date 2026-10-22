import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import useAuth from '../hooks/useAuth.js'
import useSales from '../hooks/useSales.js'
import SaleList from '../components/sales/SaleList.jsx'
import SaleFeedback from '../components/sales/SaleFeedback.jsx'
import useSaleDraft from '../hooks/useSaleDraft.js'

export default function SalesPage() {
  const { user } = useAuth()
  const employeeView = user?.role === 'EMPLOYEE'
  const { sales, loading, error, reload } = useSales(true)
  const { reset } = useSaleDraft()
  return <div className="space-y-5"><div className="flex items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{employeeView ? 'Mis ventas' : 'Ventas'}</h1><p className="mt-1 text-sm text-stone-500">{employeeView ? 'Ventas registradas por ti' : 'Historial de ventas registradas'}</p></div><Link to="/sales/new" onClick={reset} className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-[#7a2638] px-4 text-sm font-semibold text-white hover:bg-[#601b2b]"><Plus size={18} aria-hidden="true" />Nueva venta</Link></div>
    {loading ? <SaleFeedback kind="loading" message="Cargando ventas…" /> : error ? <SaleFeedback kind="error" message={error} onRetry={reload} /> : sales.length ? <SaleList sales={sales} user={user} /> : <SaleFeedback message={employeeView ? 'Todavía no tienes ventas registradas.' : 'Todavía no hay ventas registradas.'} />}
  </div>
}
