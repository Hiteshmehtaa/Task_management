import React, { useEffect, useState } from 'react'
import { Send, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/auth'
import { getProjectMembers, type ProjectMember } from '../api/projects'
import { createTask } from '../api/tasks'
import Toast from './Toast'

interface TaskDrawerProps {
  open: boolean;
  onClose: () => void;
  projectId?: string;
  projectName?: string | null;
}

export default function TaskDrawer({ open, onClose, projectId, projectName }: TaskDrawerProps) {
  const [assigneeId, setAssigneeId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const { data: members } = useQuery<ProjectMember[]>(['project-members', projectId], () => getProjectMembers(projectId ?? ''), {
    enabled: Boolean(open && projectId)
  })
  const queryClient = useQueryClient()

  const createTaskMutation = useMutation((payload: any) => createTask(payload), {
    onSuccess: async () => {
      await queryClient.invalidateQueries(['project', projectId, 'tasks'])
      await queryClient.invalidateQueries(['notifications', 'count'])
      await queryClient.invalidateQueries(['notifications', 'list'])
      setToast({ message: 'Task created', type: 'success' })
      if (!keepOpen) {
        onClose()
      } else {
        // clear inputs for next task
        setTitle('')
        setDescription('')
        setPriority('MEDIUM')
        setAssigneeId((members && members[0]?.userId) || '')
      }
    },
    onError: (err: any) => {
      setToast({ message: err?.response?.data?.message || 'Failed to create task', type: 'error' })
    }
  })

  useEffect(() => {
    if (!members?.length) return
    setAssigneeId((current) => current || members[0].userId)
  }, [members])

  useEffect(() => {
    if (!open) {
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setAssigneeId('')
    }
  }, [open])

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [keepOpen, setKeepOpen] = useState(false)

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[rgba(0,0,0,0.5)] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-[440px] bg-bg-overlay border-l border-border-default shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0">
        
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[12px] text-text-muted">
                Projects <span className="mx-1">/</span> Redesign 2025 <span className="mx-1">/</span> Task
              </div>
              <button 
                onClick={onClose}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full text-[18px] font-semibold text-text-primary bg-transparent border-none outline-none focus:ring-1 focus:ring-border-violet rounded px-1 -ml-1 transition-colors hover:bg-bg-raised input-base"
            />
            
            <div className="flex items-center gap-2 mt-4">
              <span className="badge-pill badge-progress">In progress</span>
              <span className="badge-pill bg-[rgba(245,158,11,0.10)] text-amber border border-amber-dim">High</span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="px-6 mb-8 flex flex-col">
            {/* Row 1 */}
            <div className="flex items-center min-h-[36px] border-b border-border-subtle group hover:bg-bg-raised transition-colors px-1 -mx-1 rounded-sm cursor-pointer">
              <div className="w-[120px] text-[12px] text-text-muted shrink-0">Assignee</div>
              <select
                className="flex-1 bg-transparent text-[13px] text-text-primary outline-none border-none input-base"
                value={assigneeId}
                onChange={(event) => setAssigneeId(event.target.value)}
              >
                <option value="">Unassigned</option>
                {(members ?? []).map((member) => (
                  <option key={member.id} value={member.userId}>
                    {member.user.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Row 2 */}
            <div className="flex items-center min-h-[36px] border-b border-border-subtle group hover:bg-bg-raised transition-colors px-1 -mx-1 rounded-sm cursor-pointer">
              <div className="w-[120px] text-[12px] text-text-muted shrink-0">Due date</div>
              <div className="text-[13px] text-text-primary">Today</div>
            </div>

            {/* Row 3 */}
            <div className="flex items-center min-h-[36px] border-b border-border-subtle group hover:bg-bg-raised transition-colors px-1 -mx-1 rounded-sm cursor-pointer">
              <div className="w-[120px] text-[12px] text-text-muted shrink-0">Project</div>
              <div className="text-[13px] text-text-primary">{projectName ?? projectId ?? 'Project'}</div>
            </div>

            {/* Row 4 */}
            <div className="flex items-center min-h-[36px] border-b border-border-subtle group hover:bg-bg-raised transition-colors px-1 -mx-1 rounded-sm cursor-pointer">
              <div className="w-[120px] text-[12px] text-text-muted shrink-0">Created by</div>
              <div className="text-[13px] text-text-primary">{useAuthStore.getState().user?.name ?? ''}</div>
            </div>

            {/* Row 5 */}
            <div className="flex items-center min-h-[36px] border-b border-border-subtle group hover:bg-bg-raised transition-colors px-1 -mx-1 rounded-sm cursor-pointer">
              <div className="w-[120px] text-[12px] text-text-muted shrink-0">Priority</div>
              <div className="text-[13px] text-text-primary">
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="bg-transparent text-[13px] text-text-primary outline-none border-none input-base">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="px-6 mb-8">
            <h3 className="heading-section mb-2">Description</h3>
            <textarea 
              className="w-full text-[13px] text-text-secondary bg-transparent border-none outline-none resize-none placeholder:text-text-muted leading-relaxed input-base"
              rows={4}
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Activity / Comments */}
          <div className="px-6 pb-6">
            <h3 className="heading-section mb-4 flex items-center gap-2">
              Comments <span className="bg-bg-raised px-1.5 rounded-full text-text-muted">0</span>
            </h3>

            <div className="flex flex-col gap-5">
              <div className="text-[13px] text-text-muted italic">Comments coming soon...</div>
            </div>
          </div>
        </div>

        {/* Input area fixed at bottom */}
        <div className="p-4 border-t border-border-subtle bg-bg-overlay">
          <div className="flex items-start gap-3">
            <div className="w-[28px] h-[28px] rounded-full bg-violet text-white flex items-center justify-center text-[11px] font-medium shrink-0 mt-1 uppercase">
              {useAuthStore.getState().user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 relative">
              <textarea 
                className="w-full bg-bg-raised border border-border-default rounded-[var(--r-md)] px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-border-violet focus:ring-1 focus:ring-border-violet transition-all resize-none min-h-[40px] input-base"
                placeholder="Write a comment..."
                rows={1}
                disabled
              />
              <button disabled className="absolute right-2 bottom-2 text-text-muted hover:text-text-primary transition-colors p-1 disabled:opacity-50">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        
        {/* Action bar */}
        <div className="p-4 border-t border-border-subtle bg-bg-overlay flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[13px] text-text-muted">
              <input type="checkbox" className="accent-violet" checked={keepOpen} onChange={(e) => setKeepOpen(e.target.checked)} />
              <span>Keep drawer open</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-ghost">Cancel</button>
            <button
              onClick={() => {
                if (!title) return
                createTaskMutation.mutate({ projectId, title, description, assigneeId: assigneeId || undefined, priority })
              }}
              className="btn-primary"
              disabled={createTaskMutation.isLoading}
            >
              {createTaskMutation.isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
        {toast ? <Toast message={toast.message} type={toast.type} /> : null}
      </div>
    </div>
  );
}
