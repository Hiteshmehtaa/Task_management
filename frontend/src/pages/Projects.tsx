import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listProjects, createProject } from '../api/projects'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Button from '../components/Button'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ProjectsPage() {
  const { data, isLoading } = useQuery(['projects'], listProjects)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const qc = useQueryClient()
  const create = useMutation(createProject, { onSuccess: ()=> qc.invalidateQueries(['projects']) })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await create.mutateAsync({ name, description: desc })
    setOpen(false); setName(''); setDesc('')
  }

  return (
    <div className="min-h-screen flex bg-bg flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full">
        <Topbar />
        <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-3 md:p-6 flex-1">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
            <h1 className="text-xl md:text-2xl font-bold">Projects</h1>
            <Button onClick={()=>setOpen(true)}>New</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {isLoading ? Array.from({length:6}).map((_,i)=>(<motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.05 }}><Card><div className="h-20 md:h-24 bg-[rgba(255,255,255,0.02)] animate-pulse"/></Card></motion.div>)) : data?.map((p:any, i:number)=> (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.05 }}>
                <Link to={`/projects/${p.id}`}>
                  <Card>
                    <div className="flex flex-col gap-2">
                      <div className="font-semibold text-sm md:text-base line-clamp-1">{p.name}</div>
                      <div className="text-xs md:text-sm text-text-secondary line-clamp-2">{p.description || 'No description'}</div>
                      <div className="text-xs text-text-secondary pt-2 border-t border-border">{p.tasks?.length || 0} tasks</div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.main>
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title="Create project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" value={name} onChange={(e)=>setName(e.target.value)} />
          <Input label="Description" value={desc} onChange={(e)=>setDesc(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
