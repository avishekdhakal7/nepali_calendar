import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import TeacherDashboard from './TeacherDashboardClient'
import type { AuthUser } from '@/types/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

export default async function TeacherDashboardPage() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  console.log('[Teacher SSR] Cookie present:', cookieHeader.includes('access_token'))
  console.log('[Teacher SSR] Cookie (first 80):', cookieHeader.substring(0, 80))

  if (!cookieHeader.includes('access_token')) {
    console.error('[Teacher SSR] FAIL: No access_token cookie')
    redirect('/login')
  }

  const res = await fetch(`${API_BASE}/auth/me/`, {
    headers: { Cookie: cookieHeader },
    cache: 'no-store',
  })

  console.log('[Teacher SSR] /auth/me/ status:', res.status)

  if (res.status === 401) {
    const body = await res.text()
    console.error('[Teacher SSR] FAIL: 401 from /auth/me/', body.substring(0, 200))
    redirect('/login')
  }

  const serverUser: AuthUser = await res.json()
  console.log('[Teacher SSR] /auth/me/ response:', JSON.stringify(serverUser))
  console.log('[Teacher SSR] roles:', serverUser?.roles)
  console.log('[Teacher SSR] includes teacher?:', serverUser?.roles?.includes('teacher'))

  if (!serverUser || !serverUser.roles?.includes('teacher')) {
    console.error('[Teacher SSR] FAIL: Not a teacher or no user. roles=', serverUser?.roles)
    redirect('/login')
  }

  console.log('[Teacher SSR] PASS: Rendering teacher dashboard')
  return <TeacherDashboard serverUser={serverUser} />
}
