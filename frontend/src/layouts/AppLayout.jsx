import { Outlet } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'

export default function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-stone-50 font-sans text-stone-900">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:rounded-lg focus:bg-white focus:p-4">
        Saltar al contenido
      </a>
      <AppHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200 px-4 py-5 text-center text-sm text-stone-600">
        Embutidos Cáceres
      </footer>
    </div>
  )
}
