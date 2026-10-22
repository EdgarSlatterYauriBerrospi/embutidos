import { Wheat } from 'lucide-react'
import LoginForm from '../components/LoginForm.jsx'
import LoginBrand from '../components/LoginBrand.jsx'
import useLogin from '../hooks/useLogin.js'
import charcuterieHero from '../assets/login-charcuterie.jpg'

export default function LoginPage() {
  const { submitLogin, isSubmitting, error } = useLogin()
  return (
    <main className="relative isolate flex min-h-dvh flex-col bg-[#faf4e9] font-sans text-[#3e2927] lg:grid lg:grid-cols-[1.15fr_1fr]">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#48231f] md:hidden">
        <img src={charcuterieHero} alt="" fetchPriority="high" width="1536" height="1024" className="size-full object-cover object-center" />
        <div className="absolute inset-0 bg-linear-to-b from-[#291016]/75 via-[#35171b]/45 to-[#291016]/75" />
      </div>
      <div className="relative shrink-0 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4 md:h-[min(34svh,24rem)] md:min-h-80 md:overflow-hidden md:bg-[#48231f] md:pt-8 md:pb-0 lg:h-auto lg:min-h-dvh lg:pt-16">
        <img src={charcuterieHero} alt="" fetchPriority="high" width="1536" height="1024" className="absolute inset-0 hidden size-full object-cover object-[center_60%] md:block lg:object-center" />
        <div aria-hidden="true" className="absolute inset-0 hidden bg-linear-to-b from-[#2e1015]/85 via-[#35171b]/15 to-[#35171b]/35 md:block lg:via-[#35171b]/20 lg:to-[#2e1015]/85" />
        <LoginBrand />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-16 hidden px-10 text-center text-[#f6ead7] lg:block">
          <p className="font-serif text-3xl leading-tight">El sabor de la tradición.<br />La tranquilidad de tener el control.</p>
          <div className="mx-auto mt-6 h-px w-12 bg-[#efdab8]/50" />
        </div>
      </div>

      <section aria-label="Iniciar sesión" className="relative z-10 flex flex-1 flex-col justify-center px-6 py-3 md:-mt-7 md:justify-start md:rounded-t-[2rem] md:bg-[#faf4e9] md:px-10 md:pt-9 md:pb-[max(1.5rem,env(safe-area-inset-bottom))] md:shadow-[0_-12px_32px_#35171b0a] lg:mt-0 lg:justify-center lg:rounded-none lg:px-14 lg:py-12 lg:shadow-none">
        <div className="mx-auto w-full max-w-sm">
          <div className="hidden text-center md:mb-8 md:block">
            <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#8e6556] uppercase">Ventas e inventario</p>
            <h2 id="login-title" className="font-serif text-3xl tracking-tight text-[#571f29] sm:text-4xl">Bienvenido de nuevo</h2>
            <p className="mt-2 text-sm leading-6 text-[#846f64]">Inicia sesión para continuar con tu negocio.</p>
          </div>
          <LoginForm onSubmit={submitLogin} isSubmitting={isSubmitting} error={error} />
          <footer className="hidden items-center justify-center gap-2 border-t border-[#e8dccc] pt-5 text-xs text-[#9b8474] md:mt-10 md:flex">
            <Wheat size={15} strokeWidth={1.5} aria-hidden="true" />
            Hecho para cuidar tu negocio
          </footer>
        </div>
      </section>
      <p className="relative z-10 px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center font-serif text-sm tracking-wide text-[#f0dfc7] md:hidden">Calidad en cada mesa</p>
    </main>
  )
}
