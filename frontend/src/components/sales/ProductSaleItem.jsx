import { Minus, Plus, Trash2 } from 'lucide-react'
import ProductImage from '../products/ProductImage.jsx'
import { formatSaleMoney } from '../../utils/saleFormatters.js'

export default function ProductSaleItem({ product, quantity = 0, onAdd, onQuantityChange, onRemove, selected = false }) {
  const atLimit = quantity >= product.stock
  if (!selected) return <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3">
    <ProductImage imageUrl={product.imageUrl} name={product.name} className="size-16" />
    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-stone-800">{product.name}</p><p className="mt-1 text-sm font-semibold text-[#7a2638]">{formatSaleMoney(product.price)}</p><p className="mt-1 text-xs text-stone-500">Disponible: {product.stock}</p></div>
    <button type="button" onClick={onAdd} disabled={atLimit} className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#7a2638] text-white disabled:bg-stone-200 disabled:text-stone-500" aria-label={`Agregar ${product.name}`}><Plus size={20} aria-hidden="true" /></button>
  </div>
  return <div className="rounded-xl border border-stone-200 bg-white p-3">
    <div className="flex items-center gap-3"><ProductImage imageUrl={product.imageUrl} name={product.name} className="size-14" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{product.name}</p><p className="mt-1 text-xs text-stone-500">{formatSaleMoney(product.price)} c/u · Stock {product.stock}</p></div><p className="text-sm font-semibold tabular-nums">{formatSaleMoney(Number(product.price) * quantity)}</p></div>
    <div className="mt-3 flex items-center justify-between"><button type="button" onClick={onRemove} className="flex min-h-11 items-center gap-1 rounded-lg px-2 text-xs text-red-900"><Trash2 size={16} aria-hidden="true" />Quitar</button><div className="flex items-center gap-1"><button type="button" onClick={() => onQuantityChange(quantity - 1)} className="flex size-11 items-center justify-center rounded-lg border border-stone-200" aria-label={`Reducir ${product.name}`}><Minus size={17} aria-hidden="true" /></button><output aria-label={`Cantidad de ${product.name}`} className="w-8 text-center text-sm font-semibold tabular-nums">{quantity}</output><button type="button" onClick={() => onQuantityChange(quantity + 1)} disabled={atLimit} className="flex size-11 items-center justify-center rounded-lg border border-stone-200 disabled:bg-stone-100 disabled:text-stone-300" aria-label={`Aumentar ${product.name}`}><Plus size={17} aria-hidden="true" /></button></div></div>
  </div>
}
