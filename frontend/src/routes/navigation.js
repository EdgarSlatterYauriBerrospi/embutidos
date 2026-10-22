import { BarChart3, Boxes, CalendarClock, Ellipsis, LayoutDashboard, Package, ShoppingCart, Truck, Users, WalletCards } from 'lucide-react'

export const mainNavigation = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sales', label: 'Sales', icon: ShoppingCart },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/stock', label: 'Stock & Batches', icon: Boxes },
  { path: '/expirations', label: 'Expirations', icon: CalendarClock },
  { path: '/purchases', label: 'Purchases', icon: WalletCards, adminOnly: true },
  { path: '/suppliers', label: 'Suppliers', icon: Truck, adminOnly: true },
  { path: '/users', label: 'Users', icon: Users, adminOnly: true },
  { path: '/reports', label: 'Reports', icon: BarChart3, adminOnly: true },
]

export const moreNavigation = mainNavigation.slice(3)
export function visibleNavigation(items, user) {
  return user?.role === 'ADMIN' ? items : items.filter((item) => !item.adminOnly)
}
export const mobileNavigation = [
  ...mainNavigation.slice(0, 3),
  { path: '/more', label: 'More', icon: Ellipsis },
]
