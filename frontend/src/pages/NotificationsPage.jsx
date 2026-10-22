import { useMemo } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import useNotifications from '../hooks/useNotifications.js'
import NotificationItem from '../components/notifications/NotificationItem.jsx'
import { sortNotificationsNewestFirst } from '../utils/notificationFormatters.js'

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, refresh } = useNotifications()
  const orderedNotifications = useMemo(
    () => sortNotificationsNewestFirst(notifications),
    [notifications],
  )

  async function openNotification(notification) {
    if (!notification.read) {
      try { await markAsRead(notification.id) } catch { /* Navigation should still continue. */ }
    }
  }

  async function readAll() {
    try { await markAllAsRead() } catch { /* The provider keeps the current unread state. */ }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight"><Bell size={24} className="text-[#7a2638]" aria-hidden="true" />Notificaciones</h1>
          <p className="mt-1 text-sm text-stone-500">Historial de alertas operativas y movimientos importantes</p>
        </div>
        {unreadCount > 0 && <button type="button" onClick={readAll} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-[#7a2638] transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a2638]/30"><CheckCheck size={17} aria-hidden="true" />Marcar leídas</button>}
      </div>
      {loading ? <p role="status" className="rounded-2xl bg-white p-6 text-sm text-stone-500">Cargando notificaciones…</p> : error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><p>{error}</p><button type="button" onClick={refresh} className="mt-3 font-semibold underline">Reintentar</button></div> : orderedNotifications.length ? <div className="space-y-3">{orderedNotifications.map((notification) => <NotificationItem key={notification.id} notification={notification} onOpen={openNotification} />)}</div> : <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center"><Bell size={28} aria-hidden="true" className="mx-auto text-stone-300" /><p className="mt-3 text-sm text-stone-500">No tienes notificaciones.</p></div>}
    </div>
  )
}
