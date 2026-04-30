import React, { useEffect, useState } from 'react'

export default function Toast({ message, type = 'info', duration = 3000 }: { message: string; type?: 'success' | 'error' | 'info'; duration?: number }) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(t)
  }, [visible, duration])
  if (!visible) return null
  const colors: any = { success: 'bg-emerald-500/20 text-emerald-300', error: 'bg-rose-500/20 text-rose-300', info: 'bg-violet-500/20 text-violet-300' }
  return (
    <div className={`fixed bottom-4 right-4 px-4 py-3 rounded border border-border ${colors[type]} z-50`}>
      {message}
    </div>
  )
}
