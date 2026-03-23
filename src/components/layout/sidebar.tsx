'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'
import {
  LayoutGrid, Users, GraduationCap, BookOpen, BookMarked,
  ClipboardList, Bell, Calendar, FileText, BarChart3,
  Settings, LogOut, School, ChevronLeft, Menu
} from 'lucide-react'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
}

interface SidebarProps {
  role: 'admin' | 'teacher' | 'staff' | 'student' | 'superuser'
  activePath: string
}

const navConfig: Record<SidebarProps['role'], NavItem[]> = {
  admin: [
    { icon: LayoutGrid, label: 'Dashboard', href: '/school-admin/dashboard' },
    { icon: Users, label: 'Staff', href: '/school-admin/staff' },
    { icon: GraduationCap, label: 'Students', href: '/school-admin/students' },
    { icon: BookOpen, label: 'Classes', href: '/school-admin/classes' },
    { icon: BookMarked, label: 'Subject Assign', href: '/school-admin/subject-assignments' },
    { icon: ClipboardList, label: 'Attendance', href: '/school-admin/attendance' },
    { icon: Bell, label: 'Notices', href: '/school-admin/notices' },
    { icon: Calendar, label: 'Calendar', href: '/school-admin/calendar' },
    { icon: FileText, label: 'Leave Requests', href: '/school-admin/leaves' },
    { icon: BarChart3, label: 'Reports', href: '/school-admin/reports' },
    { icon: Settings, label: 'Settings', href: '/school-admin/settings' },
  ],
  teacher: [
    { icon: LayoutGrid, label: 'Dashboard', href: '/teacher/dashboard' },
    { icon: BookOpen, label: 'My Classes', href: '/teacher/classes' },
    { icon: ClipboardList, label: 'Attendance', href: '/teacher/attendance' },
    { icon: Users, label: 'Students', href: '/teacher/students' },
    { icon: Bell, label: 'Notices', href: '/teacher/notices' },
    { icon: FileText, label: 'Leave', href: '/teacher/leaves' },
    { icon: Settings, label: 'Settings', href: '/teacher/settings' },
  ],
  staff: [
    { icon: LayoutGrid, label: 'Dashboard', href: '/staff/dashboard' },
    { icon: Bell, label: 'Notices', href: '/staff/notices' },
    { icon: FileText, label: 'Leave', href: '/staff/leaves' },
    { icon: Settings, label: 'Settings', href: '/staff/settings' },
  ],
  student: [
    { icon: LayoutGrid, label: 'Dashboard', href: '/student/dashboard' },
    { icon: GraduationCap, label: 'Profile', href: '/student/profile' },
    { icon: ClipboardList, label: 'Attendance', href: '/student/attendance' },
    { icon: Bell, label: 'Notices', href: '/student/notices' },
    { icon: FileText, label: 'Leave', href: '/student/leaves' },
    { icon: BookOpen, label: 'Subjects', href: '/student/subjects' },
    { icon: Settings, label: 'Settings', href: '/student/settings' },
  ],
  superuser: [
    { icon: LayoutGrid, label: 'Dashboard', href: '/owner/dashboard' },
    { icon: School, label: 'Schools', href: '/owner/schools' },
    { icon: Bell, label: 'Notices', href: '/owner/notices' },
    { icon: BarChart3, label: 'Reports', href: '/owner/reports' },
    { icon: Settings, label: 'Settings', href: '/owner/settings' },
  ],
}

const roleLabels: Record<SidebarProps['role'], string> = {
  admin: 'School Admin',
  teacher: 'Teacher',
  staff: 'Staff',
  student: 'Student',
  superuser: 'Superuser',
}

const roleColors: Record<SidebarProps['role'], string> = {
  admin: 'from-blue-500 to-indigo-600',
  teacher: 'from-green-500 to-emerald-600',
  staff: 'from-cyan-500 to-teal-600',
  student: 'from-amber-500 to-orange-600',
  superuser: 'from-purple-500 to-violet-600',
}

export function Sidebar({ role, activePath }: SidebarProps) {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = navConfig[role] || []

  function handleLogout() {
    try { api.post('/auth/logout/') } catch {}
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800/60
        transition-all duration-300
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-800/60">
        <div
          className={`
            w-8 h-8 rounded-xl bg-gradient-to-br ${roleColors[role]}
            flex items-center justify-center flex-shrink-0
          `}
        >
          <School className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">
              {user?.school_name || 'School'}
            </p>
            <p className="text-xs text-zinc-500 truncate capitalize">
              {roleLabels[role]}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePath === item.href || activePath.startsWith(item.href + '/')
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150
                ${isActive
                  ? 'bg-blue-500/15 text-blue-400 border-r-2 border-blue-500'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
      >
        {collapsed ? <Menu className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* User + Logout */}
      <div className="border-t border-zinc-800/60 p-3">
        {collapsed ? (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div
              className={`
                w-8 h-8 rounded-full bg-gradient-to-br ${roleColors[role]}
                flex items-center justify-center flex-shrink-0
              `}
            >
              <span className="text-xs font-bold text-white">
                {user?.full_name?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium text-white truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-zinc-500 capitalize">{roleLabels[role]}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
