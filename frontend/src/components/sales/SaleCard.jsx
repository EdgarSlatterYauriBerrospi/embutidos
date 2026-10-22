import { ChevronRight, Clock3, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatSaleDateTime, formatSaleMoney, registeredByLabel } from '../../utils/saleFormatters.js'
import { isSaleCancelled, paymentMethodLabel } from '../../utils/saleRules.js'

export default function SaleCard({ sale, user, employeeNumber }) {
  const when = formatSaleDateTime(sale.saleDate)
  const cancelled = isSaleCancelled(sale)
  const saleLabel = user?.role === 'EMPLOYEE'
    ? employeeNumber ? `Mi venta #${employeeNumber}` : 'Mi venta'
    : `Venta #${sale.id}`
  return <Link to={`/sales/${sale.id}`} className="block rounded-2xl border border-stone-200 bg-white p-4 hover:border-red-900/30">
    <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><h2 className="text-sm font-semibold text-stone-800">{saleLabel}</h2>{cancelled && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">Anulada</span>}</div><div className="flex items-center gap-2"><p className={`text-lg font-semibold tabular-nums ${cancelled ? 'text-stone-500 line-through' : 'text-[#7a2638]'}`}>{formatSaleMoney(sale.total)}</p><ChevronRight size={17} aria-hidden="true" className="text-stone-400" /></div></div>
    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-stone-100 pt-3 text-xs text-stone-500">
      <p>{when.date}</p><p className="flex items-center justify-end gap-1"><Clock3 size={13} aria-hidden="true" />{when.time}</p>
      <p>{paymentMethodLabel(sale.paymentMethod)}</p><p className="flex items-center justify-end gap-1 text-right"><UserRound size={13} aria-hidden="true" />{registeredByLabel(sale, user)}</p>
    </div>
  </Link>
}
