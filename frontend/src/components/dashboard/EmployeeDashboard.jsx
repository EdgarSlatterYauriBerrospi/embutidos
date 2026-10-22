import { BarChart3, CalendarClock, CircleDollarSign, PackageSearch } from 'lucide-react'
import NotificationBell from '../notifications/NotificationBell.jsx'
import { formatCount, formatMoney } from '../../utils/dashboardFormatters.js'
import DashboardMessage from './DashboardMessage.jsx'
import DashboardPanel from './DashboardPanel.jsx'
import RecentActivityList from './RecentActivityList.jsx'
import SalesChart from './SalesChart.jsx'
import StatCard from './StatCard.jsx'
import WeeklySalesChart from './WeeklySalesChart.jsx'

export default function EmployeeDashboard({ user, data, errors, moneyOptions }) {
  const firstName = user?.name?.trim().split(/\s+/)[0]
  const { summary } = data

  return (
    <div className="space-y-4 md:space-y-6">
      <header className="flex min-h-11 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="hidden text-xs font-medium text-red-900 md:block">Tu jornada, de un vistazo</p>
          <h1 className="truncate text-xl font-semibold tracking-tight text-[#48231f] md:mt-1 md:text-3xl">{firstName ? `¡Hola, ${firstName}!` : '¡Hola!'}</h1>
          <p className="mt-0.5 text-[11px] text-stone-500 md:mt-2 md:text-sm">Resumen de tus ventas e información operativa</p>
        </div>
        <div className="shrink-0 md:hidden"><NotificationBell /></div>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
        <div className="col-span-2 sm:col-span-1"><StatCard compact label="Mis ventas de hoy" value={errors.sales ? '—' : formatMoney(summary.todaySales, moneyOptions)} error={errors.sales} icon={CircleDollarSign} /></div>
        <StatCard compact label="Stock bajo" value={errors.products ? '—' : formatCount(summary.lowStockCount, data.locale)} error={errors.products} icon={PackageSearch} tone="warning" />
        <StatCard compact label="Por vencer" value={errors.batches ? '—' : formatCount(summary.expiringCount, data.locale)} error={errors.batches} icon={CalendarClock} tone="warning" />
      </div>

      <div className="md:hidden">
        <WeeklySalesChart title="Mis ventas — últimos 7 días" data={data.dailySales} error={errors.sales} moneyOptions={moneyOptions} />
      </div>
      <div className="hidden md:block">
        <DashboardPanel title="Mis ventas — últimos 7 días" subtitle="Solo ventas registradas por ti" icon={BarChart3}>
          {errors.sales ? <DashboardMessage message={errors.sales} /> : <SalesChart data={data.dailySales} moneyOptions={moneyOptions} />}
        </DashboardPanel>
      </div>

      <RecentActivityList title="Mi actividad reciente" items={data.recentActivity} error={errors.activity} moneyOptions={moneyOptions} />
    </div>
  )
}
