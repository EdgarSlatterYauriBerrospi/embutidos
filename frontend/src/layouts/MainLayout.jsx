import { Outlet, useMatch } from 'react-router-dom'
import MainHeader from '../components/MainHeader.jsx'
import Sidebar from '../components/navigation/Sidebar.jsx'
import BottomNavigation from '../components/navigation/BottomNavigation.jsx'
import NotificationProvider from '../context/NotificationProvider.jsx'

export default function MainLayout() {
  const isDashboard = Boolean(useMatch('/dashboard'))
  return (
    <NotificationProvider><div className="min-h-dvh bg-[#f7f5f0] font-sans text-stone-900 lg:pl-64">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:p-4">
        Saltar al contenido
      </a>
      <Sidebar />
      <MainHeader showNotifications={isDashboard} className={isDashboard ? 'hidden md:block' : ''} />
      <main id="main-content" tabIndex={-1} className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 lg:pb-10 ${isDashboard ? 'pt-3 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pt-8 md:pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-10' : 'pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pt-8'}`}>
        <Outlet />
      </main>
      <BottomNavigation />
    </div></NotificationProvider>
  )
}
