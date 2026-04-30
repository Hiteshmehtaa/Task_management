import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type User = { id: string; name: string; email: string; role: string }

type AuthState = {
  accessToken?: string | null
  user?: User | null
  setAuth: (token: string | null, user?: User | null) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAuth: (accessToken, user) => set({ accessToken, user }),
      clear: () => set({ accessToken: null, user: null })
    }),
    {
      name: 'team-task-manager-auth'
    }
  )
)
