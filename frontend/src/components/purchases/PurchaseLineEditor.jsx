import { Minus, Plus, Trash2 } from 'lucide-react'
import ProductImage from '../products/ProductImage.jsx'
import { formatProductPrice } from '../../utils/productFormatters.js'
import { purchaseLineSubtotal } from '../../utils/purchaseRules.js'

const inputClass = 'min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-base outline-none focus:border-[#7a2638] focus:ring-2 focus:ring-[#7a2638]/10 disabled:bg-stone-100'

export default function PurchaseLineEditor({ line, product, index, busy, onUpdate, onQuantityChange, onRemove }) {
  const subtotal = line.unitCost !== '' && Number.isFinite(purchaseLineSubtotal(line)) ? formatProductPrice(purchaseLineSubtotal(line)) : '—'
  return <article className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
    <div className="flex items-center gap-3"><ProductImage imageUrl={product?.imageUrl} name={product?.name} className="size-14" /><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold text-stone-900">{product?.name ?? `Producto #${line.productId}`}</h3><p className="text-xs text-stone-500">Ingreso #{index + 1}</p></div><button type="button" onClick={onRemove} disabled={busy} aria-label={`Quitar ingreso ${index + 1}`} className="flex size-11 shrink-0 items-center justify-center rounded-xl text-[#7a2638] hover:bg-red-50 disabled:opacity-50"><Trash2 size={18} aria-hidden="true" /></button></div>
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div><label htmlFor={`purchase-quantity-${line.key}`} className="mb-1 block text-xs font-medium text-stone-600">Cantidad</label><div className="flex items-center gap-1"><button type="button" onClick={() => onQuantityChange(-1)} disabled={busy || Number(line.quantity) <= 1} aria-label={`Reducir cantidad del ingreso ${index + 1}`} className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-stone-200 disabled:opacity-40"><Minus size={16} aria-hidden="true" /></button><input id={`purchase-quantity-${line.key}`} type="number" inputMode="numeric" min="1" max="2147483647" step="1" required value={line.quantity} onChange={(event) => onUpdate('quantity', event.target.value)} disabled={busy} className={`${inputClass} min-w-0 px-1 text-center tabular-nums`} /><button type="button" onClick={() => onQuantityChange(1)} disabled={busy || Number(line.quantity) >= 2147483647} aria-label={`Aumentar cantidad del ingreso ${index + 1}`} className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-stone-200 disabled:opacity-40"><Plus size={16} aria-hidden="true" /></button></div></div>
      <div><label htmlFor={`purchase-cost-${line.key}`} className="mb-1 block text-xs font-medium text-stone-600">Costo unitario</label><input id={`purchase-cost-${line.key}`} type="number" inputMode="decimal" min="0" step="0.01" required value={line.unitCost} onChange={(event) => onUpdate('unitCost', event.target.value)} disabled={busy} placeholder="0.00" className={`${inputClass} tabular-nums`} /></div>
      <div><label htmlFor={`purchase-entry-${line.key}`} className="mb-1 block text-xs font-medium text-stone-600">Fecha de ingreso</label><input id={`purchase-entry-${line.key}`} type="date" required value={line.entryDate} onChange={(event) => onUpdate('entryDate', event.target.value)} disabled={busy} className={inputClass} /></div>
      <div><label htmlFor={`purchase-expiry-${line.key}`} className="mb-1 block text-xs font-medium text-stone-600">Vencimiento</label><input id={`purchase-expiry-${line.key}`} type="date" required value={line.expirationDate} onChange={(event) => onUpdate('expirationDate', event.target.value)} disabled={busy} className={inputClass} /></div>
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-sm"><span className="text-stone-500">Subtotal estimado</span><strong className="tabular-nums text-stone-900">{subtotal}</strong></div>
  </article>
}
