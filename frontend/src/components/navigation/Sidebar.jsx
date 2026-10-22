import { Link } from 'react-router-dom'
import { Store, Wheat } from 'lucide-react'
import { mainNavigation, visibleNavigation } from '../../routes/navigation.js'
import useAuth from '../../hooks/useAuth.js'
import NavigationLink from './NavigationLink.jsx'

export default function Sidebar() {
  const { user } = useAuth()
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#48231f] text-[#f6eee2] lg:flex">
      <Link to="/dashboard" className="mx-5 mt-7 flex items-center gap-3 rounded-xl">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#dac5a6]/25 text-[#dac5a6]">
          <Store size={22} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <span className="text-lg font-semibold leading-6 tracking-tight">Embutidos<br />Cáceres</span>
      </Link>
      <nav aria-label="Navegación principal" className="mt-9 flex-1 space-y-1 overflow-y-auto px-4 pb-6">
        {visibleNavigation(mainNavigation, user).map((item) => <NavigationLink key={item.path} item={item} />)}
      </nav>
      <div className="mx-6 flex items-center gap-2 border-t border-white/10 py-6 text-xs text-[#dac5a6]">
        <Wheat size={17} aria-hidden="true" />
        Ventas e inventario
      </div>
    </aside>
  )
}
