import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LoaderCircle, Save } from 'lucide-react'
import ProductFeedback from '../products/ProductFeedback.jsx'
import SupplierFormField from './SupplierFormField.jsx'

export default function SupplierForm({ editor, isEditing }) {
  const [confirmDeactivation, setConfirmDeactivation] = useState(false)
  const { values, errors, active, busy, error, change, save, deactivate } = editor
  const fields = { onChange: change, disabled: busy, maxLength: 255 }

  return <form onSubmit={save} aria-busy={busy} className="space-y-5">
    {error && <ProductFeedback kind="error" message={error} />}
    <section aria-label="Datos del proveedor" className="space-y-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
      <SupplierFormField name="name" label="Nombre" required autoComplete="organization" value={values.name} error={errors.name} {...fields} />
      <div className="grid gap-5 sm:grid-cols-2"><SupplierFormField name="phone" label="Teléfono (opcional)" type="tel" autoComplete="tel" value={values.phone} error={errors.phone} {...fields} /><SupplierFormField name="email" label="Correo (opcional)" type="email" autoComplete="email" value={values.email} error={errors.email} {...fields} /></div>
      <SupplierFormField name="address" label="Dirección (opcional)" autoComplete="street-address" value={values.address} error={errors.address} {...fields} />
      {isEditing && <div className="flex items-center justify-between border-t border-stone-100 pt-4"><span className="text-sm text-stone-600">Estado</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>{active ? 'Activo' : 'Inactivo'}</span></div>}
    </section>
    <div className="flex flex-wrap gap-3"><button type="submit" disabled={busy || confirmDeactivation} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#7a2638] px-5 text-sm font-semibold text-white disabled:opacity-60">{busy ? <LoaderCircle size={18} aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Save size={18} aria-hidden="true" />}{busy ? 'Guardando…' : 'Guardar proveedor'}</button><Link to="/suppliers" className="flex min-h-12 items-center justify-center rounded-xl border border-stone-300 px-5 text-sm font-medium text-stone-700">Cancelar</Link></div>
    {isEditing && <div className="border-t border-stone-200 pt-5">{confirmDeactivation ? <div role="group" aria-label="Confirmar desactivación" className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-sm text-red-900">¿Desactivar este proveedor? Ya no aparecerá como opción activa para nuevas compras.</p><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={deactivate} className="min-h-11 rounded-lg bg-red-900 px-4 text-sm font-medium text-white disabled:opacity-60">{busy ? 'Desactivando…' : 'Sí, desactivar'}</button><button type="button" disabled={busy} onClick={() => setConfirmDeactivation(false)} className="min-h-11 rounded-lg px-4 text-sm text-red-900">Cancelar</button></div></div> : <button type="button" disabled={!active || busy} onClick={() => setConfirmDeactivation(true)} className="min-h-11 rounded-lg px-3 text-sm font-medium text-red-900 disabled:opacity-50">{active ? 'Desactivar proveedor' : 'Proveedor inactivo'}</button>}</div>}
  </form>
}
