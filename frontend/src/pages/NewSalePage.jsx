import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Search } from 'lucide-react'
import useSaleDraft from '../hooks/useSaleDraft.js'
import useSaleProducts from '../hooks/useSaleProducts.js'
import ProductSaleItem from '../components/sales/ProductSaleItem.jsx'
import SaleSummary from '../components/sales/SaleSummary.jsx'
import SaleFeedback from '../components/sales/SaleFeedback.jsx'
import { calculateCartTotal } from '../utils/saleRules.js'
import { formatSaleMoney } from '../utils/saleFormatters.js'

export default function NewSalePage() {
  const navigate = useNavigate()
  const draft = useSaleDraft()
  const catalog = useSaleProducts()
  const selected = new Map(draft.lines.map((line) => [line.product.id, line.quantity]))
  const total = calculateCartTotal(draft.lines)
  return <div className="space-y-5 pb-24 lg:pb-0"><div className="flex items-center gap-3"><Link to="/sales" aria-label="Volver a ventas" className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white"><ArrowLeft size={19} aria-hidden="true" /></Link><div><h1 className="text-2xl font-semibold tracking-tight">Nueva venta</h1><p className="text-sm text-stone-500">Selecciona los productos</p></div></div>
    <div className="relative"><label htmlFor="sale-product-search" className="sr-only">Buscar productos</label><Search size={19} aria-hidden="true" className="absolute top-1/2 left-4 -translate-y-1/2 text-stone-400" /><input id="sale-product-search" type="search" value={catalog.query} onChange={(event) => catalog.setQuery(event.target.value)} placeholder="Buscar por nombre" className="min-h-12 w-full rounded-xl border border-stone-200 bg-white py-3 pr-4 pl-11 text-base focus:border-red-900 focus:outline-none focus:ring-2 focus:ring-red-900/10" /></div>
    {catalog.loading ? <SaleFeedback kind="loading" message="Cargando productos…" /> : catalog.error ? <SaleFeedback kind="error" message={catalog.error} onRetry={catalog.reload} /> : catalog.products.length ? <section aria-labelledby="available-products-title"><h2 id="available-products-title" className="mb-3 text-sm font-semibold">Productos disponibles</h2><div className="grid gap-2 md:grid-cols-2">{catalog.products.map((product) => <ProductSaleItem key={product.id} product={product} quantity={selected.get(product.id) ?? 0} onAdd={() => draft.addProduct(product)} />)}</div></section> : <SaleFeedback message={catalog.query ? 'No encontramos productos disponibles con esa búsqueda.' : 'No hay productos con stock disponible.'} />}
    {draft.lines.length > 0 && <SaleSummary lines={draft.lines} editable onQuantityChange={draft.setQuantity} onRemove={draft.removeProduct} />}
    <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 border-t border-stone-200 bg-white p-3 lg:static lg:rounded-2xl lg:border"><div className="mx-auto flex max-w-3xl items-center gap-4"><div className="min-w-0 flex-1"><p className="text-xs text-stone-500">Total</p><p className="truncate text-lg font-semibold tabular-nums">{formatSaleMoney(total)}</p></div><button type="button" disabled={!draft.lines.length} onClick={() => navigate('/sales/confirm')} className="flex min-h-12 items-center gap-2 rounded-xl bg-[#7a2638] px-5 text-sm font-semibold text-white disabled:bg-stone-200 disabled:text-stone-500">Continuar<ArrowRight size={18} aria-hidden="true" /></button></div></div>
  </div>
}
