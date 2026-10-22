import { useId, useState } from 'react'
import { AlertCircle, ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react'

const inputClassName = 'min-h-14 w-full rounded-2xl border border-[#ddcdbc] bg-[#fffdf8] py-4 pl-12 pr-4 text-base text-[#3e2927] shadow-sm shadow-[#48231f]/[0.025] placeholder:text-[#aa9484] focus:border-[#7a2638] focus:ring-4 focus:ring-[#7a2638]/10 focus:outline-none disabled:opacity-70'

export default function LoginForm({ onSubmit, isSubmitting = false, error = '' }) {
  const id = useId()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const canSubmit = typeof onSubmit === 'function' && email.trim().length > 0 && password.length > 0

  function handleSubmit(event) {
    event.preventDefault()
    if (canSubmit && !isSubmitting) {
      onSubmit(new FormData(event.currentTarget))
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={isSubmitting} className="space-y-3 md:space-y-5">
      <div>
        <label htmlFor={`${id}-email`} className="sr-only text-sm font-semibold text-[#63483e] md:not-sr-only md:mb-2 md:block">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail size={20} strokeWidth={1.7} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#9a6658]" />
          <input id={`${id}-email`} name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isSubmitting} autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} required placeholder="Ingresa tu correo electrónico" className={inputClassName} />
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-password`} className="sr-only text-sm font-semibold text-[#63483e] md:not-sr-only md:mb-2 md:block">
          Contraseña
        </label>
        <div className="relative">
          <LockKeyhole size={20} strokeWidth={1.7} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#9a6658]" />
          <input id={`${id}-password`} name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} disabled={isSubmitting} autoComplete="current-password" required placeholder="Ingresa tu contraseña" className={`${inputClassName} pr-14`} />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword} aria-controls={`${id}-password`} className="absolute top-1/2 right-1.5 flex size-11 -translate-y-1/2 items-center justify-center rounded-xl text-[#9a7565] hover:bg-[#f3e8d9] hover:text-[#6e2333]">
            {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <label htmlFor={`${id}-remember`} className="flex min-h-11 w-fit cursor-pointer items-center gap-3 text-sm text-[#fff5e6] md:text-[#7e6455]">
        <input id={`${id}-remember`} name="rememberMe" type="checkbox" disabled={isSubmitting} className="size-5 shrink-0 cursor-pointer rounded accent-[#7a2638]" />
        Recordarme
      </label>

      <div>
        {error && (
          <div id={`${id}-error`} role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-900">
            <AlertCircle size={18} aria-hidden="true" className="mt-1 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        <button type="submit" disabled={!canSubmit || isSubmitting} aria-describedby={error ? `${id}-error` : undefined} className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#7a2638] px-5 py-4 text-base font-semibold text-[#fff6e9] shadow-lg shadow-[#7a2638]/15 transition-colors enabled:hover:bg-[#601b2b] disabled:cursor-not-allowed disabled:text-[#fff6e9]/65 md:disabled:text-[#fff6e9] md:disabled:opacity-60">
          {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
          {isSubmitting ? <LoaderCircle size={18} aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <ArrowRight size={18} aria-hidden="true" />}
        </button>
        <div className="mt-3 text-center">
          <a href={`#${id}-help`} className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm text-[#f0dfc7] underline decoration-[#cdb6a4] underline-offset-4 hover:text-white md:text-[#8b6a5b] md:hover:text-[#7a2638]">¿Olvidaste tu contraseña?</a>
          <p id={`${id}-help`} tabIndex={-1} className="mt-2 hidden rounded-xl bg-[#f0e6d8] p-3 text-xs leading-5 text-[#705448] target:block">Para recuperar el acceso, contacta al administrador del sistema.</p>
        </div>
      </div>
    </form>
  )
}
