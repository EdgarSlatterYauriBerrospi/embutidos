import { useState } from 'react'
import { CircleX, X } from 'lucide-react'

export default function SaleCancellationPanel({ onCancel, submitting, error }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const validationError = open && reason.length > 500
    ? 'El motivo debe tener máximo 500 caracteres.'
    : ''

  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-800 hover:bg-red-50"><CircleX size={18} aria-hidden="true" />Anular venta</button>
  }

  async function submit(event) {
    event.preventDefault()
    if (!reason.trim() || validationError) return
    try { await onCancel(reason) } catch { /* Error is presented by the owning hook. */ }
  }

  return <form onSubmit={submit} className="w-full rounded-2xl border border-red-200 bg-red-50/60 p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-red-900">Anular venta</h2><p className="mt-1 text-sm leading-5 text-red-800/80">El backend restaurará los lotes y registrará la reversión de stock.</p></div><button type="button" onClick={() => setOpen(false)} disabled={submitting} aria-label="Cerrar" className="flex size-10 shrink-0 items-center justify-center rounded-lg text-red-800 hover:bg-red-100"><X size={18} aria-hidden="true" /></button></div>
    <label htmlFor="cancellation-reason" className="mt-4 block text-sm font-medium text-stone-700">Motivo de anulación</label>
    <textarea id="cancellation-reason" required maxLength={500} rows={3} value={reason} onChange={(event) => setReason(event.target.value)} disabled={submitting} className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7a2638] focus:ring-2 focus:ring-[#7a2638]/15" placeholder="Describe por qué se anula la venta" />
    {(validationError || error) && <p role="alert" className="mt-2 text-sm text-red-700">{validationError || error}</p>}
    <button type="submit" disabled={submitting || !reason.trim() || Boolean(validationError)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#7a2638] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">{submitting ? 'Anulando…' : 'Confirmar anulación'}</button>
  </form>
}
