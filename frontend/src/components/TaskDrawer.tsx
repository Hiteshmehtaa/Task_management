import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTask } from '../api/tasks'
import { createComment, listComments } from '../api/comments'
import Drawer from './Drawer'
import Input from './Input'
import Button from './Button'
import Avatar from './Avatar'
import Badge from './Badge'
const STATUSES = ['TODO','IN_PROGRESS','REVIEW','DONE']
const PRIORITIES = ['LOW','MEDIUM','HIGH']

export default function TaskDrawer({ task, open, onClose, projectMembers }: { task?: any; open: boolean; onClose: () => void; projectMembers?: any[] }) {
  const [comment, setComment] = useState('')
  const qc = useQueryClient()
  const { data: comments, isLoading } = useQuery(['task_comments', task?.id], () => listComments(task!.id), { enabled: open && !!task?.id })
  const updateMut = useMutation((data: any) => updateTask(task?.id, data), {
    onSuccess: () => qc.invalidateQueries(['project'])
  })
  const commentMut = useMutation((data: any) => createComment(task?.id, data), {
    onSuccess: () => {
      qc.invalidateQueries(['task_comments', task?.id])
      setComment('')
    }
  })

  if (!task) return null

  return (
    <Drawer open={open} onClose={onClose} title={task.title}>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-text-secondary">Status</label>
          <select value={task.status} onChange={(e) => updateMut.mutate({ status: e.target.value })} className="w-full px-2 py-1 bg-bg border border-border rounded text-text-primary mt-1">
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-text-secondary">Priority</label>
          <select value={task.priority} onChange={(e) => updateMut.mutate({ priority: e.target.value })} className="w-full px-2 py-1 bg-bg border border-border rounded text-text-primary mt-1">
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-text-secondary">Assignee</label>
          <select value={task.assigneeId || ''} onChange={(e) => updateMut.mutate({ assigneeId: e.target.value || null })} className="w-full px-2 py-1 bg-bg border border-border rounded text-text-primary mt-1">
            <option value="">Unassigned</option>
            {(projectMembers || []).map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="pt-4 border-t border-border">
          <h3 className="font-semibold mb-3">Comments</h3>
          <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
            {isLoading ? <div>Loading...</div> : (comments || []).map((c: any) => (
              <div key={c.id} className="p-2 bg-bg rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar name={c.author.name} size="sm" />
                  <div className="text-sm">{c.author.name}</div>
                </div>
                <div className="text-sm text-text-secondary">{c.content}</div>
              </div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); commentMut.mutate({ content: comment }) }} className="flex gap-2">
            <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." className="flex-1 px-2 py-1 bg-bg border border-border rounded text-text-primary text-sm" />
            <Button type="submit" size="sm">Post</Button>
          </form>
        </div>
      </div>
    </Drawer>
  )
}
