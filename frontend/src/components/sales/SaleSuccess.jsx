import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatSaleMoney } from '../../utils/saleFormatters.js'
import { paymentMethodLabel } from '../../utils/saleRules.js'

export default function SaleSuccess({ sale, onNewSale }) {
  return <section className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-white p-6 text-center sm:p-8"><span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 size={34} aria-hidden="true" /></span><h1 className="mt-4 text-2xl font-semibold">Venta registrada</h1><dl className="mx-auto mt-5 max-w-xs space-y-3 rounded-xl bg-stone-50 p-4 text-sm"><div className="flex justify-between gap-3"><dt className="text-stone-500">Venta</dt><dd className="font-semibold">#{sale.id}</dd></div><div className="flex justify-between gap-3"><dt className="text-stone-500">Total</dt><dd className="font-semibold tabular-nums">{formatSaleMoney(sale.total)}</dd></div><div className="flex justify-between gap-3"><dt className="text-stone-500">Pago</dt><dd className="font-semibold">{paymentMethodLabel(sale.paymentMethod)}</dd></div></dl><div className="mt-6 grid gap-3 sm:grid-cols-2"><Link to="/sales/new" onClick={onNewSale} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#7a2638] px-4 font-semibold text-white">Nueva venta</Link><Link to={`/sales/${sale.id}`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-stone-300 px-4 font-medium text-stone-700">Ver detalle</Link></div></section>
}
