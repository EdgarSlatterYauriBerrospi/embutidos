import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductImage from '../products/ProductImage.jsx'
import { isLowStock } from '../../utils/productRules.js'

export default function StockProductCard({ product }) {
  return <Link to={`/stock/${product.id}`} className="flex min-w-0 items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 transition-colors hover:border-[#7a2638]/40 hover:bg-[#fffdf9] focus-visible:outline-[#7a2638] sm:p-4">
    <ProductImage imageUrl={product.imageUrl} name={product.name} className="size-16 sm:size-20" />
    <div className="min-w-0 flex-1">
      <h2 className="truncate text-sm font-semibold text-stone-900 sm:text-base">{product.name}</h2>
      <p className="mt-1 text-sm text-stone-600">Stock <strong className="tabular-nums text-stone-900">{product.stock}</strong><span className="mx-2 text-stone-300">·</span>Mínimo <span className="tabular-nums">{product.minimumStock}</span></p>
      <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
        {isLowStock(product) && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-900">Stock bajo</span>}
        {!product.active && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-stone-600">Inactivo</span>}
      </div>
    </div>
    <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-stone-400" />
  </Link>
}
