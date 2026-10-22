import { CalendarClock, CircleDollarSign, PackageSearch, Wallet } from 'lucide-react'
import useAuth from '../../hooks/useAuth.js'
import { formatCount, formatMoney } from '../../utils/dashboardFormatters.js'
import StatCard from './StatCard.jsx'
import WeeklySalesChart from './WeeklySalesChart.jsx'
import RecentActivityList from './RecentActivityList.jsx'
import NotificationBell from '../notifications/NotificationBell.jsx'

const roleLabels = { ADMIN: 'Administrador', EMPLOYEE: 'Empleado' }

export default function MobileDashboard({ data, errors, moneyOptions }) {
  const { user } = useAuth()
  const firstName = user?.name?.trim().split(/\s+/)[0]
  const { summary } = data

  return (
    <div className="space-y-3 md:hidden">
      <header className="flex min-h-11 items-center justify-between gap-3">
        <div className="min-w-0"><h1 className="truncate text-xl font-semibold tracking-tight text-[#48231f]">{firstName ? `¡Hola, ${firstName}!` : '¡Hola!'}</h1><p className="mt-0.5 text-[11px] text-stone-500">{roleLabels[user?.role] ?? user?.role}</p></div>
        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell />
        </div>
      </header>
      <div className="grid grid-cols-2 gap-2">
        <StatCard compact label="Ventas de hoy" value={errors.sales ? '—' : formatMoney(summary.todaySales, moneyOptions)} error={errors.sales} icon={CircleDollarSign} />
        <StatCard compact label="Ventas del mes" value={errors.sales ? '—' : formatMoney(summary.monthSales, moneyOptions)} error={errors.sales} icon={Wallet} />
        <StatCard compact label="Stock bajo" value={errors.products ? '—' : formatCount(summary.lowStockCount, data.locale)} error={errors.products} icon={PackageSearch} tone="warning" />
        <StatCard compact label="Por vencer" value={errors.batches ? '—' : formatCount(summary.expiringCount, data.locale)} error={errors.batches} icon={CalendarClock} tone="warning" />
      </div>
      <WeeklySalesChart data={data.dailySales} error={errors.sales} moneyOptions={moneyOptions} />
      <RecentActivityList items={data.recentActivity} error={errors.activity} moneyOptions={moneyOptions} />
    </div>
  )
}
