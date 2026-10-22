import { ChevronRight, Clock3, FileText, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatSaleDateTime } from '../../utils/saleFormatters.js'
import { formatProductPrice } from '../../utils/productFormatters.js'
import { purchaseReferenceLabel } from '../../utils/purchaseRules.js'

export default function PurchaseCard({ purchase, suppliers, users, currentUser }) {
  const when = formatSaleDateTime(purchase.purchaseDate)
  const registeredBy = String(purchase.userId) === String(currentUser?.userId)
    ? currentUser.name
    : purchaseReferenceLabel(purchase.userId, users, 'Usuario')
  return <Link to={`/purchases/${purchase.id}`} className="block rounded-2xl border border-stone-200 bg-white p-4 transition-colors hover:border-[#7a2638]/40 sm:p-5">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs text-stone-500">Compra</p><h2 className="text-base font-semibold text-stone-900">#{purchase.id}</h2></div><div className="flex items-center gap-2"><strong className="text-lg tabular-nums text-[#7a2638]">{formatProductPrice(purchase.total)}</strong><ChevronRight size={18} aria-hidden="true" className="text-stone-400" /></div></div>
    <p className="mt-2 truncate text-sm font-medium text-stone-800">{purchaseReferenceLabel(purchase.supplierId, suppliers, 'Proveedor')}</p>
    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-stone-100 pt-3 text-xs text-stone-500"><span>{when.date}</span><span className="flex items-center justify-end gap-1"><Clock3 size={13} aria-hidden="true" />{when.time}</span><span className="flex min-w-0 items-center gap-1"><UserRound size={13} aria-hidden="true" /><span className="truncate">{registeredBy}</span></span>{purchase.invoiceNumber ? <span className="flex min-w-0 items-center justify-end gap-1"><FileText size={13} aria-hidden="true" /><span className="truncate">{purchase.invoiceNumber}</span></span> : <span />}</div>
  </Link>
}
