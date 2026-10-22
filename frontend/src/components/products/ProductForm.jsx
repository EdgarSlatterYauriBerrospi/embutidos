import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LoaderCircle, Save, ShieldCheck } from 'lucide-react'
import ProductFormField from './ProductFormField.jsx'
import ProductImage from './ProductImage.jsx'
import ProductFeedback from './ProductFeedback.jsx'

export default function ProductForm({ editor, isEditing }) {
  const [confirmDeactivation, setConfirmDeactivation] = useState(false)
  const { values, errors, active, busy, canEdit, change, save, deactivate, error } = editor
  const fieldProps = { onChange: change, disabled: !canEdit || busy }

  return (
    <form onSubmit={save} aria-busy={busy} className="space-y-6">
      {error && <ProductFeedback kind="error" message={error} />}
      {!canEdit && <div className="flex items-center gap-2 rounded-xl bg-stone-100 p-3 text-sm text-stone-600"><ShieldCheck size={18} aria-hidden="true" />Modo de consulta. Solo ADMIN puede modificar productos.</div>}
      <section aria-label="Imagen del producto" className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
        <ProductImage imageUrl={values.imageUrl} name={values.name} className="mx-auto h-44 w-full max-w-xs sm:h-52" />
        <ProductFormField name="imageUrl" label="URL de la imagen" type="url" maxLength={2048} placeholder="https://…" value={values.imageUrl} error={errors.imageUrl} {...fieldProps} />
        <p className="text-xs leading-5 text-stone-500">Usa una URL pública http o https. La carga de archivos aún no está disponible.</p>
      </section>
      <section aria-label="Datos del producto" className="space-y-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
        <ProductFormField name="name" label="Nombre" required value={values.name} error={errors.name} {...fieldProps} />
        <ProductFormField name="description" label="Descripción" multiline rows={3} value={values.description} {...fieldProps} />
        <ProductFormField name="price" label="Precio" type="number" inputMode="decimal" required min="0.01" max="9999999999.99" step="0.01" value={values.price} error={errors.price} {...fieldProps} />
        <ProductFormField name="minimumStock" label="Stock mínimo" type="number" inputMode="numeric" required min="0" max="2147483647" step="1" value={values.minimumStock} error={errors.minimumStock} {...fieldProps} />
        {isEditing && <div className="flex items-center justify-between border-t border-stone-100 pt-4"><span className="text-sm text-stone-600">Estado</span><span className={`rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>{active ? 'Activo' : 'Inactivo'}</span></div>}
      </section>
      <div className="flex flex-wrap gap-3">
        {canEdit && <button type="submit" disabled={busy || confirmDeactivation} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#7a2638] px-5 py-3 text-sm font-semibold text-white enabled:hover:bg-[#601b2b] disabled:opacity-60">{busy ? <LoaderCircle size={18} aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Save size={18} aria-hidden="true" />}{busy ? 'Procesando…' : 'Guardar producto'}</button>}
        <Link to="/products" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-stone-300 px-5 py-3 text-sm font-medium text-stone-600">{canEdit ? 'Cancelar' : 'Volver'}</Link>
      </div>
      {isEditing && canEdit && (
        <div className="border-t border-stone-200 pt-5">
          {confirmDeactivation ? <div role="group" aria-label="Confirmar desactivación" className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-sm text-red-900">¿Desactivar este producto? El backend no permite reactivarlo desde esta pantalla.</p><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={deactivate} className="min-h-11 rounded-lg bg-red-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{busy ? 'Desactivando…' : 'Sí, desactivar'}</button><button type="button" disabled={busy} onClick={() => setConfirmDeactivation(false)} className="min-h-11 rounded-lg px-4 py-2 text-sm text-red-900">Cancelar</button></div></div> : <button type="button" disabled={!active || busy} onClick={() => setConfirmDeactivation(true)} className="min-h-11 rounded-lg px-3 text-sm font-medium text-red-900 disabled:opacity-50">{active ? 'Desactivar producto' : 'Producto inactivo'}</button>}
        </div>
      )}
    </form>
  )
}
