import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DashboardPanel({ title, subtitle, icon: Icon, count, to, children, className = '' }) {
  return (
    <section aria-label={title} className={`min-w-0 rounded-2xl border border-stone-200 bg-white ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b border-stone-100 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-800">
            {Icon && <Icon size={18} strokeWidth={1.7} aria-hidden="true" className="shrink-0 text-red-900" />}
            {title}
            {count !== undefined && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs tabular-nums text-stone-600">{count}</span>}
          </h2>
          {subtitle && <p className="mt-1.5 text-xs leading-5 text-stone-500">{subtitle}</p>}
        </div>
        {to && <Link to={to} aria-label={`Ver ${title.toLowerCase()}`} className="-mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-50 hover:text-red-900"><ArrowUpRight size={19} aria-hidden="true" /></Link>}
      </div>
      {children}
    </section>
  )
}
