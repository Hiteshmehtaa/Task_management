import React from 'react'
import { motion } from 'framer-motion'

export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="bg-surface border border-border rounded-md p-6 shadow-sm transition-all"
    >
      {children}
    </motion.div>
  )
}
