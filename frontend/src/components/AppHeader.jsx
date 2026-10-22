import { Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import LogoutButton from './LogoutButton.jsx'
import useAuth from '../hooks/useAuth.js'

export default function AppHeader() {
  const { isAuthenticated } = useAuth()
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex min-h-11 items-center gap-3 rounded-lg">
          <span className="rounded-xl bg-red-800 p-3 text-white">
            <Store size={22} aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight sm:text-xl">Embutidos Cáceres</span>
        </Link>
        {isAuthenticated && <LogoutButton />}
      </div>
    </header>
  )
}
