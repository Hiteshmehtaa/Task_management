import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useAuthStore } from '../store/auth'
import { motion } from 'framer-motion'

export default function Settings() {
  const user = useAuthStore(s => s.user)

  return (
    <div className="min-h-screen flex bg-bg flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full">
        <Topbar />
        <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-3 md:p-6 flex-1">
          <h1 className="text-xl md:text-2xl mb-6 font-bold">Settings</h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-surface border border-border rounded p-3 md:p-4 max-w-md">
            <div className="mb-4">
              <label className="text-xs md:text-sm text-text-secondary font-medium">Name</label>
              <input type="text" defaultValue={user?.name} className="w-full px-3 py-2 bg-bg border border-border rounded text-text-primary mt-1 text-sm" />
            </div>
            <div className="mb-4">
              <label className="text-xs md:text-sm text-text-secondary font-medium">Email</label>
              <input type="email" defaultValue={user?.email} className="w-full px-3 py-2 bg-bg border border-border rounded text-text-primary mt-1 text-sm" />
            </div>
          </motion.div>
        </motion.main>
      </div>
    </div>
  )
}
