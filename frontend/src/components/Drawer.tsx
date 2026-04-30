import React from 'react'
import { motion } from 'framer-motion'

export default function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="ml-auto w-full md:w-96 bg-surface border-l border-border overflow-y-auto z-10"
      >
        <div className="sticky top-0 p-4 border-b border-border flex items-center justify-between bg-surface">
          {title ? <div className="font-semibold text-sm md:text-base">{title}</div> : null}
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors font-bold text-xl">
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </motion.div>
    </motion.div>
  )
}
