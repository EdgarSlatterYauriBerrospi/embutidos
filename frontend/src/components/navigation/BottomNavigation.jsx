import { useLocation } from 'react-router-dom'
import { mobileNavigation, moreNavigation } from '../../routes/navigation.js'
import NavigationLink from './NavigationLink.jsx'

export default function BottomNavigation() {
  const { pathname } = useLocation()
  const isMoreSection = moreNavigation.some(({ path }) => pathname === path || pathname.startsWith(`${path}/`))

  return (
    <nav aria-label="Navegación principal móvil" className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
        {mobileNavigation.map((item) => (
          <NavigationLink key={item.path} item={item} variant="bottom" sectionActive={item.path === '/more' && isMoreSection} />
        ))}
      </div>
    </nav>
  )
}
