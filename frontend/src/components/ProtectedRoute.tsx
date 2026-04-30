import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = useAuthStore(s => s.accessToken)
  const hasHydrated = useAuthStore.persist.hasHydrated()

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-text-secondary">
        Loading session...
      </div>
    )
  }

  if (!token) return <Navigate to="/auth/login" replace />
  return children
}
