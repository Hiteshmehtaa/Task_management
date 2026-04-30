import React from 'react'
import Badge from './Badge'

export default function TaskCard({ task }: { task: any }) {
  const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null
  const priorityColor: any = { LOW: 'gray', MEDIUM: 'amber', HIGH: 'rose' }
  const statusColor: any = { TODO: 'gray', IN_PROGRESS: 'violet', REVIEW: 'amber', DONE: 'emerald' }
  return (
    <div className="bg-[rgba(255,255,255,0.02)] border border-border rounded p-3 mb-2 transition-fast card-hover hover:scale-105 hover:shadow-lg">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="font-semibold text-sm line-clamp-2">{task.title}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge color={priorityColor[task.priority]}>{task.priority}</Badge>
        <Badge color={statusColor[task.status]}>{task.status}</Badge>
      </div>
      {due ? <div className="text-xs text-text-secondary mt-2">{due}</div> : null}
    </div>
  )
}

