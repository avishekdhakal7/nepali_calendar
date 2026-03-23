import { create } from 'zustand'
import type { AuthUser } from '@/types/auth'

interface AuthState {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAuthenticated: false,
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  logout: () => set({ user: null, isAuthenticated: false, accessToken: null }),
}))
