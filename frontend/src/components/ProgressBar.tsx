import React from 'react'

export default function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
      <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}
