import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, FileText, Package, Truck, UserRound } from 'lucide-react'
import useAuth from '../hooks/useAuth.js'
import usePurchaseDetail from '../hooks/usePurchaseDetail.js'
import ProductFeedback from '../components/products/ProductFeedback.jsx'
import { canManagePurchases, purchaseReferenceLabel } from '../utils/purchaseRules.js'
import { formatSaleDateTime } from '../utils/saleFormatters.js'
import { formatProductPrice } from '../utils/productFormatters.js'

export default function PurchaseDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const canManage = canManagePurchases(user)
  const { purchase, products, suppliers, users, loading, error, reload } = usePurchaseDetail(id, canManage)
  if (!canManage) return <ProductFeedback kind="error" message="Solo ADMIN puede consultar compras." />
  if (loading) return <ProductFeedback kind="loading" message="Cargando detalle de compra…" />
  if (error) return <ProductFeedback kind="error" message={error} onRetry={reload} />

  const when = formatSaleDateTime(purchase.purchaseDate)
  const registeredBy = String(purchase.userId) === String(user?.userId) ? user.name : purchaseReferenceLabel(purchase.userId, users, 'Usuario')
  return <div className="mx-auto max-w-4xl space-y-5">
    <Link to="/purchases" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-stone-600 hover:text-[#7a2638]"><ArrowLeft size={18} aria-hidden="true" />Compras</Link>
    <header className="rounded-2xl bg-[#48231f] p-5 text-white sm:p-7"><p className="text-xs font-medium text-[#e5c9a6]">Ingreso de mercadería</p><div className="mt-1 flex flex-wrap items-end justify-between gap-3"><h1 className="text-2xl font-semibold sm:text-3xl">Compra #{purchase.id}</h1><strong className="text-2xl tabular-nums">{formatProductPrice(purchase.total)}</strong></div><p className="mt-3 flex items-center gap-2 text-sm text-[#e9d7c5]"><CalendarDays size={16} aria-hidden="true" />{when.date} · {when.time}</p></header>
    <dl className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-sm sm:grid-cols-3 sm:p-6"><div><dt className="flex items-center gap-1.5 text-xs text-stone-500"><Truck size={15} aria-hidden="true" />Proveedor</dt><dd className="mt-1 font-medium">{purchaseReferenceLabel(purchase.supplierId, suppliers, 'Proveedor')}</dd></div><div><dt className="flex items-center gap-1.5 text-xs text-stone-500"><UserRound size={15} aria-hidden="true" />Registrada por</dt><dd className="mt-1 font-medium">{registeredBy}</dd></div><div><dt className="flex items-center gap-1.5 text-xs text-stone-500"><FileText size={15} aria-hidden="true" />Comprobante</dt><dd className="mt-1 break-words font-medium">{purchase.invoiceNumber || 'Sin número de comprobante'}</dd></div></dl>
    <section aria-labelledby="purchase-detail-lines" className="space-y-3"><h2 id="purchase-detail-lines" className="text-base font-semibold">Productos ingresados</h2>{purchase.lines?.length ? <div className="grid gap-3 md:grid-cols-2">{purchase.lines.map((line) => <article key={line.id} className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5"><div className="flex items-start gap-2"><Package size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-[#7a2638]" /><h3 className="min-w-0 flex-1 break-words font-semibold">{purchaseReferenceLabel(line.productId, products, 'Producto')}</h3><strong className="shrink-0 tabular-nums text-[#7a2638]">{formatProductPrice(line.subtotal)}</strong></div><dl className="mt-3 grid grid-cols-2 gap-3 border-t border-stone-100 pt-3 text-sm"><div><dt className="text-xs text-stone-500">Cantidad</dt><dd className="mt-1 font-medium tabular-nums">{line.quantity}</dd></div><div><dt className="text-xs text-stone-500">Costo unitario</dt><dd className="mt-1 font-medium tabular-nums">{formatProductPrice(line.unitCost)}</dd></div><div className="col-span-2"><dt className="text-xs text-stone-500">Vencimiento</dt><dd className="mt-1 text-stone-600">No disponible en el detalle de compra. <Link to={`/stock/${line.productId}`} className="font-medium text-[#7a2638] underline underline-offset-2">Ver lotes del producto</Link></dd></div></dl></article>)}</div> : <ProductFeedback message="Esta compra no tiene productos detallados." />}</section>
  </div>
}
