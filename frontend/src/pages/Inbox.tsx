import React, { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Clock3, Loader2, Mail, ShieldAlert, Sparkles } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Button from '../components/Button'
import Card from '../components/Card'
import Toast from '../components/Toast'
import {
  handleProjectJoinRequest,
  listMyJoinRequests,
  listProjectJoinRequests,
  listProjects,
  type JoinRequest,
  type Project,
  type ProjectJoinRequest
} from '../api/projects'
import { listNotifications, markAllNotificationsRead, markNotificationRead, type Notification } from '../api/notifications'
import { useAuthStore } from '../store/auth'
import { motion } from 'framer-motion'

type AdminProjectRequests = {
  project: Project
  requests: ProjectJoinRequest[]
}

type ToastState = {
  message: string
  type: 'success' | 'error' | 'info'
}

function formatTimeAgo(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hours ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} days ago`
}

function initialsForName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
}

export default function InboxPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null)
  const [pendingJoinRequests, setPendingJoinRequests] = useState<AdminProjectRequests[]>([])

  const projectsQuery = useQuery(['inbox', 'projects'], listProjects, {
    enabled: Boolean(user)
  })

  const notificationsQuery = useQuery<Notification[]>(['inbox', 'notifications'], listNotifications, {
    enabled: Boolean(user)
  })

  const myJoinRequestsQuery = useQuery<JoinRequest[]>(['inbox', 'my-join-requests'], listMyJoinRequests, {
    enabled: Boolean(user)
  })

  const adminProjects = useMemo(() => {
    return (projectsQuery.data ?? []).filter((project) => {
      if (!user) return false
      if (project.ownerId === user.id) return true
      return project.members?.some((member) => member.userId === user.id && member.role === 'ADMIN') ?? false
    })
  }, [projectsQuery.data, user])

  useQuery<AdminProjectRequests[]>(
    ['inbox', 'admin-join-requests', adminProjects.map((project) => project.id).join(',')],
    async () => {
      const responses = await Promise.all(
        adminProjects.map(async (project) => ({
          project,
          requests: await listProjectJoinRequests(project.id)
        }))
      )

      return responses.map((entry) => ({
        project: entry.project,
        requests: entry.requests.filter((request) => request.status === 'PENDING')
      }))
    },
    {
      enabled: adminProjects.length > 0,
      onSuccess: (data) => setPendingJoinRequests(data)
    }
  )

  const handleRequestMutation = useMutation(
    async (variables: { projectId: string; requestId: string; action: 'approve' | 'reject' }) => {
      return handleProjectJoinRequest(variables.projectId, variables.requestId, { action: variables.action })
    },
    {
      onSuccess: async (_, variables) => {
        setPendingJoinRequests((current) =>
          current
            .map((projectGroup) => ({
              ...projectGroup,
              requests: projectGroup.requests.filter((request) => request.id !== variables.requestId)
            }))
            .filter((projectGroup) => projectGroup.requests.length > 0)
        )
        setToast({
          message: variables.action === 'approve' ? 'Join request approved' : 'Join request rejected',
          type: 'success'
        })
        setRejectingRequestId(null)
        await queryClient.invalidateQueries(['notifications', 'count'])
        await queryClient.invalidateQueries(['notifications', 'list'])
        await queryClient.invalidateQueries(['inbox', 'my-join-requests'])
      }
    }
  )

  async function handleApprove(projectId: string, requestId: string) {
    await handleRequestMutation.mutateAsync({ projectId, requestId, action: 'approve' })
  }

  async function handleConfirmReject(projectId: string, requestId: string) {
    await handleRequestMutation.mutateAsync({ projectId, requestId, action: 'reject' })
  }

  const notificationAction = useMutation(markNotificationRead, {
    onSuccess: async () => {
      await queryClient.invalidateQueries(['inbox', 'notifications'])
      await queryClient.invalidateQueries(['notifications', 'count'])
      await queryClient.invalidateQueries(['notifications', 'list'])
    }
  })

  return (
    <div className="min-h-screen flex bg-black flex-col md:flex-row text-white selection:bg-white selection:text-black">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full min-h-screen">
        <Topbar />
        <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="p-[40px_60px] flex-1 overflow-y-auto">
          <div className="flex items-start justify-between mb-10 border-b border-[rgba(255,255,255,0.05)] pb-6 gap-4">
            <div>
              <h1 className="text-[28px] font-light tracking-tight text-white">Inbox</h1>
              <p className="text-[13px] text-[#666] mt-1">Review join requests and keep an eye on new activity.</p>
            </div>
            <Button
              variant="ghost"
              onClick={async () => {
                await markAllNotificationsRead()
                await queryClient.invalidateQueries(['notifications', 'count'])
                await queryClient.invalidateQueries(['notifications', 'list'])
                await queryClient.invalidateQueries(['inbox', 'notifications'])
                setToast({ message: 'All notifications marked as read', type: 'info' })
              }}
            >
              Mark all read
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-[12px] uppercase tracking-[0.2em] text-[#666]">Admin requests</div>
                    <h2 className="text-[18px] font-medium text-white mt-1">Join requests for your projects</h2>
                  </div>
                  <div className="text-[12px] text-[#888]">{pendingJoinRequests.reduce((sum, entry) => sum + entry.requests.length, 0)} pending</div>
                </div>

                {pendingJoinRequests.length > 0 ? (
                  <div className="space-y-4">
                    {pendingJoinRequests.map((entry) =>
                      entry.requests.map((request) => (
                        <motion.div
                          key={request.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[12px] font-medium text-white shrink-0">
                                {request.user.avatarInitials || initialsForName(request.user.name)}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[15px] text-white font-medium truncate">
                                  {request.user.name} wants to join
                                </div>
                                <div className="text-[13px] text-[#888] mt-1 truncate">{entry.project.name}</div>
                                <div className="text-[12px] text-[#666] mt-2 flex items-center gap-2">
                                  <Clock3 size={12} />
                                  {formatTimeAgo(request.createdAt)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="ghost"
                                className="border-transparent text-[#b5b5b5] hover:text-white hover:bg-[rgba(255,255,255,0.04)]"
                                onClick={() => setRejectingRequestId((current) => (current === request.id ? null : request.id))}
                              >
                                Reject
                              </Button>
                              <Button
                                className="bg-emerald-500 hover:bg-emerald-400 text-black shadow-none hover:shadow-none"
                                onClick={() => handleApprove(entry.project.id, request.id)}
                                loading={handleRequestMutation.isLoading && handleRequestMutation.variables?.requestId === request.id && handleRequestMutation.variables.action === 'approve'}
                              >
                                <Check size={14} className="mr-2" />
                                Approve
                              </Button>
                            </div>
                          </div>

                          {rejectingRequestId === request.id ? (
                            <div className="mt-4 flex items-center justify-between rounded-[12px] border border-amber-500/25 bg-amber-500/10 px-3 py-3 text-[13px] text-amber-100 gap-3">
                              <span>Are you sure you want to reject this request?</span>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" onClick={() => setRejectingRequestId(null)}>
                                  Cancel
                                </Button>
                                <Button
                                  className="bg-transparent text-amber-100 border border-amber-400/40 hover:bg-amber-500/20 shadow-none"
                                  onClick={() => handleConfirmReject(entry.project.id, request.id)}
                                  loading={handleRequestMutation.isLoading && handleRequestMutation.variables?.requestId === request.id && handleRequestMutation.variables.action === 'reject'}
                                >
                                  Confirm reject
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </motion.div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 text-[#666] text-[13px] flex flex-col items-center gap-3">
                    <ShieldAlert size={22} className="text-[#444]" />
                    No pending join requests right now.
                  </div>
                )}
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-[12px] uppercase tracking-[0.2em] text-[#666]">My requests</div>
                    <h2 className="text-[18px] font-medium text-white mt-1">Requests you sent</h2>
                  </div>
                  <div className="text-[12px] text-[#888]">{myJoinRequestsQuery.data?.length ?? 0} total</div>
                </div>

                {(myJoinRequestsQuery.data?.length ?? 0) > 0 ? (
                  <div className="space-y-3">
                    {myJoinRequestsQuery.data?.map((request) => (
                      <div key={request.id} className="flex items-center justify-between rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
                        <div>
                          <div className="text-[14px] text-white font-medium">{request.project.name}</div>
                          <div className="text-[12px] text-[#666] mt-1">{request.status}</div>
                        </div>
                        <div className="text-[12px] text-[#888]">{formatTimeAgo(request.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-[#666] text-[13px] flex flex-col items-center gap-3">
                    <Mail size={22} className="text-[#444]" />
                    No join requests submitted yet.
                  </div>
                )}
              </Card>
            </div>

            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[12px] uppercase tracking-[0.2em] text-[#666]">Notifications</div>
                  <h2 className="text-[18px] font-medium text-white mt-1">Recent unread activity</h2>
                </div>
                <Sparkles size={16} className="text-[#888]" />
              </div>

              {notificationsQuery.isLoading ? (
                <div className="py-10 flex items-center justify-center text-[#666] gap-2 text-[13px]">
                  <Loader2 size={14} className="animate-spin" /> Loading notifications
                </div>
              ) : (notificationsQuery.data?.length ?? 0) > 0 ? (
                <div className="space-y-3">
                  {notificationsQuery.data?.map((notification) => (
                    <button
                      key={notification.id}
                      className="w-full text-left rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-3 hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                      onClick={() => notificationAction.mutate(notification.id)}
                    >
                      <div className="text-[14px] font-medium text-white">{notification.title}</div>
                      <div className="text-[13px] text-[#888] mt-1 leading-relaxed">{notification.body}</div>
                      <div className="text-[12px] text-[#666] mt-2">{formatTimeAgo(notification.createdAt)}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-[#666] text-[13px] flex flex-col items-center gap-3">
                  <Mail size={22} className="text-[#444]" />
                  No unread notifications.
                </div>
              )}
            </Card>
          </div>
        </motion.main>
      </div>

      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
    </div>
  )
}
