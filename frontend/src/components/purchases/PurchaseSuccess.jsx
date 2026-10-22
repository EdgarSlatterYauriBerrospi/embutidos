import { CircleCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatProductPrice } from '../../utils/productFormatters.js'

export default function PurchaseSuccess({ purchase }) {
  return <section role="status" className="mx-auto max-w-xl rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-sm sm:p-8">
    <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><CircleCheck size={33} aria-hidden="true" /></span>
    <h1 className="mt-4 text-2xl font-semibold text-stone-900">Compra registrada</h1>
    <p className="mt-2 text-sm text-stone-600">Ingreso #{purchase.id} · Total {formatProductPrice(purchase.total)}</p>
    <div className="mt-6 grid gap-3 sm:grid-cols-2"><Link to={`/purchases/${purchase.id}`} className="flex min-h-12 items-center justify-center rounded-xl bg-[#7a2638] px-5 text-sm font-semibold text-white">Ver detalle</Link><Link to="/purchases" className="flex min-h-12 items-center justify-center rounded-xl border border-stone-300 px-5 text-sm font-semibold text-stone-800">Volver a compras</Link></div>
  </section>
}
