'use client'

import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { useAuthStore } from '@/store/auth'
import { usePathname } from 'next/navigation'

type Role = 'admin' | 'teacher' | 'staff' | 'student' | 'superuser'

interface PortalLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function PortalLayout({ children, title, subtitle }: PortalLayoutProps) {
  const { user } = useAuthStore()
  const pathname = usePathname()

  const role: Role = pathname.startsWith('/school-admin')
    ? 'admin'
    : pathname.startsWith('/teacher')
    ? 'teacher'
    : pathname.startsWith('/staff')
    ? 'staff'
    : pathname.startsWith('/student')
    ? 'student'
    : pathname.startsWith('/owner')
    ? 'superuser'
    : 'admin'

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <Sidebar role={role} activePath={pathname} />
      <main className="flex-1 ml-60 transition-all duration-300">
        <Topbar title={title} subtitle={subtitle} role={role} />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
