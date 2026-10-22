import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useAuth from '../hooks/useAuth.js'
import useNotifications from '../hooks/useNotifications.js'
import useSaleDetail from '../hooks/useSaleDetail.js'
import SaleCancellationPanel from '../components/sales/SaleCancellationPanel.jsx'
import SaleFeedback from '../components/sales/SaleFeedback.jsx'
import { formatSaleDateTime, formatSaleMoney, registeredByLabel } from '../utils/saleFormatters.js'
import { canCancelSales, isSaleCancelled, paymentMethodLabel } from '../utils/saleRules.js'

export default function SaleDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const employeeView = user?.role === 'EMPLOYEE'
  const { refresh: refreshNotifications } = useNotifications()
  const { sale, productById, employeeNumber, loading, error, reload, cancel, cancellation } = useSaleDetail(id, employeeView ? user.userId : undefined)

  if (loading) return <SaleFeedback kind="loading" message="Cargando detalle de venta…" />
  if (error) return <SaleFeedback kind="error" message={error} onRetry={reload} />

  const when = formatSaleDateTime(sale.saleDate)
  const cancelled = isSaleCancelled(sale)
  const cancellationWhen = sale.cancellationDate
    ? formatSaleDateTime(sale.cancellationDate)
    : null
  const saleLabel = employeeView
    ? employeeNumber ? `Mi venta #${employeeNumber}` : 'Mi venta'
    : `Venta #${sale.id}`

  async function handleCancel(reason) {
    await cancel(reason)
    await refreshNotifications()
  }

  return <div className="mx-auto max-w-3xl space-y-5">
    <Link to="/sales" className="inline-flex min-h-11 items-center gap-2 text-sm text-stone-500"><ArrowLeft size={18} aria-hidden="true" />{employeeView ? 'Mis ventas' : 'Ventas'}</Link>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h1 className="text-2xl font-semibold">{saleLabel}</h1><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cancelled ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>{cancelled ? 'Anulada' : 'Registrada'}</span></div><p className="mt-1 text-sm text-stone-500">{when.date} · {when.time}</p></div>{canCancelSales(user) && !cancelled && <SaleCancellationPanel onCancel={handleCancel} submitting={cancellation.submitting} error={cancellation.error} />}</div>

    {cancelled && <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm"><h2 className="font-semibold text-red-900">Venta anulada</h2><dl className="mt-3 grid gap-3 sm:grid-cols-2"><div><dt className="text-xs text-red-700">Fecha de anulación</dt><dd className="mt-1 font-medium text-red-950">{cancellationWhen ? `${cancellationWhen.date} · ${cancellationWhen.time}` : 'No disponible'}</dd></div><div><dt className="text-xs text-red-700">Anulada por</dt><dd className="mt-1 font-medium text-red-950">{String(sale.cancelledByUserId) === String(user?.userId) ? user.name : `Usuario #${sale.cancelledByUserId}`}</dd></div><div className="sm:col-span-2"><dt className="text-xs text-red-700">Motivo</dt><dd className="mt-1 whitespace-pre-wrap text-red-950">{sale.cancellationReason}</dd></div></dl></section>}

    <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-sm sm:grid-cols-3"><div><dt className="text-xs text-stone-500">Registrada por</dt><dd className="mt-1 font-medium">{registeredByLabel(sale, user)}</dd></div><div><dt className="text-xs text-stone-500">Método de pago</dt><dd className="mt-1 font-medium">{paymentMethodLabel(sale.paymentMethod)}</dd></div>{sale.paymentReference && <div><dt className="text-xs text-stone-500">Referencia</dt><dd className="mt-1 break-words font-medium">{sale.paymentReference}</dd></div>}</dl>

    <section aria-labelledby="sold-products-title" className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6"><h2 id="sold-products-title" className="text-sm font-semibold">Productos vendidos</h2><div className="mt-3 divide-y divide-stone-100">{sale.lines.map((line) => { const product = productById.get(line.productId); return <div key={line.id} className="py-3"><div className="flex justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{product?.name ?? `Producto #${line.productId}`}</p><p className="mt-1 text-xs text-stone-500">{line.quantity} × {formatSaleMoney(line.unitPrice)}</p></div><p className="shrink-0 text-sm font-semibold tabular-nums">{formatSaleMoney(line.subtotal)}</p></div></div> })}</div><div className="mt-3 flex justify-between border-t border-stone-200 pt-4"><span className="font-medium">Total final</span><strong className={`text-xl tabular-nums ${cancelled ? 'text-stone-500 line-through' : 'text-[#7a2638]'}`}>{formatSaleMoney(sale.total)}</strong></div></section>
  </div>
}
