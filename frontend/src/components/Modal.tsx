import React from 'react'

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: ()=>void; title?: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-surface border border-border rounded p-6 z-10 w-full max-w-lg">
        {title ? <div className="text-lg mb-4">{title}</div> : null}
        {children}
      </div>
    </div>
  )
 }
