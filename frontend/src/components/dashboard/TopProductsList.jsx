import { formatMoney } from '../../utils/dashboardFormatters.js'
import EmptyList from './EmptyList.jsx'

export default function TopProductsList({ items = [], moneyOptions }) {
  if (!items.length) return <EmptyList />
  return (
    <ol className="divide-y divide-stone-100 px-4 sm:px-5">
      {items.map((item, index) => (
        <li key={item.id} className="flex items-center gap-3 py-4">
          <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f7f5f0] text-xs font-semibold text-stone-500">{index + 1}</span>
          <div className="min-w-0 flex-1"><p className="text-sm font-medium text-stone-800">{item.name}</p><p className="mt-1 text-xs text-stone-500">{item.quantity}</p></div>
          <p className="shrink-0 text-xs font-semibold tabular-nums text-stone-700 sm:text-sm">{formatMoney(item.total, moneyOptions)}</p>
        </li>
      ))}
    </ol>
  )
}
