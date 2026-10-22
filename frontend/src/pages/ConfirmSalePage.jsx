import { useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft, LoaderCircle } from 'lucide-react'
import useAuth from '../hooks/useAuth.js'
import useSaleDraft from '../hooks/useSaleDraft.js'
import { getAllProducts } from '../services/productService.js'
import { createSale } from '../services/saleService.js'
import { getProductError } from '../utils/productError.js'
import { getSaleError } from '../utils/saleError.js'
import { revalidateSaleLines, validateSalePayment } from '../utils/saleRules.js'
import SaleSummary from '../components/sales/SaleSummary.jsx'
import PaymentMethodSelector from '../components/sales/PaymentMethodSelector.jsx'
import SaleFeedback from '../components/sales/SaleFeedback.jsx'
import SaleSuccess from '../components/sales/SaleSuccess.jsx'

export default function ConfirmSalePage() {
  const { user } = useAuth()
  const draft = useSaleDraft()
  const pending = useRef(false)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [paymentReference, setPaymentReference] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (draft.completedSale) return <SaleSuccess sale={draft.completedSale} onNewSale={draft.reset} />
  if (!draft.lines.length) return <Navigate to="/sales/new" replace />

  async function submit(event) {
    event.preventDefault()
    if (pending.current) return
    const request = { userId: Number(user.userId), paymentMethod, paymentReference, lines: draft.lines }
    const validationError = validateSalePayment(request)
    if (validationError) { setError(validationError); return }
    pending.current = true; setBusy(true); setError('')
    try {
      let products
      try { products = await getAllProducts() } catch (cause) { setError(getProductError(cause)); return }
      const revalidation = revalidateSaleLines(draft.lines, products)
      if (revalidation.error) { setError(revalidation.error); return }
      draft.complete(await createSale({ ...request, lines: revalidation.lines }))
    } catch (cause) {
      setError(getSaleError(cause))
    } finally {
      pending.current = false; setBusy(false)
    }
  }

  return <div className="mx-auto max-w-2xl space-y-5"><div className="flex items-center gap-3"><Link to="/sales/new" aria-label="Volver a seleccionar productos" className="flex size-11 items-center justify-center rounded-xl border border-stone-200 bg-white"><ArrowLeft size={19} aria-hidden="true" /></Link><div><h1 className="text-2xl font-semibold tracking-tight">Confirmar venta</h1><p className="text-sm text-stone-500">Revisa el resumen y el pago</p></div></div>
    <SaleSummary lines={draft.lines} />
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">{error && <SaleFeedback kind="error" message={error} />}<PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} disabled={busy} />{paymentMethod === 'YAPE_PLIN' && <div><label htmlFor="payment-reference" className="mb-2 block text-sm font-medium">Referencia de pago <span className="font-normal text-stone-400">(opcional)</span></label><input id="payment-reference" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} disabled={busy} maxLength={255} className="min-h-12 w-full rounded-xl border border-stone-300 px-4 text-base focus:border-red-900 focus:outline-none focus:ring-2 focus:ring-red-900/10" /></div>}<button type="submit" disabled={busy} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#7a2638] px-5 font-semibold text-white disabled:opacity-60">{busy && <LoaderCircle size={19} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}{busy ? 'Registrando venta…' : 'Confirmar venta'}</button></form>
  </div>
}
