import { CalendarDays, ChevronRight, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductImage from '../products/ProductImage.jsx'
import { formatStockDate } from '../../utils/stockFormatters.js'
import { daysRemainingLabel, expirationStatus } from '../../utils/expirationRules.js'

const statusTone = {
  expired: 'bg-red-100 text-red-800',
  urgent: 'bg-[#7a2638]/10 text-[#7a2638]',
  soon: 'bg-amber-100 text-amber-900',
  upcoming: 'bg-yellow-50 text-yellow-900',
  current: 'bg-emerald-50 text-emerald-800',
  neutral: 'bg-stone-100 text-stone-700',
}

export default function ExpirationCard({ batch, product }) {
  const status = expirationStatus(batch)
  const name = product?.name ?? `Producto #${batch.productId}`
  return <Link to={`/stock/${batch.productId}`} className="block rounded-2xl border border-stone-200 bg-white p-3 transition-colors hover:border-[#7a2638]/40 hover:bg-[#fffdf9] sm:p-4">
    <div className="flex min-w-0 items-center gap-3"><ProductImage imageUrl={product?.imageUrl} name={name} className="size-16 sm:size-20" /><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold text-stone-900 sm:text-base">{name}</h2><p className="mt-1 text-xs text-stone-500">Lote #{batch.id}</p><span className={`mt-1.5 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[status.tone]}`}>{status.label}</span></div><ChevronRight size={18} aria-hidden="true" className="shrink-0 text-stone-400" /></div>
    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-stone-100 pt-3 text-xs sm:text-sm"><div><p className="flex items-center gap-1 text-stone-500"><CalendarDays size={14} aria-hidden="true" />Vencimiento</p><p className="mt-1 font-medium text-stone-800">{formatStockDate(batch.expirationDate)}</p></div><div className="text-right"><p className="flex items-center justify-end gap-1 text-stone-500"><Package size={14} aria-hidden="true" />Restante: <strong className="tabular-nums text-stone-800">{batch.quantity}</strong></p><p className="mt-1 font-semibold tabular-nums text-[#7a2638]">{daysRemainingLabel(status.days)}</p></div></div>
  </Link>
}
