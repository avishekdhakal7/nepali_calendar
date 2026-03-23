import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SchoolAdminDashboardClient from './dashboardClient'
import type { AuthUser } from '@/types/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

export default async function SchoolAdminDashboardPage() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  console.log('[SSR Auth] Cookie header:', cookieHeader.substring(0, 80))

  if (!cookieHeader.includes('access_token')) {
    console.error('[SSR Auth] No access_token in cookies, redirecting to /login')
    redirect('/login')
  }

  const res = await fetch(`${API_BASE}/auth/me/`, {
    headers: { Cookie: cookieHeader },
    cache: 'no-store',
  })

  console.log('[SSR Auth] /auth/me/ status:', res.status)

  if (res.status === 401) {
    const body = await res.text()
    console.error('[SSR Auth] /auth/me/ returned 401, body:', body.substring(0, 200))
    redirect('/login')
  }

  const serverUser: AuthUser = await res.json()
  console.log('[SSR Auth] /auth/me/ response:', JSON.stringify(serverUser))
  console.log('[SSR Auth] is_admin value:', serverUser?.is_admin, 'type:', typeof serverUser?.is_admin)

  if (!serverUser || serverUser.is_admin !== true) {
    console.error('[SSR Auth] is_admin check failed, redirecting to /login')
    redirect('/login')
  }

  console.log('[SSR Auth] Auth passed. Rendering dashboard for:', serverUser.email)
  return <SchoolAdminDashboardClient serverUser={serverUser} />
}
