import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductImage from './ProductImage.jsx'
import { isLowStock } from '../../utils/productRules.js'
import { formatProductPrice } from '../../utils/productFormatters.js'

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.id}/edit`} className="flex min-w-0 items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 transition-colors hover:border-red-900/30 sm:gap-4 sm:p-4">
      <ProductImage imageUrl={product.imageUrl} className="size-20 sm:size-24" />
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold leading-5 text-stone-800 sm:text-base">{product.name}</h2>
        <p className="mt-1 text-base font-semibold tabular-nums text-[#7a2638]">{formatProductPrice(product.price)}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500">Stock: <strong className="font-medium text-stone-700">{product.stock}</strong></span>
          {isLowStock(product) && <span className="rounded-full bg-amber-50 px-2 py-1 font-medium text-amber-800">Stock bajo</span>}
          {!product.active && <span className="rounded-full bg-stone-100 px-2 py-1 text-stone-500">Inactivo</span>}
        </div>
      </div>
      <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-stone-400" />
    </Link>
  )
}
