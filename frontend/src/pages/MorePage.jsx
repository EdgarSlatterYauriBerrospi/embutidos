import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { moreNavigation, visibleNavigation } from '../routes/navigation.js'
import useAuth from '../hooks/useAuth.js'

export default function MorePage() {
  const { user } = useAuth()
  return (
    <section aria-labelledby="more-title">
      <h1 id="more-title" className="text-2xl font-semibold tracking-tight">More</h1>
      <p className="mt-2 text-sm text-stone-500">Más herramientas para gestionar tu negocio.</p>
      <nav aria-label="Más módulos" className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visibleNavigation(moreNavigation, user).map(({ path, label, icon: Icon }) => (
          <Link key={path} to={path} className="flex min-h-20 items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 hover:border-red-900/30 hover:bg-red-50/30">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-900/5 text-red-900"><Icon size={21} strokeWidth={1.7} aria-hidden="true" /></span>
            <span className="flex-1 text-sm font-medium">{label}</span>
            <ChevronRight size={17} aria-hidden="true" className="shrink-0 text-stone-400" />
          </Link>
        ))}
      </nav>
    </section>
  )
}
