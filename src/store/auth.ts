import { create } from 'zustand'
import type { AuthUser } from '@/types/auth'

interface AuthState {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  setUserLogo: (logoUrl: string | undefined) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAuthenticated: false,
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  setUserLogo: (logoUrl) => set((state) => ({
    user: state.user ? { ...state.user, logo: logoUrl } : null,
  })),
  logout: () => set({ user: null, isAuthenticated: false, accessToken: null }),
}))
