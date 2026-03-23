'use client'

import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { CalendarEvent } from '@/types/calendar'
import { EVENT_TYPE_CONFIG } from '@/types/calendar'
import {
  GraduationCap, Users, UserCheck, CalendarDays, Megaphone,
  ChevronRight, CheckCircle2,
  Plus, UserPlus, Calendar, ClipboardList, BookMarked,
  FileText, BarChart3
} from 'lucide-react'
import type { AuthUser } from '@/types/auth'
import type { Notice } from '@/types/notice'
import type { Staff } from '@/types/staff'
import type { LeaveRequest } from '@/types/leave'

interface DashboardStats {
  total_students: number
  total_staff: number
  total_classes: number
  active_academic_year: string
}

interface RecentStudent {
  id: number
  full_name: string
  admission_number: string | null
  current_class: { class: string; section: string } | null
}

const noticeTypeColors: Record<string, string> = {
  general: 'bg-blue-500/10 text-blue-400',
  academic: 'bg-purple-500/10 text-purple-400',
  event: 'bg-green-500/10 text-green-400',
  holiday: 'bg-yellow-500/10 text-yellow-400',
  urgent: 'bg-red-500/10 text-red-400',
  absent_alert: 'bg-orange-500/10 text-orange-400',
}

const priorityColors: Record<string, string> = {
  low: 'bg-zinc-700/50 text-zinc-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-red-500/20 text-red-400',
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

interface Props {
  serverUser: AuthUser
}

export default function SchoolAdminDashboard({ serverUser }: Props) {
  const { setUser } = useAuthStore()
  const router = useRouter()
  const schoolId = serverUser?.school_id

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [notices, setNotices] = useState<Notice[]>([])
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([])
  const [recentStaff, setRecentStaff] = useState<Staff[]>([])
  const [holidays, setHolidays] = useState<CalendarEvent[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(serverUser)
  }, [serverUser, setUser])

  useEffect(() => {
    if (!serverUser || !schoolId) {
      setLoading(false)
      return
    }

    async function fetchAll() {
      setLoading(true)
      try {
        const [schoolRes, noticeRes, studentRes, staffRes, holidayRes, leaveRes] = await Promise.allSettled([
          api.get(`/schools/${schoolId}/dashboard/`),
          api.get('/notices/', { params: { school: schoolId } }),
          api.get('/students/', { params: { school: schoolId, ordering: '-admission_date' } }),
          api.get('/staff/', { params: { school: schoolId } }),
          api.get('/calendar/'),
          api.get('/leave-requests/', { params: { status: 'pending' } }),
        ])

        if (schoolRes.status === 'fulfilled') {
          const d = schoolRes.value.data
          setStats({
            total_students: d.total_students ?? 0,
            total_staff: d.total_staff ?? 0,
            total_classes: d.total_classes ?? 0,
            active_academic_year: d.active_academic_year ?? '—',
          })
        }

        const noticesData = noticeRes.status === 'fulfilled'
          ? (noticeRes.value.data.results || noticeRes.value.data)
          : []
        setNotices(noticesData.filter((n: Notice) => n.notice_type !== 'absent_alert').slice(0, 5))

        const studentsData = studentRes.status === 'fulfilled'
          ? (studentRes.value.data.results || studentRes.value.data)
          : []
        setRecentStudents(studentsData.slice(0, 5))

        const staffData = staffRes.status === 'fulfilled'
          ? (staffRes.value.data.results || staffRes.value.data)
          : []
        setRecentStaff(staffData.slice(0, 5))

        const holidaysData = holidayRes.status === 'fulfilled'
          ? (holidayRes.value.data.results || holidayRes.value.data)
          : []
        setHolidays(holidaysData.slice(0, 4))

        const leavesData = leaveRes.status === 'fulfilled'
          ? (leaveRes.value.data.results || leaveRes.value.data)
          : []
        setLeaveRequests(leavesData.slice(0, 4))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [schoolId])

  const quickActions = [
    { label: 'Add Student', icon: UserPlus, href: '/school-admin/students/new', color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400' },
    { label: 'Add Staff', icon: Users, href: '/school-admin/staff/new', color: 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-400' },
    { label: 'Post Notice', icon: Megaphone, href: '/school-admin/notices/new', color: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400' },
    { label: 'Mark Event', icon: Calendar, href: '/school-admin/calendar/new', color: 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-400' },
    { label: 'Attendance', icon: ClipboardList, href: '/school-admin/attendance', color: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400' },
    { label: 'Subject Assign', icon: BookMarked, href: '/school-admin/subject-assignments', color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400' },
    { label: 'Leave Requests', icon: FileText, href: '/school-admin/leaves', color: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400' },
    { label: 'Reports', icon: BarChart3, href: '/school-admin/reports', color: 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400' },
  ]

  return (
    <SchoolAdminLayout title="Dashboard" activeRoute="/school-admin/dashboard">
      <div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: stats?.total_students ?? 0, icon: GraduationCap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Total Staff', value: stats?.total_staff ?? 0, icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
            { label: 'Academic Year', value: stats?.active_academic_year ?? '—', icon: CalendarDays, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Pending Leaves', value: leaveRequests.length, icon: FileText, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          ].map((card) => (
            <div key={card.label} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 hover:border-zinc-700/60 transition-all">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{loading ? '—' : card.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-800/60 transition-all ${action.color}`}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Pending Leaves */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" />
                Pending Leaves
              </h2>
              <button
                onClick={() => router.push('/school-admin/leaves')}
                className="text-xs text-zinc-500 hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {leaveRequests.length > 0 ? (
              <div className="space-y-2">
                {leaveRequests.map((leave) => (
                  <div key={leave.id} className="flex items-start justify-between p-3 bg-zinc-800/40 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{leave.student_name}</p>
                      <p className="text-xs text-zinc-500 truncate">{leave.from_date_ad} → {leave.to_date_ad}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 ml-2">Pending</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
                <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-600" />
                <p className="text-xs">No pending leaves</p>
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pink-400" />
                Calendar
              </h2>
              <button
                onClick={() => router.push('/school-admin/calendar')}
                className="text-xs text-zinc-500 hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {holidays.length > 0 ? (
              <div className="space-y-2">
                {holidays.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${EVENT_TYPE_CONFIG[h.event_type]?.dot || 'bg-zinc-500'}`} />
                      <div>
                        <p className="text-xs font-medium text-white">{h.name}</p>
                        <p className="text-xs text-zinc-500">{h.date_ad} ({h.date_bs})</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] ${EVENT_TYPE_CONFIG[h.event_type]?.color || 'text-zinc-500'}`}>
                        {EVENT_TYPE_CONFIG[h.event_type]?.label || h.event_type}
                      </span>
                      <p className="text-xs text-zinc-600">{h.date_ad}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
                <Calendar className="w-8 h-8 mb-2" />
                <p className="text-xs">No events marked</p>
              </div>
            )}
          </div>

          {/* Recent Notices */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-cyan-400" />
                Recent Notices
              </h2>
              <button
                onClick={() => router.push('/school-admin/notices/new')}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                Post Notice <Plus className="w-3 h-3" />
              </button>
            </div>
            {notices.length > 0 ? (
              <div className="space-y-2">
                {notices.map((notice) => (
                  <div key={notice.id} className="flex items-start gap-3 p-3 bg-zinc-800/40 rounded-lg">
                    <span className={`text-xs px-2 py-0.5 rounded-md flex-shrink-0 ${noticeTypeColors[notice.notice_type] || 'bg-zinc-700 text-zinc-400'}`}>
                      {notice.notice_type_display}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{notice.title}</p>
                      <p className="text-xs text-zinc-500">{notice.posted_by_name} · {timeAgo(notice.created_at)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColors[notice.priority] || ''}`}>
                      {notice.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
                <Megaphone className="w-8 h-8 mb-2" />
                <p className="text-xs">No notices yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Students */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                Recent Students
              </h2>
              <button
                onClick={() => router.push('/school-admin/students/new')}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                Add Student <Plus className="w-3 h-3" />
              </button>
            </div>
            {recentStudents.length > 0 ? (
              <div className="space-y-2">
                {recentStudents.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-3 bg-zinc-800/40 rounded-lg cursor-pointer hover:bg-zinc-800/60 transition-all"
                    onClick={() => router.push(`/school-admin/students/${s.id}`)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-400">{s.full_name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{s.full_name}</p>
                      <p className="text-xs text-zinc-500">
                        {s.admission_number}
                        {s.current_class && ` · Class ${s.current_class.class}-${s.current_class.section}`}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
                <GraduationCap className="w-8 h-8 mb-2" />
                <p className="text-xs">No students yet</p>
              </div>
            )}
          </div>

          {/* Staff */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" />
                Staff Members
              </h2>
              <button
                onClick={() => router.push('/school-admin/staff')}
                className="text-xs text-zinc-500 hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {recentStaff.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {recentStaff.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col items-center gap-2 p-3 bg-zinc-800/40 rounded-xl cursor-pointer hover:bg-zinc-800/60 transition-all text-center"
                    onClick={() => router.push(`/school-admin/staff/${s.id}`)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-violet-400">{s.full_name[0]}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white truncate max-w-[100px]">{s.full_name}</p>
                      <p className="text-xs text-zinc-500 capitalize">
                        {s.active_roles?.[0]?.replace('_', ' ') || 'Staff'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
                <Users className="w-8 h-8 mb-2" />
                <p className="text-xs">No staff yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SchoolAdminLayout>
  )
}
