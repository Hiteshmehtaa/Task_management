import React from 'react'
import { motion } from 'framer-motion'

export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ 
        y: -2, 
        borderColor: 'var(--primary)',
        boxShadow: '0 0 0 1px var(--primary), 0 4px 20px var(--primary-glow)' 
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`bg-surface border border-border rounded-[10px] p-6 transition-all duration-200 ${className}`}
    >
      {children}
    </motion.div>
  )
}
