import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, UserRound } from 'lucide-react'
import { formatSaleDateTime } from '../../utils/saleFormatters.js'
import { MOVEMENT_TYPES, movementRegistrant } from '../../utils/stockRules.js'

export default function MovementCard({ movement, user, users }) {
  const type = MOVEMENT_TYPES[movement.type]
  const incoming = type?.direction === 'in'
  const outgoing = type?.direction === 'out'
  const Icon = incoming ? ArrowDownLeft : outgoing ? ArrowUpRight : ArrowLeftRight
  const when = formatSaleDateTime(movement.movementDate)
  const tone = incoming ? 'bg-emerald-50 text-emerald-800' : outgoing ? 'bg-[#7a2638]/10 text-[#7a2638]' : 'bg-stone-100 text-stone-700'
  return <article className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
    <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={20} aria-hidden="true" /></span>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-start justify-between gap-1">
        <h3 className="text-sm font-semibold text-stone-900">{type?.label ?? movement.type}</h3>
        <strong className={`text-base tabular-nums ${incoming ? 'text-emerald-800' : outgoing ? 'text-[#7a2638]' : 'text-stone-700'}`}>{incoming ? '+' : outgoing ? '−' : ''}{movement.quantity}</strong>
      </div>
      <p className="mt-1 text-xs text-stone-500">{when.date} · {when.time}</p>
      <p className="mt-2 flex items-center gap-1 text-xs text-stone-600"><UserRound size={13} aria-hidden="true" />{movementRegistrant(movement, user, users)}</p>
      {movement.reason && <p className="mt-2 break-words text-sm text-stone-700">{movement.reason}</p>}
    </div>
  </article>
}
