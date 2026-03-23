'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutGrid, Calendar, Bell, FileText,
  Settings, LogOut, GraduationCap, BookOpen, ClipboardList,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  active?: boolean
}

interface StudentSidebarProps {
  activeRoute?: string
}

export default function StudentSidebar({ activeRoute }: StudentSidebarProps) {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const sidebarItems: NavItem[] = [
    { icon: LayoutGrid,    label: 'Dashboard',      href: '/student/dashboard',    active: activeRoute === '/student/dashboard' },
    { icon: GraduationCap, label: 'Profile',    href: '/student/profile',      active: activeRoute === '/student/profile' },
    { icon: Calendar,     label: 'Attendance',    href: '/student/attendance',   active: activeRoute === '/student/attendance' },
    { icon: Bell,         label: 'Notices',       href: '/student/notices',     active: activeRoute === '/student/notices' },
    { icon: ClipboardList, label: 'Leave Request', href: '/student/leaves',     active: activeRoute === '/student/leaves' },
    { icon: BookOpen,     label: 'Subjects',      href: '/student/subjects',    active: activeRoute === '/student/subjects' },
    { icon: FileText,     label: 'Reports',      href: '/student/reports',    active: activeRoute === '/student/reports' },
    { icon: Settings,     label: 'Settings',     href: '/student/settings',   active: activeRoute === '/student/settings' },
  ]

  function handleLogout() {
    try { api.post('/auth/logout/') } catch {}
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <>
      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800/60
        transition-all duration-300
        ${sidebarOpen ? 'w-60' : 'w-16'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-800/60">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">Student</p>
              <p className="text-xs text-zinc-500 truncate">Portal</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150
                ${item.active
                  ? 'bg-amber-500/15 text-amber-400 border-r-2 border-amber-500'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
                }
              `}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-zinc-800/60 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">
                  {user?.full_name?.[0] || 'S'}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium text-white truncate">{user?.full_name || 'Student'}</p>
                <p className="text-xs text-zinc-500 truncate">Student</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}
