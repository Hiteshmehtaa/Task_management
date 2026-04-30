import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getProject } from '../api/projects'
import { createTask, updateTask } from '../api/tasks'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import TaskCard from '../components/TaskCard'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Button from '../components/Button'
import TaskDrawer from '../components/TaskDrawer'
import { motion } from 'framer-motion'

const STATUSES = ['TODO','IN_PROGRESS','REVIEW','DONE']

function groupTasks(tasks: any[] = []) {
  const map: Record<string, any[]> = { TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [] }
  tasks.forEach((task) => {
    if (map[task.status]) {
      map[task.status].push(task)
    }
  })
  return map
}

export default function ProjectDetail() {
  const { id } = useParams()
  const { data, isLoading, isError } = useQuery(['project', id], () => getProject(id!), {
    enabled: !!id,
    retry: false
  })
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState('')
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const tasksByStatus = groupTasks(data?.tasks || [])

  async function handleAdd(status:string) {
    await createTask({ title, projectId: id, assigneeId: assignee || null, status, priority: 'MEDIUM' })
    await qc.invalidateQueries(['project', id])
    setOpen(false); setTitle(''); setAssignee('')
  }

  async function handleUpdateTask(taskId: string, payload: any) {
    await updateTask(taskId, payload)
    await qc.invalidateQueries(['project', id])
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-bg">Loading...</div>
  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text-secondary p-6 text-center">
        <div className="max-w-md">
          <div className="text-xl font-semibold text-text-primary mb-2">Project not available</div>
          <p>The project could not be loaded right now. Please go back to Projects and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-bg flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full">
        <Topbar />
        <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-3 md:p-6 flex-1 overflow-x-auto">
          <h1 className="text-xl md:text-2xl mb-4 font-bold">{data.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 min-h-[500px]">
            {STATUSES.map((s, idx)=> (
              <motion.div key={s} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx*0.1, duration: 0.3 }} className="bg-surface border border-border rounded p-3 md:p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-xs md:text-sm">{s.replace('_',' ')}</div>
                  <Button size="sm" onClick={()=>setOpen(true)}>+</Button>
                </div>
                <div className="space-y-2">
                  {(tasksByStatus[s]||[]).map((t:any, taskIdx:number)=> (
                    <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: taskIdx*0.05 }} onClick={()=>{ setSelectedTask(t); setDrawerOpen(true) }} className="cursor-pointer">
                      <TaskCard task={t} />
                    </motion.div>
                  ))}
                  {(tasksByStatus[s] || []).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-[rgba(255,255,255,0.02)] px-3 py-6 text-center text-xs text-text-secondary">
                      No tasks yet
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.main>
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title="Add task">
        <form onSubmit={(e)=>{ e.preventDefault(); handleAdd('TODO') }} className="space-y-4">
          <Input label="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <Input label="Assignee (user id)" value={assignee} onChange={(e)=>setAssignee(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </Modal>

      {selectedTask && drawerOpen ? (
        <TaskDrawer task={selectedTask} open={drawerOpen} onClose={()=>setDrawerOpen(false)} projectMembers={data.members?.map((member:any) => member.user)} />
      ) : null}
    </div>
  )
}
