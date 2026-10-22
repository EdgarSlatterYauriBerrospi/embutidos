import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Boxes, TriangleAlert } from 'lucide-react'
import useAuth from '../hooks/useAuth.js'
import useStockProduct from '../hooks/useStockProduct.js'
import useStockRecords from '../hooks/useStockRecords.js'
import ProductImage from '../components/products/ProductImage.jsx'
import ProductFeedback from '../components/products/ProductFeedback.jsx'
import BatchCard from '../components/stock/BatchCard.jsx'
import MovementCard from '../components/stock/MovementCard.jsx'
import { isLowStock } from '../utils/productRules.js'
import { sortBatchesByExpiration } from '../utils/stockRules.js'

const tabs = [
  { id: 'batches', label: 'Lotes' },
  { id: 'movements', label: 'Movimientos' },
]

function StockRecords({ productId, tab, user }) {
  const isAdmin = user?.role === 'ADMIN'
  const { items, users, loading, error, reload } = useStockRecords(productId, tab, isAdmin)
  let content
  if (loading) content = <ProductFeedback kind="loading" message={tab === 'batches' ? 'Cargando lotes…' : 'Cargando movimientos…'} />
  else if (error) content = <ProductFeedback kind="error" message={error} onRetry={reload} />
  else if (!items.length) content = <ProductFeedback message={tab === 'batches' ? 'Este producto no tiene lotes registrados.' : 'Este producto no tiene movimientos registrados.'} />
  else if (tab === 'batches') content = sortBatchesByExpiration(items).map((batch) => <BatchCard key={batch.id} batch={batch} isAdmin={isAdmin} />)
  else content = [...items].sort((a, b) => String(b.movementDate).localeCompare(String(a.movementDate))).map((movement) => <MovementCard key={movement.id} movement={movement} user={user} users={users} />)

  return <div role="tabpanel" id={`stock-panel-${tab}`} aria-labelledby={`stock-tab-${tab}`} className="grid gap-3 md:grid-cols-2">
    {content}
  </div>
}

function StockProductDetail({ productId }) {
  const { user } = useAuth()
  const { product, loading, error, reload } = useStockProduct(productId)
  const [tab, setTab] = useState('batches')

  return <div className="mx-auto max-w-5xl space-y-5">
    <Link to="/stock" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-stone-600 hover:text-[#7a2638]"><ArrowLeft size={18} aria-hidden="true" />Stock y lotes</Link>
    {loading ? <ProductFeedback kind="loading" message="Cargando producto…" /> : error ? <ProductFeedback kind="error" message={error} onRetry={reload} /> : <>
      <header className="rounded-2xl bg-[#48231f] p-4 text-white sm:p-6">
        <div className="flex items-center gap-4"><ProductImage imageUrl={product.imageUrl} name={product.name} className="size-20 sm:size-24" /><div className="min-w-0"><p className="flex items-center gap-2 text-xs font-medium text-[#e5c9a6]"><Boxes size={16} aria-hidden="true" />Detalle de inventario</p><h1 className="mt-1 break-words text-xl font-semibold sm:text-3xl">{product.name}</h1>{!product.active && <span className="mt-2 inline-block rounded-full bg-white/15 px-2 py-1 text-xs">Inactivo</span>}</div></div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/15 pt-4"><div><p className="text-xs text-[#e5c9a6]">Stock actual</p><p className="mt-1 text-2xl font-semibold tabular-nums">{product.stock}</p></div><div><p className="text-xs text-[#e5c9a6]">Stock mínimo</p><p className="mt-1 text-2xl font-semibold tabular-nums">{product.minimumStock}</p></div></div>
        {isLowStock(product) && <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900"><TriangleAlert size={14} aria-hidden="true" />Stock bajo</p>}
      </header>
      <div role="tablist" aria-label="Detalle de stock" className="grid grid-cols-2 gap-1 rounded-xl bg-stone-200/70 p-1">
        {tabs.map(({ id, label }) => <button key={id} id={`stock-tab-${id}`} type="button" role="tab" aria-selected={tab === id} aria-controls={`stock-panel-${id}`} onClick={() => setTab(id)} className={`min-h-11 rounded-lg px-4 text-sm font-semibold transition-colors ${tab === id ? 'bg-white text-[#7a2638] shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}>{label}</button>)}
      </div>
      <StockRecords key={`${productId}-${tab}`} productId={productId} tab={tab} user={user} />
    </>}
  </div>
}

export default function StockDetailPage() {
  const { productId } = useParams()
  return <StockProductDetail key={productId} productId={productId} />
}
