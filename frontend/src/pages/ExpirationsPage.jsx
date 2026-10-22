import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import useExpirations from '../hooks/useExpirations.js'
import ExpirationFilters from '../components/expirations/ExpirationFilters.jsx'
import ExpirationList from '../components/expirations/ExpirationList.jsx'
import ProductFeedback from '../components/products/ProductFeedback.jsx'

function emptyMessage(filterId) {
  if (filterId === 'expired') return 'No hay lotes vencidos con existencias.'
  if (filterId === 'all') return 'No hay lotes con existencias para mostrar.'
  return 'No hay productos próximos a vencer en este rango.'
}

export default function ExpirationsPage() {
  const [filterId, setFilterId] = useState('all')
  const { batches, productById, loading, error, reload } = useExpirations(filterId)

  return <div className="space-y-5">
    <header className="rounded-2xl bg-[#48231f] px-5 py-5 text-white sm:px-7 sm:py-7"><div className="flex items-center gap-3"><CalendarClock size={24} aria-hidden="true" className="text-[#e5c9a6]" /><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Vencimientos</h1></div><p className="mt-2 text-sm text-[#e9d7c5]">Controla los lotes próximos a vencer</p></header>
    <ExpirationFilters value={filterId} onChange={setFilterId} />
    {loading ? <ProductFeedback kind="loading" message="Cargando vencimientos…" /> : error ? <ProductFeedback kind="error" message={error} onRetry={reload} /> : batches.length ? <ExpirationList batches={batches} productById={productById} /> : <ProductFeedback message={emptyMessage(filterId)} />}
  </div>
}
