import React, { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Check, Copy, Eye, EyeOff, Loader2, RefreshCw, Shield, Users, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import TaskCard from '../components/TaskCard'
import TaskDrawer from '../components/TaskDrawer'
import { useAuthStore } from '../store/auth'
import {
  getProject,
  listProjectJoinRequests,
  regenerateProjectKey,
  removeProjectMember,
  handleProjectJoinRequest,
  type Project,
  type ProjectJoinRequest,
  type ProjectMember,
  type ProjectCreateResponse
} from '../api/projects'
import { listTasks } from '../api/tasks'

type TabKey = 'overview' | 'settings'

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

function maskSecret(value: string): string {
  if (value.length <= 4) return '••••'
  return `${'•'.repeat(Math.max(4, value.length - 4))}${value.slice(-4)}`
}

export default function ProjectDetail() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams()
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [toast, setToast] = useState<ToastState | null>(null)
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null)
  const [regeneratedProject, setRegeneratedProject] = useState<ProjectCreateResponse | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const [copiedProjectKey, setCopiedProjectKey] = useState(false)
  const [copiedSecretKey, setCopiedSecretKey] = useState(false)
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false)
  const [showOnlyMine, setShowOnlyMine] = useState(false)

  const projectQuery = useQuery<Project>(['project', id], () => getProject(id ?? ''), {
    enabled: Boolean(id)
  })

  const tasksQuery = useQuery(['project', id, 'tasks'], () => listTasks(id ?? ''), {
    enabled: Boolean(id)
  })

  const joinRequestsQuery = useQuery<ProjectJoinRequest[]>(['project', id, 'join-requests'], () => listProjectJoinRequests(id ?? ''), {
    enabled: Boolean(id) && Boolean(projectQuery.data)
  })

  const isAdmin = useMemo(() => {
    if (!user || !projectQuery.data) return false
    if (projectQuery.data.ownerId === user.id) return true
    return projectQuery.data.members?.some((member) => member.userId === user.id && member.role === 'ADMIN') ?? false
  }, [projectQuery.data, user])

  const approveMutation = useMutation(
    async (requestId: string) => handleProjectJoinRequest(id ?? '', requestId, { action: 'approve' }),
    {
      onSuccess: async (request) => {
        setToast({ message: `${request.user.name} was approved`, type: 'success' })
        await queryClient.invalidateQueries(['project', id, 'join-requests'])
        await queryClient.invalidateQueries(['notifications', 'count'])
        await queryClient.invalidateQueries(['notifications', 'list'])
        await queryClient.invalidateQueries(['project', id])
      }
    }
  )

  const rejectMutation = useMutation(
    async (requestId: string) => handleProjectJoinRequest(id ?? '', requestId, { action: 'reject' }),
    {
      onSuccess: async () => {
        setToast({ message: 'Join request rejected', type: 'info' })
        setRejectingRequestId(null)
        await queryClient.invalidateQueries(['project', id, 'join-requests'])
        await queryClient.invalidateQueries(['notifications', 'count'])
        await queryClient.invalidateQueries(['notifications', 'list'])
      }
    }
  )

  const removeMemberMutation = useMutation(
    async (userId: string) => removeProjectMember(id ?? '', userId),
    {
      onSuccess: async () => {
        setToast({ message: 'Member removed', type: 'info' })
        await queryClient.invalidateQueries(['project', id])
        await queryClient.invalidateQueries(['projects'])
      }
    }
  )

  const regenerateMutation = useMutation(regenerateProjectKey, {
    onSuccess: async (project) => {
      setRegeneratedProject(project)
      setShowSecret(false)
      await queryClient.invalidateQueries(['project', id])
      await queryClient.invalidateQueries(['projects'])
    }
  })

  async function handleCopy(value: string, mode: 'project' | 'secret') {
    await navigator.clipboard.writeText(value)
    if (mode === 'project') setCopiedProjectKey(true)
    if (mode === 'secret') setCopiedSecretKey(true)
    window.setTimeout(() => {
      setCopiedProjectKey(false)
      setCopiedSecretKey(false)
    }, 2000)
  }

  if (!id) {
    navigate('/projects')
    return null
  }

  const project = projectQuery.data
  const tasks = tasksQuery.data ?? []
  const displayedTasks = showOnlyMine && user ? tasks.filter((t: any) => t.assigneeId === user.id) : tasks
  const joinRequests = (joinRequestsQuery.data ?? []).filter((request) => request.status === 'PENDING')
  const members: ProjectMember[] = project?.members ?? []

  return (
    <div className="min-h-screen bg-black flex page-transition text-white selection:bg-violet-dim selection:text-violet-light">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-black">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-[40px_60px]">
          <div className="flex items-start justify-between gap-4 mb-8 border-b border-[rgba(255,255,255,0.05)] pb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge color="gray">{project?.projectKey ?? 'Project'}</Badge>
                {isAdmin ? <Badge color="emerald">Admin</Badge> : <Badge color="gray">Member</Badge>}
              </div>
              <h1 className="text-[28px] font-light tracking-tight text-white leading-tight mb-2">{project?.name ?? 'Loading project...'}</h1>
              <p className="text-[13px] text-[#666] max-w-[760px]">{project?.description || 'No description provided.'}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" onClick={() => setTaskDrawerOpen(true)}>Add Task</Button>
              <Button variant={activeTab === 'overview' ? 'primary' : 'ghost'} onClick={() => setActiveTab('overview')}>Overview</Button>
              {isAdmin ? <Button variant={activeTab === 'settings' ? 'primary' : 'ghost'} onClick={() => setActiveTab('settings')}>Settings</Button> : null}
            </div>
          </div>

          {activeTab === 'overview' ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[12px] uppercase tracking-[0.2em] text-[#666]">Members</div>
                    <h2 className="text-[18px] font-medium text-white mt-1">Current team</h2>
                  </div>
                  <div className="text-[12px] text-[#888]">{members.length} people</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-3 py-2">
                      <div className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[11px] text-white font-medium">
                        {initialsForName(member.user.name)}
                      </div>
                      <div>
                        <div className="text-[13px] text-white font-medium">{member.user.name}</div>
                        <div className="text-[11px] text-[#888]">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[12px] uppercase tracking-[0.2em] text-[#666]">Tasks</div>
                    <h2 className="text-[18px] font-medium text-white mt-1">Project work</h2>
                  </div>
                  <div className="text-[12px] text-[#888]">{tasks.length} total</div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button className={`text-[12px] px-2 py-1 rounded transition-colors ${!showOnlyMine ? 'bg-[rgba(255,255,255,0.1)] text-white' : 'text-[#888] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'}`} onClick={() => setShowOnlyMine(false)}>All Tasks</button>
                    <button className={`text-[12px] px-2 py-1 rounded transition-colors ${showOnlyMine ? 'bg-[rgba(255,255,255,0.1)] text-white' : 'text-[#888] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'}`} onClick={() => setShowOnlyMine(true)}>My Tasks</button>
                  </div>
                </div>
                <div className="space-y-3">
                  {displayedTasks.length > 0 ? displayedTasks.map((task: any) => (
                    <TaskCard key={task.id} task={task} />
                  )) : (
                    <div className="text-center py-12 text-[#666] text-[13px]">No tasks found.</div>
                  )}
                </div>
              </Card>
            </motion.div>
          ) : null}

          {activeTab === 'settings' && isAdmin ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 xl:grid-cols-[1fr_0.95fr] gap-6">
              <Card>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-[12px] uppercase tracking-[0.2em] text-[#666]">Members</div>
                    <h2 className="text-[18px] font-medium text-white mt-1">Manage team</h2>
                  </div>
                  <Users size={16} className="text-[#888]" />
                </div>

                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[11px] text-white font-medium">
                          {initialsForName(member.user.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] text-white font-medium truncate">{member.user.name}</div>
                          <div className="text-[12px] text-[#888] truncate">{member.user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge color={member.role === 'ADMIN' ? 'violet' : 'gray'}>{member.role}</Badge>
                        {member.userId !== project?.ownerId ? (
                          <Button variant="ghost" className="text-[#c7c7c7] hover:text-white" onClick={() => removeMemberMutation.mutate(member.userId)} loading={removeMemberMutation.isLoading}>
                            Remove
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="space-y-6">
                <Card>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="text-[12px] uppercase tracking-[0.2em] text-[#666]">Pending join requests</div>
                      <h2 className="text-[18px] font-medium text-white mt-1">Review requests</h2>
                    </div>
                    <Shield size={16} className="text-[#888]" />
                  </div>

                  {joinRequests.length > 0 ? (
                    <div className="space-y-3">
                      {joinRequests.map((request) => (
                        <div key={request.id} className="rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[12px] font-medium text-white shrink-0">
                                {request.user.avatarInitials || initialsForName(request.user.name)}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[15px] text-white font-medium truncate">{request.user.name} wants to join</div>
                                <div className="text-[13px] text-[#888] mt-1 truncate">{project?.name}</div>
                                <div className="text-[12px] text-[#666] mt-2">{formatTimeAgo(request.createdAt as string)}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button variant="ghost" className="border-transparent text-[#b5b5b5] hover:text-white hover:bg-[rgba(255,255,255,0.04)]" onClick={() => setRejectingRequestId((current) => (current === request.id ? null : request.id))}>
                                Reject
                              </Button>
                              <Button className="bg-emerald-500 hover:bg-emerald-400 text-black shadow-none hover:shadow-none" onClick={() => approveMutation.mutate(request.id)} loading={approveMutation.isLoading && approveMutation.variables === request.id}>
                                <Check size={14} className="mr-2" />
                                Approve
                              </Button>
                            </div>
                          </div>

                          {rejectingRequestId === request.id ? (
                            <div className="mt-4 flex items-center justify-between rounded-[12px] border border-amber-500/25 bg-amber-500/10 px-3 py-3 text-[13px] text-amber-100 gap-3">
                              <span>Are you sure you want to reject this request?</span>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" onClick={() => setRejectingRequestId(null)}>Cancel</Button>
                                <Button className="bg-transparent text-amber-100 border border-amber-400/40 hover:bg-amber-500/20 shadow-none" onClick={() => rejectMutation.mutate(request.id)} loading={rejectMutation.isLoading && rejectMutation.variables === request.id}>
                                  Confirm reject
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-[#666] text-[13px]">No pending join requests.</div>
                  )}
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="text-[12px] uppercase tracking-[0.2em] text-[#666]">Access key</div>
                      <h2 className="text-[18px] font-medium text-white mt-1">Regenerate secret key</h2>
                    </div>
                    <RefreshCw size={16} className="text-[#888]" />
                  </div>
                  <p className="text-[13px] text-[#888] leading-relaxed mb-4">This will invalidate the old key. Existing members won't be affected.</p>
                  <Button onClick={() => regenerateMutation.mutate(project?.id ?? '')} loading={regenerateMutation.isLoading}>
                    Regenerate secret key
                  </Button>
                </Card>
              </div>
            </motion.div>
          ) : null}
        </main>
      </div>

      <TaskDrawer open={taskDrawerOpen} onClose={() => setTaskDrawerOpen(false)} projectId={project?.id} projectName={project?.name} />

      <Modal open={Boolean(regeneratedProject)} onClose={() => setRegeneratedProject(null)} title="New secret key">
        {regeneratedProject ? (
          <div className="space-y-5">
            <div className="rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-emerald-500/15 text-emerald-300 p-2">
                  <Check size={16} />
                </div>
                <div>
                  <div className="text-[16px] font-medium text-white">Secret key regenerated</div>
                  <div className="text-[13px] text-[#888] mt-1">Copy the new key now. The old one is no longer valid.</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[12px] uppercase tracking-[0.2em] text-[#666] mb-2">Project ID</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-black/40 px-4 py-3 text-[14px] text-white font-medium">{regeneratedProject.projectKey}</div>
                <Button variant="ghost" onClick={() => handleCopy(regeneratedProject.projectKey, 'project')}>
                  {copiedProjectKey ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
                  {copiedProjectKey ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <div>
              <div className="text-[12px] uppercase tracking-[0.2em] text-[#666] mb-2">Secret Key</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-black/40 px-4 py-3 text-[14px] text-white font-medium tracking-[0.12em]">{showSecret ? regeneratedProject.secretKey : maskSecret(regeneratedProject.secretKey)}</div>
                <Button variant="ghost" onClick={() => setShowSecret((current) => !current)}>
                  {showSecret ? <EyeOff size={14} className="mr-2" /> : <Eye size={14} className="mr-2" />}
                  {showSecret ? 'Hide' : 'Show'}
                </Button>
                <Button variant="ghost" onClick={() => handleCopy(regeneratedProject.secretKey, 'secret')}>
                  {copiedSecretKey ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
                  {copiedSecretKey ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setRegeneratedProject(null)}>Done</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
    </div>
  )
}
