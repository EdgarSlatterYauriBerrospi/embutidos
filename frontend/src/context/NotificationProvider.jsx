import { useCallback, useEffect, useMemo, useState } from 'react'
import NotificationContext from './NotificationContext.js'
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../services/notificationService.js'

export default function NotificationProvider({ children }) {
  const [state, setState] = useState({ notifications: [], loading: true, error: '' })

  const refresh = useCallback(async () => {
    try {
      const notifications = await getNotifications()
      setState({ notifications, loading: false, error: '' })
    } catch {
      setState((current) => ({
        ...current,
        loading: false,
        error: 'No se pudieron cargar las notificaciones.',
      }))
    }
  }, [])

  useEffect(() => {
    let active = true
    getNotifications()
      .then((notifications) => {
        if (active) setState({ notifications, loading: false, error: '' })
      })
      .catch(() => {
        if (active) {
          setState({ notifications: [], loading: false, error: 'No se pudieron cargar las notificaciones.' })
        }
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const interval = window.setInterval(refresh, 60_000)
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh])

  const markAsRead = useCallback(async (id) => {
    const notification = await markNotificationAsRead(id)
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((item) =>
        String(item.id) === String(id) ? notification : item,
      ),
    }))
  }, [])

  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsAsRead()
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    }))
  }, [])

  const value = useMemo(() => ({
    ...state,
    unreadCount: state.notifications.filter((notification) => !notification.read).length,
    refresh,
    markAsRead,
    markAllAsRead,
  }), [state, refresh, markAsRead, markAllAsRead])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
