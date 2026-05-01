import React from 'react'
import Badge from './Badge'
import { useMutation } from '@tanstack/react-query'
import { updateTask } from '../api/tasks'
import { useAuthStore } from '../store/auth'

export default function TaskCard({ task }: { task: any }) {
  const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null
  const priorityColor: any = { LOW: 'gray', MEDIUM: 'amber', HIGH: 'rose' }
  const statusColor: any = { TODO: 'gray', IN_PROGRESS: 'violet', REVIEW: 'amber', DONE: 'emerald' }
  const user = useAuthStore((s) => s.user)

  const canUpdate = user && (user.role === 'ADMIN' || user.id === task.createdById || user.id === task.assigneeId)

  const mutation = useMutation((status: string) => updateTask(task.id, { status }))

  return (
    <div className="bg-[rgba(255,255,255,0.02)] border border-border rounded p-3 mb-2 transition-fast card-hover hover:scale-105 hover:shadow-lg">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="font-semibold text-sm line-clamp-2">{task.title}</div>
        </div>
        {canUpdate ? (
          <select
            className="ml-3 input-base text-[12px]"
            value={task.status}
            onChange={(e) => mutation.mutate(e.target.value)}
            disabled={mutation.isLoading}
          >
            <option value="TODO">To do</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>
        ) : (
          <Badge color={statusColor[task.status]}>{task.status}</Badge>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge color={priorityColor[task.priority]}>{task.priority}</Badge>
        {!canUpdate && <Badge color={statusColor[task.status]}>{task.status}</Badge>}
      </div>
      {due ? <div className="text-xs text-text-secondary mt-2">{due}</div> : null}
    </div>
  )
}

