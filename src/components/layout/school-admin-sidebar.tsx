'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutGrid, Users, GraduationCap, BookOpen,
  ClipboardList, Bell, Calendar, FileText,
  BarChart3, Settings, LogOut, X, School,
  BookMarked,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  active?: boolean
}

interface SchoolAdminSidebarProps {
  activeRoute?: string
  sidebarOpen?: boolean
  setSidebarOpen?: (open: boolean) => void
}

export default function SchoolAdminSidebar({ activeRoute, sidebarOpen, setSidebarOpen }: SchoolAdminSidebarProps) {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [internalOpen, setInternalOpen] = useState(true)
  const isOpen = sidebarOpen !== undefined ? sidebarOpen : internalOpen
  const toggleOpen = setSidebarOpen !== undefined ? setSidebarOpen : setInternalOpen

  const sidebarItems: NavItem[] = [
    { icon: LayoutGrid,     label: 'Dashboard',          href: '/school-admin/dashboard',      active: activeRoute === '/school-admin/dashboard' },
    { icon: Users,          label: 'Staff',              href: '/school-admin/staff',            active: activeRoute === '/school-admin/staff' },
    { icon: GraduationCap,  label: 'Students',           href: '/school-admin/students',         active: activeRoute === '/school-admin/students' },
    { icon: BookOpen,       label: 'Classes',           href: '/school-admin/classes',           active: activeRoute === '/school-admin/classes' },
    { icon: BookMarked,     label: 'Subject Assignment',href: '/school-admin/subject-assignments', active: activeRoute === '/school-admin/subject-assignments' },
    { icon: ClipboardList,  label: 'Attendance',         href: '/school-admin/attendance',        active: activeRoute === '/school-admin/attendance' },
    { icon: Bell,           label: 'Notices',            href: '/school-admin/notices',          active: activeRoute === '/school-admin/notices' },
    { icon: Calendar,       label: 'Calendar',           href: '/school-admin/calendar',         active: activeRoute === '/school-admin/calendar' },
    { icon: FileText,       label: 'Leave Requests',     href: '/school-admin/leaves',            active: activeRoute === '/school-admin/leaves' },
    { icon: BarChart3,      label: 'Reports',            href: '/school-admin/reports',          active: activeRoute === '/school-admin/reports' },
    { icon: Settings,       label: 'Settings',          href: '/school-admin/settings',         active: activeRoute === '/school-admin/settings' },
  ]

  function handleLogout() {
    try { api.post('/auth/logout/') } catch {}
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <>
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800/60
        transition-all duration-300
        ${isOpen ? 'w-60 translate-x-0' : '-translate-x-full xl:translate-x-0 xl:w-16'}
      `}>
        {/* Header */}
        <div className="flex items-center px-3 py-5 border-b border-zinc-800/60 gap-3">
          {isOpen ? (
            <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user?.logo ? (
                  <img src={user.logo} alt={user.school_name || ''} className="w-full h-full object-cover" />
                ) : (
                  <School className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user?.school_name || 'School'}</p>
                <p className="text-xs text-zinc-500 truncate">Management</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mx-auto overflow-hidden">
              {user?.logo ? (
                <img src={user.logo} alt={user.school_name || ''} className="w-full h-full object-cover" />
              ) : (
                <School className="w-4 h-4 text-white" />
              )}
            </div>
          )}
          <button
            onClick={() => toggleOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all flex-shrink-0 xl:hidden"
          >
            <X className="w-4 h-4" />
          </button>
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
                  ? 'bg-blue-500/15 text-blue-400 border-r-2 border-blue-500'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
                }
              `}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {isOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-zinc-800/60 p-3">
          {isOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">{user?.full_name?.[0] || 'S'}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium text-white truncate">{user?.full_name || 'School Admin'}</p>
                <p className="text-xs text-zinc-500 truncate">School Admin</p>
              </div>
              <button onClick={handleLogout} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="w-full flex justify-center p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Overlay — closes sidebar on mobile/tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 xl:hidden"
          onClick={() => toggleOpen(false)}
        />
      )}
    </>
  )
}

export { SchoolAdminSidebar }
