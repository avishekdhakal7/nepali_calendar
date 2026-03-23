'use client'

import { useEffect, useState, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, accessToken } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage
    startTransition(() => setHydrated(true))
  }, [])

  useEffect(() => {
    if (!hydrated) return

    if (!isAuthenticated || !accessToken) {
      router.push('/login')
    }
  }, [hydrated, isAuthenticated, accessToken, router])

  // Show nothing until hydrated and auth confirmed
  if (!hydrated || !isAuthenticated || !accessToken) {
    return null
  }

  return <>{children}</>
}
