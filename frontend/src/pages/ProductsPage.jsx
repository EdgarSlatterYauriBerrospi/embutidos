import { Link, useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import useAuth from '../hooks/useAuth.js'
import useProducts from '../hooks/useProducts.js'
import { canManageProducts } from '../utils/productRules.js'
import ProductFilters from '../components/products/ProductFilters.jsx'
import ProductList from '../components/products/ProductList.jsx'
import ProductFeedback from '../components/products/ProductFeedback.jsx'

export default function ProductsPage() {
  const { user } = useAuth()
  const { products, loading, error, query, setQuery, reload } = useProducts()
  const { state } = useLocation()
  const canManage = canManageProducts(user)

  return (
    <div className={`space-y-5 ${canManage ? 'pb-16 lg:pb-0' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Productos</h1><p className="mt-1 text-sm text-stone-500">Tu catálogo, siempre a mano.</p></div>
        {canManage && <Link to="/products/new" className="hidden min-h-11 items-center gap-2 rounded-xl bg-[#7a2638] px-4 py-3 text-sm font-semibold text-white hover:bg-[#601b2b] lg:inline-flex"><Plus size={18} aria-hidden="true" />Nuevo producto</Link>}
      </div>
      {state?.productSuccess && <ProductFeedback kind="success" message={state.productSuccess} />}
      <ProductFilters query={query} onQueryChange={setQuery} />
      {loading ? <ProductFeedback kind="loading" message="Cargando productos…" /> : error ? <ProductFeedback kind="error" message={error} onRetry={reload} /> : products.length ? <ProductList products={products} /> : <ProductFeedback message={query ? 'No encontramos productos con esa búsqueda.' : 'Todavía no hay productos registrados.'} />}
      {canManage && <Link to="/products/new" aria-label="Crear nuevo producto" className="fixed right-5 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 flex size-14 items-center justify-center rounded-full bg-[#7a2638] text-white shadow-lg shadow-[#48231f]/25 hover:bg-[#601b2b] lg:hidden"><Plus size={27} aria-hidden="true" /></Link>}
    </div>
  )
}
