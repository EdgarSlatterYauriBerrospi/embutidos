import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, LoaderCircle, Save } from 'lucide-react'
import { USER_ROLES } from '../../utils/userRules.js'
import ProductFeedback from '../products/ProductFeedback.jsx'
import ActiveStatus from './ActiveStatus.jsx'
import UserFormField from './UserFormField.jsx'

export default function UserForm({ editor, isEditing }) {
  const [showPassword, setShowPassword] = useState(false)
  const [confirmDeactivation, setConfirmDeactivation] = useState(false)
  const { values, errors, active, busy, error, change, save, deactivate } = editor
  const fieldProps = { onChange: change, disabled: busy, maxLength: 255 }

  return <form onSubmit={save} aria-busy={busy} className="space-y-5">
    {error && <ProductFeedback kind="error" message={error} />}
    <section aria-label="Datos del usuario" className="space-y-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
      <UserFormField name="name" label="Nombre" required autoComplete="name" value={values.name} error={errors.name} {...fieldProps} />
      <UserFormField name="email" label="Correo electrónico" type="email" required autoComplete="email" value={values.email} error={errors.email} {...fieldProps} />
      <div><UserFormField name="password" label={isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña'} type={showPassword ? 'text' : 'password'} required={!isEditing} autoComplete="new-password" value={values.password} error={errors.password} onChange={change} disabled={busy} trailing={<button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword} className="flex size-10 items-center justify-center rounded-lg text-stone-500 hover:text-[#7a2638]">{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>} />{isEditing && <p className="mt-1 text-xs text-stone-500">Déjala vacía para conservar la contraseña actual.</p>}</div>
      <div><label htmlFor="user-role" className="mb-2 block text-sm font-medium text-stone-700">Rol</label><select id="user-role" required value={values.role} onChange={(event) => change('role', event.target.value)} disabled={busy} aria-invalid={Boolean(errors.role)} aria-describedby={errors.role ? 'user-role-error' : undefined} className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-base focus:border-[#7a2638] focus:outline-none focus:ring-2 focus:ring-[#7a2638]/10"><option value="">Selecciona un rol</option>{USER_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select>{errors.role && <p id="user-role-error" className="mt-2 text-xs text-red-900">{errors.role}</p>}</div>
      <div className="flex items-center justify-between border-t border-stone-100 pt-4"><div><p className="text-sm font-medium text-stone-700">Estado</p><p className="mt-1 text-xs text-stone-500">{isEditing ? 'La desactivación se realiza por separado.' : 'Los usuarios nuevos se crean activos.'}</p></div><ActiveStatus active={active} /></div>
    </section>
    <div className="flex flex-wrap gap-3"><button type="submit" disabled={busy || confirmDeactivation} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#7a2638] px-5 text-sm font-semibold text-white disabled:opacity-60">{busy ? <LoaderCircle size={18} aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Save size={18} aria-hidden="true" />}{busy ? 'Guardando…' : 'Guardar usuario'}</button><Link to="/users" className="flex min-h-12 items-center justify-center rounded-xl border border-stone-300 px-5 text-sm font-medium text-stone-700">Cancelar</Link></div>
    {isEditing && <div className="border-t border-stone-200 pt-5">{confirmDeactivation ? <div role="group" aria-label="Confirmar desactivación" className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-sm text-red-900">¿Desactivar este usuario? Sus ventas y movimientos históricos permanecerán vinculados a él.</p><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={deactivate} className="min-h-11 rounded-lg bg-red-900 px-4 text-sm font-medium text-white disabled:opacity-60">{busy ? 'Desactivando…' : 'Sí, desactivar'}</button><button type="button" disabled={busy} onClick={() => setConfirmDeactivation(false)} className="min-h-11 rounded-lg px-4 text-sm text-red-900">Cancelar</button></div></div> : <button type="button" disabled={!active || busy} onClick={() => setConfirmDeactivation(true)} className="min-h-11 rounded-lg px-3 text-sm font-medium text-red-900 disabled:opacity-50">{active ? 'Desactivar usuario' : 'Usuario inactivo'}</button>}</div>}
  </form>
}
