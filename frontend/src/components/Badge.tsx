import React from 'react'

export default function Badge({ color = 'gray', children }: { color?: 'violet' | 'emerald' | 'amber' | 'rose' | 'gray'; children: React.ReactNode }) {
  const colors: any = {
    violet: 'bg-violet-500/20 text-violet-300',
    emerald: 'bg-emerald-500/20 text-emerald-300',
    amber: 'bg-amber-500/20 text-amber-300',
    rose: 'bg-rose-500/20 text-rose-300',
    gray: 'bg-[rgba(255,255,255,0.06)] text-text-secondary'
  }
  return <span className={`inline-block px-2 py-1 rounded text-xs ${colors[color]}`}>{children}</span>
}
