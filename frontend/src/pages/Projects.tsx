import React, { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Check, Copy, Eye, EyeOff, KeyRound, Link2, Loader2, Plus } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Button from '../components/Button'
import Toast from '../components/Toast'
import { createProject, joinProject, listProjects, type Project, type ProjectCreateResponse } from '../api/projects'

function maskSecret(value: string): string {
  if (value.length <= 4) return '••••'
  return `${'•'.repeat(Math.max(4, value.length - 4))}${value.slice(-4)}`
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery<Project[]>(['projects'], listProjects)
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [createdProject, setCreatedProject] = useState<ProjectCreateResponse | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const [copiedProjectKey, setCopiedProjectKey] = useState(false)
  const [copiedSecretKey, setCopiedSecretKey] = useState(false)
  const [joinProjectKey, setJoinProjectKey] = useState('')
  const [joinSecretKey, setJoinSecretKey] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joinShake, setJoinShake] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    if (!copiedProjectKey) return
    const timer = window.setTimeout(() => setCopiedProjectKey(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copiedProjectKey])

  useEffect(() => {
    if (!copiedSecretKey) return
    const timer = window.setTimeout(() => setCopiedSecretKey(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copiedSecretKey])

  const create = useMutation(createProject, {
    onSuccess: async (project) => {
      setCreatedProject(project)
      setCreateOpen(true)
      await queryClient.invalidateQueries(['projects'])
    }
  })

  const join = useMutation(joinProject, {
    onSuccess: async (result) => {
      setToast({ message: result.message, type: 'success' })
      setJoinOpen(false)
      setJoinProjectKey('')
      setJoinSecretKey('')
      setJoinError('')
      await queryClient.invalidateQueries(['projects'])
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const message = (error.response?.data as { error?: string })?.error ?? error.message
        if (message === 'Already a member') {
          setToast({ message: "You're already in this project", type: 'info' })
          return
        }
        if (message === 'Request already sent') {
          setToast({ message: 'You already have a pending request', type: 'info' })
          return
        }
        if (message === 'Invalid project key' || message === 'Project not found' || message === 'You own this project') {
          setJoinError(message)
          setJoinShake(true)
          window.setTimeout(() => setJoinShake(false), 400)
          return
        }
        setJoinError(message)
        setJoinShake(true)
        window.setTimeout(() => setJoinShake(false), 400)
        return
      }

      setJoinError('Unable to send join request')
      setJoinShake(true)
      window.setTimeout(() => setJoinShake(false), 400)
    }
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()

    if (createdProject) {
      setCreateOpen(false)
      setName('')
      setDescription('')
      setCreatedProject(null)
      setShowSecret(false)
      navigate(`/projects/${createdProject.id}`)
      return
    }

    await create.mutateAsync({ name, description: description || undefined })
  }

  async function handleCopy(value: string, mode: 'project' | 'secret') {
    await navigator.clipboard.writeText(value)
    if (mode === 'project') setCopiedProjectKey(true)
    if (mode === 'secret') setCopiedSecretKey(true)
  }

  function closeCreateModal() {
    setCreateOpen(false)
    setName('')
    setDescription('')
    setCreatedProject(null)
    setShowSecret(false)
    setCopiedProjectKey(false)
    setCopiedSecretKey(false)
  }

  const createModalTitle = useMemo(() => (createdProject ? 'Project created' : 'Create project'), [createdProject])

  return (
    <div className="min-h-screen flex bg-black flex-col md:flex-row text-white selection:bg-white selection:text-black">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full min-h-screen">
        <Topbar />
        <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="px-6 lg:px-8 py-6 lg:py-8 flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b border-[rgba(255,255,255,0.05)] pb-6">
            <div>
              <h1 className="text-[28px] font-medium tracking-tight text-white">Projects</h1>
              <p className="text-[13px] text-[#777] mt-1 max-w-xl">Create a project or join one. The list below shows only the essentials: name, key, members, and task count.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setJoinOpen(true)}>
                <Link2 size={14} className="mr-2" />
                Join Project
              </Button>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus size={14} className="mr-2" />
                New Project
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {isLoading ? Array.from({ length: 6 }).map((_, index) => (
              <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
                <div className="bg-[rgba(255,255,255,0.02)] rounded-[18px] h-[148px] animate-pulse border border-[rgba(255,255,255,0.05)]" />
              </motion.div>
            )) : data?.map((project, index) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, ease: 'easeOut', duration: 0.4 }}>
                <Link to={`/projects/${project.id}`}>
                  <div className="group relative flex flex-col h-full bg-transparent border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.18)] rounded-[18px] p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-[rgba(255,255,255,0.02)]">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] uppercase tracking-[0.24em] text-[#666]">{project.projectKey}</span>
                      <span className="text-[11px] text-[#888]">{project.members?.length ?? 0} members</span>
                    </div>

                    <div className="flex flex-col gap-2 mb-8">
                      <div className="text-[16px] font-medium text-white line-clamp-1">{project.name}</div>
                      <div className="text-[13px] text-[#777] line-clamp-2 leading-[1.6] group-hover:text-[#999] transition-colors duration-300">{project.description || 'No description provided.'}</div>
                    </div>

                    <div className="mt-auto flex items-center justify-between text-[12px] text-[#777] border-t border-[rgba(255,255,255,0.05)] pt-4">
                      <span>{project.tasks?.length || 0} tasks</span>
                      <span>Open project</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.main>
      </div>

      <Modal open={createOpen} onClose={closeCreateModal} title={createModalTitle}>
        {!createdProject ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} />
            <Input label="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={closeCreateModal}>Cancel</Button>
              <Button type="submit" loading={create.isLoading}>{create.isLoading ? 'Creating' : 'Create'}</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-emerald-500/15 text-emerald-300 p-2">
                  <Check size={16} />
                </div>
                <div>
                  <div className="text-[16px] font-medium text-white">Project created successfully!</div>
                  <div className="text-[13px] text-[#888] mt-1">Share these credentials with your team members so they can request to join.</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-[12px] uppercase tracking-[0.2em] text-[#666] mb-2">Project ID</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-black/40 px-4 py-3 text-[14px] text-white font-medium">{createdProject.projectKey}</div>
                  <Button variant="ghost" onClick={() => handleCopy(createdProject.projectKey, 'project')}>
                    {copiedProjectKey ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
                    {copiedProjectKey ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div>
                <div className="text-[12px] uppercase tracking-[0.2em] text-[#666] mb-2">Secret Key</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-black/40 px-4 py-3 text-[14px] text-white font-medium tracking-[0.12em]">
                    {showSecret ? createdProject.secretKey : maskSecret(createdProject.secretKey)}
                  </div>
                  <Button variant="ghost" onClick={() => setShowSecret((current) => !current)}>
                    {showSecret ? <EyeOff size={14} className="mr-2" /> : <Eye size={14} className="mr-2" />}
                    {showSecret ? 'Hide' : 'Show'}
                  </Button>
                  <Button variant="ghost" onClick={() => handleCopy(createdProject.secretKey, 'secret')}>
                    {copiedSecretKey ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
                    {copiedSecretKey ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="rounded-[10px] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-200">
                Save this key now. It will not be shown again.
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={() => {
                setCreateOpen(false)
                setName('')
                setDescription('')
                setCreatedProject(null)
                setShowSecret(false)
                navigate(`/projects/${createdProject.id}`)
              }}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={joinOpen} onClose={() => {
        setJoinOpen(false)
        setJoinProjectKey('')
        setJoinSecretKey('')
        setJoinError('')
        setJoinShake(false)
      }} title="Join a project">
        <form onSubmit={async (event) => {
          event.preventDefault()
          await join.mutateAsync({ projectKey: joinProjectKey, secretKey: joinSecretKey })
        }} className={`space-y-4 ${joinShake ? 'animate-[shake_0.35s_ease-in-out]' : ''}`}>
          <Input
            label="Project ID"
            value={joinProjectKey}
            onChange={(event) => {
              setJoinProjectKey(event.target.value.toUpperCase())
              setJoinError('')
            }}
            placeholder="Enter project ID (TF-XXXX)"
            className={joinError ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}
          />
          <Input
            label="Secret Key"
            type="password"
            value={joinSecretKey}
            onChange={(event) => {
              setJoinSecretKey(event.target.value)
              setJoinError('')
            }}
            placeholder="Enter secret key"
            className={joinError ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}
          />
          {joinError ? <div className="text-[13px] text-rose-300">{joinError}</div> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => {
              setJoinOpen(false)
              setJoinProjectKey('')
              setJoinSecretKey('')
              setJoinError('')
            }}>
              Cancel
            </Button>
            <Button type="submit" loading={join.isLoading}>
              {join.isLoading ? <Loader2 size={14} className="mr-2 animate-spin" /> : null}
              Send join request
            </Button>
          </div>
        </form>
      </Modal>

      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
    </div>
  )
}
