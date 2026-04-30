import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const items = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/settings', label: 'Settings' }
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-surface border border-border shadow-lg shadow-black/20"
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      {/* Overlay for mobile */}
      {open && <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : -256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="md:translate-x-0 fixed md:relative w-56 lg:w-60 bg-surface/95 backdrop-blur-md border-r border-border min-h-screen p-3 flex flex-col z-30"
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="mb-6 rounded-2xl border border-border bg-[rgba(255,255,255,0.02)] p-3 lg:p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-text-secondary">Workspace</div>
          <div className="mt-2 text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primaryHover bg-clip-text text-transparent">
            Task Hub
          </div>
          <p className="mt-2 text-xs text-text-secondary leading-5">
            Minimal task management for small teams.
          </p>
        </motion.div>
        <nav className="space-y-1 flex-1">
          {items.map((i, idx) => (
            <NavLink
              key={i.to}
              to={i.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `block px-3 py-2 rounded-md transition-all relative overflow-hidden text-sm md:text-base ${
                isActive ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {({ isActive }) => (
                <>
                  {isActive && <motion.div layoutId="nav-active" className="absolute inset-0 bg-primary rounded-md" initial={false} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />}
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className="relative z-10">
                    {i.label}
                  </motion.span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 rounded-2xl border border-border bg-[rgba(255,255,255,0.02)] p-3 lg:p-4 text-xs text-text-secondary">
          <div className="font-medium text-text-primary">Tip</div>
          <div className="mt-1 leading-5">Create a project first, then tasks will make the dashboard come alive.</div>
        </div>
      </motion.aside>
    </>
  )
}
