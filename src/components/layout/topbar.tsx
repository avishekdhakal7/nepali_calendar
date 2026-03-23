'use client'

import { Bell, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TopbarProps {
  title: string
  subtitle?: string
  role: 'admin' | 'teacher' | 'staff' | 'student' | 'superuser'
  notificationCount?: number
}

const roleBasePath: Record<string, string> = {
  admin: '/school-admin',
  teacher: '/teacher',
  staff: '/staff',
  student: '/student',
  superuser: '/owner',
}

export function Topbar({ title, subtitle, role, notificationCount = 0 }: TopbarProps) {
  const router = useRouter()
  const basePath = roleBasePath[role] || ''

  return (
    <header className="sticky top-0 z-30 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-base font-semibold text-white">{title}</h1>
        {subtitle && (
          <p className="text-xs text-zinc-500">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push(`${basePath}/notices`)}
          className="relative p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => router.push(`${basePath}/settings`)}
          className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
