import {
  AlertTriangle,
  CalendarClock,
  PackageMinus,
  PackagePlus,
  CircleX,
  SlidersHorizontal,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatLocalDateTime, formatRelativeTime } from '../../utils/dateTime.js'
import { notificationLabel } from '../../utils/notificationFormatters.js'

const icons = {
  LOW_STOCK: PackageMinus,
  EXPIRING_BATCH: CalendarClock,
  EXPIRED_BATCH: AlertTriangle,
  STOCK_ADJUSTMENT: SlidersHorizontal,
  PURCHASE_REGISTERED: PackagePlus,
  SALE_CANCELLED: CircleX,
}

const unreadTones = {
  LOW_STOCK: 'bg-[#7a2638]/8 text-[#7a2638]',
  EXPIRING_BATCH: 'bg-amber-50 text-amber-700',
  EXPIRED_BATCH: 'bg-red-50 text-red-700',
  STOCK_ADJUSTMENT: 'bg-[#7a2638]/8 text-[#7a2638]',
  PURCHASE_REGISTERED: 'bg-[#7a2638]/8 text-[#7a2638]',
  SALE_CANCELLED: 'bg-[#7a2638]/8 text-[#7a2638]',
}

export default function NotificationItem({ notification, compact = false, onOpen }) {
  const Icon = icons[notification.type] ?? AlertTriangle
  const iconTone = notification.read
    ? 'bg-stone-100 text-stone-400'
    : (unreadTones[notification.type] ?? 'bg-stone-100 text-stone-600')
  const content = (
    <>
      <span className={`flex shrink-0 items-center justify-center rounded-lg ${iconTone} ${compact ? 'size-8' : 'size-11'}`}>
        <Icon size={compact ? 16 : 19} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={`${compact ? 'text-xs' : 'text-sm'} truncate font-semibold ${notification.read ? 'text-stone-600' : 'text-stone-900'}`}>{notificationLabel(notification.type)}</span>
          {!notification.read && <span className="size-1.5 shrink-0 rounded-full bg-[#7a2638]" aria-label="No leída" />}
        </span>
        <span className={`mt-1 block text-stone-600 ${compact ? 'line-clamp-2 text-xs leading-4' : 'text-sm leading-5'}`}>{notification.message}</span>
        <span title={formatLocalDateTime(notification.createdAt)} className="mt-1 block text-[11px] text-stone-400">{formatRelativeTime(notification.createdAt)}</span>
      </span>
    </>
  )

  if (notification.targetPath) {
    return <Link to={notification.targetPath} onClick={() => onOpen?.(notification)} className={`flex gap-2.5 transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7a2638]/30 ${compact ? 'px-3 py-2.5' : 'rounded-2xl border border-stone-200 bg-white p-4'}`}>{content}</Link>
  }

  return <button type="button" onClick={() => onOpen?.(notification)} className={`flex w-full gap-2.5 text-left transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7a2638]/30 ${compact ? 'px-3 py-2.5' : 'rounded-2xl border border-stone-200 bg-white p-4'}`}>{content}</button>
}
