import React from 'react'
import { useQuery } from '@tanstack/react-query'
import API from '../api/axios'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'
import Skeleton from '../components/Skeleton'
import Button from '../components/Button'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { ArrowRight, CheckCircle2, Clock3, Plus, Sparkles, TriangleAlert, FolderKanban, ListTodo, BarChart3 } from 'lucide-react'

async function fetchDashboard() {
  const { data } = await API.get('/dashboard')
  return data
}

function StatCard({ title, value, delay }: { title: string; value: any; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay || 0 }}
      whileHover={{ y: -2 }}
      className="bg-surface border border-border rounded-2xl p-4 md:p-5 transition-all shadow-[0_1px_0_rgba(255,255,255,0.02)_inset]"
    >
      <div className="text-xs md:text-sm text-text-secondary uppercase tracking-[0.18em]">{title}</div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (delay || 0) + 0.15 }} className="text-2xl md:text-3xl font-semibold mt-3">
        {value === '...' ? <Skeleton width="w-16" height="h-6" /> : value}
      </motion.div>
    </motion.div>
  )
}

export default function Dashboard() {
  const nav = useNavigate()
  const { data, isLoading, isError, error } = useQuery(['dashboard'], fetchDashboard, {
    retry: false,
    refetchOnWindowFocus: false
  })

  const message = error instanceof Error ? error.message : 'Unable to load dashboard'

  if (isError) {
    return (
      <div className="min-h-screen flex bg-bg flex-col md:flex-row">
        <Sidebar />
        <div className="flex-1 flex flex-col w-full">
          <Topbar />
          <main className="p-3 md:p-6 flex-1 flex items-center justify-center">
            <div className="max-w-md w-full bg-surface border border-border rounded p-6 text-center">
              <div className="text-xl font-semibold mb-2">Session issue</div>
              <p className="text-sm text-text-secondary mb-6">
                {message.includes('401')
                  ? 'Your session is not available right now. Please sign in again.'
                  : 'The dashboard could not be loaded.'}
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => nav('/auth/login')}>Go to sign in</Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const projectCount = data?.projectCount ?? 0
  const myTasks = data?.myTasks ?? []
  const overdueCount = data?.overdueCount ?? 0
  const activity = data?.recentActivity ?? []
  const tasksByStatus = data?.tasksByStatus ?? {}
  const hasProjects = projectCount > 0
  const activeTasks = myTasks.filter((task: any) => task.status !== 'DONE').length
  const doneCount = tasksByStatus.DONE ?? 0
  const todoCount = tasksByStatus.TODO ?? 0
  const inProgressCount = tasksByStatus.IN_PROGRESS ?? 0
  const reviewCount = tasksByStatus.REVIEW ?? 0
  const chartData = Object.entries(tasksByStatus).map(([name, value]) => ({ name, value }))

  return (
    <div className="min-h-screen flex bg-bg flex-col md:flex-row relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_25%)]" />
      <Sidebar />
      <div className="flex-1 flex flex-col w-full">
        <Topbar />
        <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-3 md:p-5 xl:p-6 flex-1 relative z-10">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 rounded-3xl border border-border bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(22,22,29,0.96))] p-5 md:p-6 shadow-2xl shadow-black/10"
          >
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-text-secondary">
                  <Sparkles size={13} className="text-violet-300" /> Workspace overview
                </div>
                <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
                  Welcome back, {data?.userName || 'there'}.
                </h1>
                <p className="mt-3 max-w-2xl text-sm md:text-base leading-7 text-text-secondary">
                  Your team tasks, project health, and recent updates are all in one place. Everything is laid out to stay calm, readable, and fast on every screen.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="ghost" onClick={() => nav('/projects')} className="border-white/10 bg-white/5 hover:bg-white/10">
                  View projects <ArrowRight size={16} className="ml-2" />
                </Button>
                <Button onClick={() => nav('/projects')}>
                  <Plus size={16} className="mr-2" /> New task
                </Button>
              </div>
            </div>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-6">
            <StatCard title="Projects" value={isLoading ? '...' : projectCount} delay={0} />
            <StatCard title="Active Tasks" value={isLoading ? '...' : activeTasks} delay={0.08} />
            <StatCard title="Overdue" value={isLoading ? '...' : overdueCount} delay={0.16} />
            <StatCard title="Completed" value={isLoading ? '...' : doneCount} delay={0.24} />
          </motion.div>

          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.35 }}>
              <Card>
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="text-sm text-text-secondary uppercase tracking-[0.2em]">Task distribution</div>
                    <h2 className="mt-1 text-xl font-semibold">Status breakdown</h2>
                  </div>
                  <Badge color={overdueCount > 0 ? 'rose' : 'emerald'}>
                    {overdueCount > 0 ? `${overdueCount} overdue` : 'All clear'}
                  </Badge>
                </div>

                {chartData.length > 0 ? (
                  <div className="h-72 w-full">
                    <ResponsiveContainer>
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#8B8A99" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#8B8A99" tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            background: '#16161D',
                            border: '1px solid #2A2A35',
                            borderRadius: '12px',
                            color: '#F1F0F4'
                          }}
                          labelStyle={{ color: '#8B8A99' }}
                        />
                        <Bar dataKey="value" fill="#7C3AED" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 rounded-2xl border border-dashed border-border bg-[rgba(255,255,255,0.02)] flex flex-col items-center justify-center text-center px-6">
                    <FolderKanban size={40} className="text-text-secondary mb-3" />
                    <h3 className="text-lg font-semibold">No project data yet</h3>
                    <p className="mt-2 text-sm text-text-secondary max-w-md">
                      Create your first project and task to see the dashboard come alive.
                    </p>
                    <Button className="mt-5" onClick={() => nav('/projects')}>
                      <Plus size={16} className="mr-2" /> Create project
                    </Button>
                  </div>
                )}
              </Card>
            </motion.section>

            <div className="space-y-4">
              <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.42 }}>
                <Card>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm text-text-secondary uppercase tracking-[0.2em]">Quick stats</div>
                      <h2 className="mt-1 text-xl font-semibold">Focus panel</h2>
                    </div>
                    <BarChart3 size={18} className="text-primary" />
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      { label: 'To do', value: todoCount, tone: 'gray' as const },
                      { label: 'In progress', value: inProgressCount, tone: 'violet' as const },
                      { label: 'Review', value: reviewCount, tone: 'amber' as const },
                      { label: 'Done', value: doneCount, tone: 'emerald' as const }
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-[rgba(255,255,255,0.02)] px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                          <span className="text-sm text-text-secondary">{row.label}</span>
                        </div>
                        <Badge color={row.tone}>{row.value}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.section>

              <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.5 }}>
                <Card>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="text-sm text-text-secondary uppercase tracking-[0.2em]">Recent activity</div>
                      <h2 className="mt-1 text-xl font-semibold">Latest updates</h2>
                    </div>
                    <Clock3 size={18} className="text-text-secondary" />
                  </div>

                  {activity.length > 0 ? (
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {activity.slice(0, 6).map((item: any) => (
                        <div key={`${item.type}-${item.data.id}`} className="flex items-start gap-3 rounded-2xl border border-border bg-[rgba(255,255,255,0.02)] p-3">
                          <div className="mt-1">
                            {item.type === 'task' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <ListTodo size={18} className="text-primary" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-text-primary truncate">
                              {item.type === 'task' ? item.data.title : item.data.task?.title || 'Comment added'}
                            </div>
                            <div className="mt-1 text-xs text-text-secondary truncate">
                              {item.type === 'task'
                                ? `Created by ${item.data.createdBy?.name || 'someone on the team'}`
                                : `${item.data.author?.name || 'Someone'} commented`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-[rgba(255,255,255,0.02)] p-5 text-center">
                      <TriangleAlert size={28} className="mx-auto mb-3 text-text-secondary" />
                      <div className="text-sm text-text-secondary">No recent activity yet.</div>
                    </div>
                  )}
                </Card>
              </motion.section>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  )
}
