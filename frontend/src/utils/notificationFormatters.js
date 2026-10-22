import { parseLocalDateTime } from './dateTime.js'

export const NOTIFICATION_LABELS = {
  LOW_STOCK: 'Stock bajo',
  EXPIRING_BATCH: 'Próximo a vencer',
  EXPIRED_BATCH: 'Lote vencido',
  STOCK_ADJUSTMENT: 'Ajuste de stock',
  PURCHASE_REGISTERED: 'Mercadería recibida',
  SALE_CANCELLED: 'Venta anulada',
}

export function notificationLabel(type) {
  return NOTIFICATION_LABELS[type] ?? 'Notificación'
}

export function sortNotificationsNewestFirst(notifications) {
  return [...notifications].sort((left, right) => {
    const leftTime = parseLocalDateTime(left.createdAt)?.getTime() ?? 0
    const rightTime = parseLocalDateTime(right.createdAt)?.getTime() ?? 0
    return rightTime - leftTime
  })
}
