import {
  BarChart3,
  CalendarClock,
  CircleDollarSign,
  PackageSearch,
  ReceiptText,
  ShoppingBag,
  Trophy,
  Wallet,
} from 'lucide-react'
import DashboardMessage from '../components/dashboard/DashboardMessage.jsx'
import DashboardPanel from '../components/dashboard/DashboardPanel.jsx'
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton.jsx'
import ExpiringProductsList from '../components/dashboard/ExpiringProductsList.jsx'
import LowStockList from '../components/dashboard/LowStockList.jsx'
import MobileDashboard from '../components/dashboard/MobileDashboard.jsx'
import RecentSalesList from '../components/dashboard/RecentSalesList.jsx'
import SalesChart from '../components/dashboard/SalesChart.jsx'
import StatCard from '../components/dashboard/StatCard.jsx'
import TopProductsList from '../components/dashboard/TopProductsList.jsx'
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard.jsx'
import useDashboard from '../hooks/useDashboard.js'
import useAuth from '../hooks/useAuth.js'
import { formatCount, formatMoney } from '../utils/dashboardFormatters.js'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, errors, loading } = useDashboard()

  if (loading) return <DashboardSkeleton />

  const moneyOptions = { locale: data.locale, currency: data.currency }
  const { summary } = data

  if (user?.role === 'EMPLOYEE') {
    return <EmployeeDashboard user={user} data={data} errors={errors} moneyOptions={moneyOptions} />
  }

  return (
    <>
      <MobileDashboard data={data} errors={errors} moneyOptions={moneyOptions} />
      <div className="hidden space-y-5 md:block md:space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="mb-1 text-xs font-medium text-red-900">Tu negocio, de un vistazo</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1><p className="mt-2 text-sm text-stone-500">Resumen de ventas e inventario</p></div>
          <span className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs capitalize text-stone-600">{data.periodLabel}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
          <StatCard label="Ventas de hoy" value={errors.sales ? '—' : formatMoney(summary.todaySales, moneyOptions)} detail="Importe del día" error={errors.sales} icon={CircleDollarSign} />
          <StatCard label="Ventas del mes" value={errors.sales ? '—' : formatMoney(summary.monthSales, moneyOptions)} detail={data.periodLabel} error={errors.sales} icon={Wallet} />
          <StatCard label="Ventas realizadas" value={errors.sales ? '—' : formatCount(summary.salesCount, data.locale)} detail="Durante este mes" error={errors.sales} icon={ReceiptText} />
          <StatCard label="Stock bajo" value={errors.products ? '—' : formatCount(summary.lowStockCount, data.locale)} detail="Productos por revisar" error={errors.products} icon={PackageSearch} tone="warning" />
          <StatCard label="Próximos a vencer" value={errors.batches ? '—' : formatCount(summary.expiringCount, data.locale)} detail="Lotes por revisar" error={errors.batches} icon={CalendarClock} tone="warning" />
        </div>

        <div className="grid gap-5 sm:gap-6 xl:grid-cols-3">
          <DashboardPanel title="Ventas — últimos 7 días" subtitle="Totales diarios en soles" icon={BarChart3} className="xl:col-span-2">
            {errors.sales ? <DashboardMessage message={errors.sales} /> : <SalesChart data={data.dailySales} moneyOptions={moneyOptions} />}
          </DashboardPanel>
          <DashboardPanel title="Productos más vendidos" subtitle="Ranking del mes" icon={Trophy} to="/reports">
            {errors.sales ? <DashboardMessage message={errors.sales} /> : <TopProductsList items={data.topProducts} moneyOptions={moneyOptions} />}
          </DashboardPanel>
        </div>

        <div className="grid gap-5 md:grid-cols-2 sm:gap-6">
          <DashboardPanel title="Productos con stock bajo" subtitle="Existencias y mínimo de referencia" icon={PackageSearch} count={errors.products ? undefined : summary.lowStockCount} to="/stock">
            {errors.products ? <DashboardMessage message={errors.products} /> : <LowStockList items={data.lowStock} />}
          </DashboardPanel>
          <DashboardPanel title="Próximos a vencer" subtitle="Lotes activos con existencias para los próximos 30 días" icon={CalendarClock} count={errors.batches ? undefined : summary.expiringCount} to="/expirations">
            {errors.batches ? <DashboardMessage message={errors.batches} /> : <ExpiringProductsList items={data.expiringProducts} />}
          </DashboardPanel>
        </div>

        <DashboardPanel title="Ventas recientes" subtitle="Últimas ventas registradas" icon={ShoppingBag} to="/sales">
          {errors.sales ? <DashboardMessage message={errors.sales} /> : <RecentSalesList items={data.recentSales} moneyOptions={moneyOptions} />}
        </DashboardPanel>
      </div>
    </>
  )
}
