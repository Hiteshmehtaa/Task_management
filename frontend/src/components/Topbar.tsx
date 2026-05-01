import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { getNotificationCount, listNotifications, markNotificationRead, type Notification } from '../api/notifications'

function formatTimeAgo(value: string): string {
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

function iconForType(type: Notification['type']): string {
  switch (type) {
    case 'JOIN_REQUEST_RECEIVED':
      return 'JR'
    case 'JOIN_REQUEST_APPROVED':
      return 'JA'
    case 'JOIN_REQUEST_REJECTED':
      return 'RJ'
    case 'TASK_ASSIGNED':
    default:
      return 'TA'
  }
}

export default function Topbar() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const countQuery = useQuery(['notifications', 'count'], getNotificationCount, {
    refetchInterval: 30000
  })
  const notificationsQuery = useQuery(['notifications', 'list'], listNotifications, {
    refetchInterval: 30000
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!dropdownRef.current) return
      if (!dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleNotificationClick(notificationId: string) {
    await markNotificationRead(notificationId)
    await queryClient.invalidateQueries(['notifications', 'count'])
    await queryClient.invalidateQueries(['notifications', 'list'])
  }

  return (
    <header className="h-[72px] flex items-center justify-between px-6 lg:px-8 bg-transparent flex-shrink-0 border-b border-[rgba(255,255,255,0.04)]">
      <div className="min-w-0">
        <h2 className="text-[18px] lg:text-[20px] font-medium text-white tracking-tight leading-tight truncate">
          {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Workspace overview'}
        </h2>
        <span className="text-[12px] text-[#777] mt-1 block truncate">
          {countQuery.data?.unread ?? 0} unread notifications
        </span>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((current) => !current)}
            className="text-[#666] hover:text-white transition-colors relative flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={1.5} />
            {(countQuery.data?.unread ?? 0) > 0 ? (
              <div className="absolute top-[0px] right-[0px] w-[6px] h-[6px] bg-rose-400 rounded-full shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
            ) : null}
          </button>

          {open ? (
            <div className="absolute right-0 top-[calc(100%+12px)] w-[360px] rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[#050505] shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden z-40">
              <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium text-white">Notifications</div>
                  <div className="text-[11px] text-[#666]">Latest project activity</div>
                </div>
                <div className="text-[11px] text-[#888]">
                  {(countQuery.data?.unread ?? 0) > 0 ? `${countQuery.data?.unread} unread` : 'All caught up'}
                </div>
              </div>

              <div className="max-h-[320px] overflow-y-auto">
                {notificationsQuery.isLoading ? (
                  <div className="px-4 py-8 text-center text-[#666] text-[13px] flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Loading notifications
                  </div>
                ) : (notificationsQuery.data?.length ?? 0) > 0 ? (
                  notificationsQuery.data?.slice(0, 5).map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className="w-full text-left px-4 py-3 border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[10px] text-white shrink-0">
                          {iconForType(notification.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[13px] font-medium text-white truncate">{notification.title}</span>
                            <span className="text-[11px] text-[#666] shrink-0">{formatTimeAgo(notification.createdAt)}</span>
                          </div>
                          <div className="text-[12px] text-[#888] mt-1 leading-relaxed line-clamp-2">{notification.body}</div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-[#666] text-[13px]">No unread notifications</div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                <button
                  onClick={async () => {
                    if (!notificationsQuery.data?.length) return
                    await Promise.all(notificationsQuery.data.map((notification) => markNotificationRead(notification.id)))
                    await queryClient.invalidateQueries(['notifications', 'count'])
                    await queryClient.invalidateQueries(['notifications', 'list'])
                  }}
                  className="text-[12px] text-[#888] hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <Check size={14} /> Mark all read
                </button>
                <Link to="/inbox" className="text-[12px] text-white hover:text-[#c7c7c7] transition-colors">
                  View all
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
