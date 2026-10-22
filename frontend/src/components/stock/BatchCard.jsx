import { CalendarDays, PackageCheck } from 'lucide-react'
import { batchStatus } from '../../utils/stockRules.js'
import { formatStockDate } from '../../utils/stockFormatters.js'
import { formatProductPrice } from '../../utils/productFormatters.js'

const tones = {
  neutral: 'bg-stone-100 text-stone-700',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-amber-100 text-amber-900',
  success: 'bg-emerald-100 text-emerald-800',
}

export default function BatchCard({ batch, isAdmin }) {
  const status = batchStatus(batch)
  return <article className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="flex items-center gap-2 text-[#7a2638]"><PackageCheck size={19} aria-hidden="true" /><h3 className="font-semibold text-stone-900">Lote #{batch.id}</h3></div>
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[status.tone]}`}>{status.label}</span>
    </div>
    <p className="mt-3 text-sm text-stone-600">Cantidad restante <strong className="ml-1 text-lg tabular-nums text-stone-900">{batch.quantity}</strong></p>
    <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-stone-100 pt-3 text-xs sm:text-sm">
      <div><dt className="flex items-center gap-1 text-stone-500"><CalendarDays size={14} aria-hidden="true" />Ingreso</dt><dd className="mt-1 font-medium text-stone-800">{formatStockDate(batch.entryDate)}</dd></div>
      <div><dt className="flex items-center gap-1 text-stone-500"><CalendarDays size={14} aria-hidden="true" />Vencimiento</dt><dd className="mt-1 font-medium text-stone-800">{formatStockDate(batch.expirationDate)}</dd></div>
      {isAdmin && <div className="col-span-2"><dt className="text-stone-500">Precio de compra</dt><dd className="mt-1 font-medium text-stone-800">{formatProductPrice(batch.purchasePrice)}</dd></div>}
    </dl>
  </article>
}
