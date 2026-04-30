import React from 'react'
import { useAuthStore } from '../store/auth'
import { logout as apiLogout } from '../api/auth'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, CircleUserRound } from 'lucide-react'

export default function Topbar() {
  const user = useAuthStore(s => s.user)
  const clear = useAuthStore(s => s.clear)
  const nav = useNavigate()

  async function handleLogout() {
    await apiLogout()
    clear()
    nav('/auth/login')
  }

  return (
    <div className="h-16 md:h-18 flex items-center justify-between px-3 md:px-5 border-b border-border/70 bg-[rgba(15,15,19,0.72)] backdrop-blur-md sticky top-0 z-20">
      <div className="hidden md:flex flex-col">
        <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Team Task Manager</div>
        <div className="text-sm text-text-secondary">Organize projects without clutter</div>
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3 rounded-full border border-border bg-surface/80 px-3 py-2 shadow-sm">
        <div className="h-8 w-8 rounded-full bg-[rgba(124,58,237,0.18)] flex items-center justify-center text-primary">
          <CircleUserRound size={18} />
        </div>
        <div className="flex flex-col leading-tight max-w-[140px] md:max-w-none">
          <span className="text-xs md:text-sm text-text-primary truncate">{user?.name || 'Account'}</span>
          <span className="text-[11px] md:text-xs text-text-secondary truncate">{user?.email || 'Signed in'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="ml-2 inline-flex items-center gap-1 text-xs md:text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Sign out <ChevronDown size={14} className="hidden md:block" />
        </button>
      </div>
    </div>
  )
}
