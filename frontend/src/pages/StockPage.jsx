import { Boxes, Search, TriangleAlert } from 'lucide-react'
import useProducts from '../hooks/useProducts.js'
import { useState } from 'react'
import { countLowStock, filterStockProducts } from '../utils/stockRules.js'
import StockProductCard from '../components/stock/StockProductCard.jsx'
import ProductFeedback from '../components/products/ProductFeedback.jsx'

export default function StockPage() {
  const { allProducts, loading, error, query, setQuery, reload } = useProducts()
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const products = filterStockProducts(allProducts, query, lowStockOnly)

  return <div className="space-y-5">
    <div className="rounded-2xl bg-[#48231f] px-5 py-5 text-white sm:px-7 sm:py-7">
      <div className="flex items-center gap-3"><Boxes size={23} aria-hidden="true" className="text-[#e5c9a6]" /><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Stock y lotes</h1></div>
      <p className="mt-2 text-sm text-[#e9d7c5]">Consulta existencias y fechas de vencimiento.</p>
    </div>

    <div className="grid grid-cols-2 gap-3 sm:max-w-lg">
      <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3"><Boxes size={18} aria-hidden="true" className="text-[#7a2638]" /><p className="mt-1 text-2xl font-semibold tabular-nums">{loading ? '—' : allProducts.length}</p><p className="text-xs text-stone-500">Productos</p></div>
      <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3"><TriangleAlert size={18} aria-hidden="true" className="text-amber-700" /><p className="mt-1 text-2xl font-semibold tabular-nums">{loading ? '—' : countLowStock(allProducts)}</p><p className="text-xs text-stone-500">Con stock bajo</p></div>
    </div>

    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="relative block flex-1 sm:max-w-xl"><span className="sr-only">Buscar productos</span><Search size={19} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-stone-400" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar productos" className="min-h-12 w-full rounded-xl border border-stone-200 bg-white pr-4 pl-11 text-base outline-none focus:border-[#7a2638] focus:ring-2 focus:ring-[#7a2638]/10" /></label>
      <label className="inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-sm text-stone-700"><input type="checkbox" checked={lowStockOnly} onChange={(event) => setLowStockOnly(event.target.checked)} className="size-4 accent-[#7a2638]" />Solo stock bajo</label>
    </div>

    {loading ? <ProductFeedback kind="loading" message="Cargando stock…" /> : error ? <ProductFeedback kind="error" message={error} onRetry={reload} /> : products.length ? <section aria-label="Productos en inventario" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{products.map((product) => <StockProductCard key={product.id} product={product} />)}</section> : <ProductFeedback message={allProducts.length ? 'No encontramos productos con esos filtros.' : 'Todavía no hay productos registrados.'} />}
  </div>
}
