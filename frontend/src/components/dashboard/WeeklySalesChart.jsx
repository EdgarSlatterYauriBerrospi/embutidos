import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { formatMoney } from '../../utils/dashboardFormatters.js'
import DashboardMessage from './DashboardMessage.jsx'

export default function WeeklySalesChart({ data = [], error, moneyOptions, title = 'Ventas — últimos 7 días' }) {
  return (
    <section aria-label={title} className="min-w-0 rounded-xl border border-stone-200 bg-white px-3 pt-3 pb-2">
      <h2 className="text-xs font-semibold text-stone-800">{title}</h2>
      {error ? <div className="flex h-[135px] items-center justify-center"><DashboardMessage compact message={error} /></div> : data.length ? <div className="mt-1 h-[135px] min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={data} margin={{ top: 12, right: 10, left: 10, bottom: 0 }} accessibilityLayer>
            <CartesianGrid vertical={false} stroke="#eeeae4" strokeDasharray="3 3" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8a756b', fontSize: 10 }} tickMargin={8} minTickGap={12} height={25} />
            <Tooltip formatter={(value) => [formatMoney(value, moneyOptions), 'Ventas']} labelFormatter={(day) => day} contentStyle={{ borderRadius: 10, borderColor: '#e7e5e4', fontSize: 11 }} />
            <Line dataKey="total" type="linear" stroke="#7a2638" strokeWidth={2} dot={{ r: 2.5, fill: '#7a2638', strokeWidth: 0 }} activeDot={{ r: 4 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div> : <p className="py-8 text-xs text-stone-500">No hay ventas para mostrar.</p>}
      {!error && <ul className="sr-only" aria-label="Valores de ventas por día">{data.map((item) => <li key={item.day}>{item.day}: {formatMoney(item.total, moneyOptions)}</li>)}</ul>}
    </section>
  )
}
