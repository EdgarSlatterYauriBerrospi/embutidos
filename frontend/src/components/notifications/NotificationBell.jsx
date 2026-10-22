import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import useNotifications from '../../hooks/useNotifications.js'
import { sortNotificationsNewestFirst } from '../../utils/notificationFormatters.js'
import NotificationItem from './NotificationItem.jsx'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const panelId = useId()
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead } = useNotifications()
  const recentNotifications = useMemo(
    () => sortNotificationsNewestFirst(notifications).slice(0, 3),
    [notifications],
  )

  useEffect(() => {
    if (!open) return undefined

    const closeFromOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    const closeFromKeyboard = (event) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeFromOutside)
    document.addEventListener('keydown', closeFromKeyboard)
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('pointerdown', closeFromOutside)
      document.removeEventListener('keydown', closeFromKeyboard)
    }
  }, [open])

  async function openNotification(notification) {
    setOpen(false)
    if (!notification.read) {
      try { await markAsRead(notification.id) } catch { /* The destination remains accessible. */ }
    }
  }

  async function readAll() {
    try { await markAllAsRead() } catch { /* The provider keeps the current unread state. */ }
  }

  return (
    <div ref={containerRef} className="relative">
      <button ref={triggerRef} type="button" aria-label={`Notificaciones${unreadCount ? `, ${unreadCount} sin leer` : ''}`} aria-haspopup="dialog" aria-controls={open ? panelId : undefined} aria-expanded={open} onClick={() => setOpen((current) => !current)} className="relative flex size-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-[#7a2638] transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a2638]/30">
        <Bell size={19} strokeWidth={1.7} aria-hidden="true" />
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-[#7a2638] px-1 text-[10px] font-bold leading-5 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>
      {open && <div ref={panelRef} id={panelId} role="dialog" aria-labelledby={`${panelId}-title`} tabIndex={-1} className="absolute top-full right-0 z-40 mt-2 flex max-h-[min(24rem,calc(100dvh-6rem))] w-[min(20rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_12px_32px_rgba(28,25,23,0.14)] focus:outline-none">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-stone-100 px-3 py-2.5">
          <p id={`${panelId}-title`} className="text-sm font-semibold text-stone-900">Notificaciones</p>
          {unreadCount > 0 && <button type="button" onClick={readAll} className="rounded-md px-1.5 py-1 text-[11px] font-medium text-[#7a2638] hover:bg-[#7a2638]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a2638]/30">Marcar todas como leídas</button>}
        </div>
        {loading ? <p role="status" className="px-4 py-5 text-center text-xs text-stone-500">Cargando…</p> : error ? <p className="px-4 py-5 text-center text-xs text-amber-700">{error}</p> : recentNotifications.length ? <div className="min-h-0 divide-y divide-stone-100 overflow-y-auto overscroll-contain">{recentNotifications.map((notification) => <NotificationItem key={notification.id} compact notification={notification} onOpen={openNotification} />)}</div> : <p className="px-4 py-5 text-center text-xs text-stone-500">No tienes notificaciones.</p>}
        {notifications.length > 3 && <Link to="/notifications" onClick={() => setOpen(false)} className="shrink-0 border-t border-stone-100 px-3 py-2.5 text-center text-xs font-semibold text-[#7a2638] transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7a2638]/30">Ver todas</Link>}
      </div>}
    </div>
  )
}
