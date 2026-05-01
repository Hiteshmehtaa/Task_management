import API from './axios'

export type NotificationType =
  | 'JOIN_REQUEST_RECEIVED'
  | 'JOIN_REQUEST_APPROVED'
  | 'JOIN_REQUEST_REJECTED'
  | 'TASK_ASSIGNED'

export type Notification = {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  metadata?: Record<string, unknown> | null
  createdAt: string
}

export async function listNotifications(): Promise<Notification[]> {
  const res = await API.get('/notifications')
  return res.data
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const res = await API.patch(`/notifications/${id}/read`)
  return res.data
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  const res = await API.patch('/notifications/read-all')
  return res.data
}

export async function getNotificationCount(): Promise<{ unread: number }> {
  const res = await API.get('/notifications/count')
  return res.data
}