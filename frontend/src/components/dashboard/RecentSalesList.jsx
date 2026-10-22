import { formatMoney } from '../../utils/dashboardFormatters.js'
import EmptyList from './EmptyList.jsx'

function SaleStatus({ children }) {
  const cancelled = children === 'Anulada'
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${cancelled ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>{children}</span>
}

export default function RecentSalesList({ items = [], moneyOptions }) {
  if (!items.length) return <EmptyList />
  return (
    <>
      <ul className="divide-y divide-stone-100 px-4 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="py-4">
            <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-stone-800">{item.reference}</p><p className="mt-1 text-xs text-stone-500">{item.registeredBy}</p></div><p className="shrink-0 text-sm font-semibold tabular-nums">{formatMoney(item.total, moneyOptions)}</p></div>
            <div className="mt-3 flex items-center justify-between gap-2"><p className="text-xs text-stone-500">{item.dateLabel}</p><SaleStatus>{item.statusLabel}</SaleStatus></div>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Ventas recientes</caption>
          <thead className="bg-stone-50/70 text-xs font-medium text-stone-500"><tr><th scope="col" className="px-5 py-3">Venta</th><th scope="col" className="px-5 py-3">Registrada por</th><th scope="col" className="px-5 py-3">Fecha</th><th scope="col" className="px-5 py-3">Estado</th><th scope="col" className="px-5 py-3 text-right">Total</th></tr></thead>
          <tbody className="divide-y divide-stone-100">
            {items.map((item) => <tr key={item.id}><th scope="row" className="px-5 py-4 font-medium text-stone-800">{item.reference}</th><td className="px-5 py-4 text-stone-600">{item.registeredBy}</td><td className="whitespace-nowrap px-5 py-4 text-stone-500">{item.dateLabel}</td><td className="px-5 py-4"><SaleStatus>{item.statusLabel}</SaleStatus></td><td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums">{formatMoney(item.total, moneyOptions)}</td></tr>)}
          </tbody>
        </table>
      </div>
    </>
  )
}
