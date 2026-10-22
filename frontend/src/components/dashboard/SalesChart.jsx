import { useId } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMoney } from '../../utils/dashboardFormatters.js'
import EmptyList from './EmptyList.jsx'

export default function SalesChart({ data = [], moneyOptions }) {
  const gradientId = useId().replace(/:/g, '')
  if (!data.length) return <EmptyList />
  const compactNumber = new Intl.NumberFormat(moneyOptions?.locale ?? 'es-PE', { notation: 'compact', maximumFractionDigits: 1 })

  return (
    <div className="px-2 pt-5 pb-3 sm:px-4">
      <div className="h-60 min-w-0 sm:h-72" aria-label="Ventas de los últimos siete días; detalle de valores disponible en la tabla adjunta">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} accessibilityLayer>
            <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7f1d1d" stopOpacity={0.16} /><stop offset="100%" stopColor="#7f1d1d" stopOpacity={0.01} /></linearGradient></defs>
            <CartesianGrid stroke="#eeeae4" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#78716c', fontSize: 11 }} minTickGap={24} tickMargin={12} />
            <YAxis tickFormatter={(value) => compactNumber.format(value)} tickLine={false} axisLine={false} tick={{ fill: '#78716c', fontSize: 11 }} width={48} />
            <Tooltip formatter={(value) => [formatMoney(value, moneyOptions), 'Ventas']} labelFormatter={(day) => day} contentStyle={{ borderRadius: 12, borderColor: '#e7e5e4', fontSize: 12 }} />
            <Area type="linear" dataKey="total" stroke="#7f1d1d" strokeWidth={2.5} fill={`url(#${gradientId})`} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <details className="mx-3 mt-2 text-xs text-stone-500">
        <summary className="w-fit cursor-pointer rounded-md py-2 hover:text-red-900">Ver valores del gráfico</summary>
        <div className="mt-2 max-h-48 overflow-y-auto"><table className="w-full text-left"><caption className="sr-only">Ventas por día</caption><thead><tr><th scope="col" className="py-2">Día</th><th scope="col" className="py-2 text-right">Ventas</th></tr></thead><tbody>{data.map((item) => <tr key={item.day} className="border-t border-stone-100"><th scope="row" className="py-2 font-normal">{item.day}</th><td className="py-2 text-right tabular-nums">{formatMoney(item.total, moneyOptions)}</td></tr>)}</tbody></table></div>
      </details>
    </div>
  )
}
