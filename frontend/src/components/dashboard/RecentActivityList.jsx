import { CircleX, PackageOpen, ReceiptText, Truck } from 'lucide-react'
import { formatMoney } from '../../utils/dashboardFormatters.js'
import DashboardMessage from './DashboardMessage.jsx'

const activityIcons = { sale: ReceiptText, cancellation: CircleX, purchase: Truck, movement: PackageOpen }

export default function RecentActivityList({ items = [], error, moneyOptions, title = 'Actividad reciente' }) {
  return (
    <section aria-label={title} className="rounded-xl border border-stone-200 bg-white px-3 pt-3 pb-1">
      <h2 className="mb-1 text-xs font-semibold text-stone-800">{title}</h2>
      <ul className="divide-y divide-stone-100">
        {items.slice(0, 3).map((item) => {
          const Icon = activityIcons[item.type] ?? ReceiptText
          return <li key={item.id} className="flex items-center gap-2.5 py-1.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#f7f0e6] text-[#7a2638]"><Icon size={15} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-xs leading-4 font-medium text-stone-700">{item.title}</p><p className="mt-0.5 text-[10px] leading-3 text-stone-400">{item.timeLabel}</p></div>
            {item.amount !== undefined && <span className="shrink-0 text-[11px] font-semibold tabular-nums text-stone-700">{formatMoney(item.amount, moneyOptions)}</span>}
          </li>
        })}
      </ul>
      {error && <DashboardMessage compact message={error} />}
      {!items.length && !error && <p className="py-4 text-xs text-stone-500">Sin actividad reciente.</p>}
    </section>
  )
}
