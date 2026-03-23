import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import OwnerDashboardClient from './dashboardClient'
import type { AuthUser } from '@/types/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

export default async function OwnerDashboardPage() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  if (!cookieHeader.includes('access_token')) redirect('/login')

  const res = await fetch(`${API_BASE}/auth/me/`, {
    headers: { Cookie: cookieHeader },
    cache: 'no-store',
  })

  if (res.status === 401) redirect('/login')

  const serverUser: AuthUser = await res.json()
  if (!serverUser || !serverUser.is_superuser) redirect('/login')

  return <OwnerDashboardClient serverUser={serverUser} />
}
