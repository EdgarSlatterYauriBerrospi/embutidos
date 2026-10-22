import { Link } from 'react-router-dom'
import { Store, UserRound } from 'lucide-react'
import useAuth from '../hooks/useAuth.js'
import LogoutButton from './LogoutButton.jsx'
import NotificationBell from './notifications/NotificationBell.jsx'

export default function MainHeader({ className = '', showNotifications = false }) {
  const { user } = useAuth()

  return (
    <header className={`sticky top-0 z-20 border-b border-stone-200 bg-white ${className}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link to="/dashboard" className="inline-flex min-h-11 w-fit items-center gap-3 rounded-lg">
          <Store size={22} strokeWidth={1.6} aria-hidden="true" className="text-red-900 lg:hidden" />
          <span className="text-lg font-semibold tracking-tight">Embutidos Cáceres</span>
        </Link>
        <div className="flex min-w-0 items-center justify-between gap-3 sm:max-w-sm sm:gap-5">
          {showNotifications && <NotificationBell />}
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f7f5f0] text-stone-500">
              <UserRound size={18} aria-hidden="true" />
            </span>
            <span title={user?.name} className="truncate text-sm font-medium text-stone-700">{user?.name}</span>
          </div>
          <div className="shrink-0"><LogoutButton /></div>
        </div>
      </div>
    </header>
  )
}
