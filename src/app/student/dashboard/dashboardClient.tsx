'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar, Bell, ClipboardList, GraduationCap,
  ChevronRight, CheckCircle2
} from 'lucide-react'
import StudentLayout from '@/components/layout/student-layout'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { AuthUser } from '@/types/auth'

interface Props {
  serverUser: AuthUser
}

interface Notice {
  id: number
  title: string
  notice_type: string
  notice_type_display: string
  priority: string
  body: string
  created_at: string
}

interface AttendanceRecord {
  id: number
  date_ad: string
  status: string
}

interface Enrollment {
  id: number
  class_name: string
  section_name: string
  roll_number: number
  academic_year: string
}

const priorityColors: Record<string, string> = {
  urgent:    'bg-red-500/10 text-red-400 border border-red-500/20',
  important: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  normal:    'bg-green-500/10 text-green-400 border border-green-500/20',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'just now'
}

export default function StudentDashboard({ serverUser }: Props) {
  const { setUser } = useAuthStore()
  const router = useRouter()

  const [notices, setNotices] = useState<Notice[]>([])
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([])
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(serverUser)
  }, [serverUser, setUser])

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      try {
        const [noticesRes, attendanceRes, profileRes] = await Promise.allSettled([
          api.get('/notices/', { params: { limit: 5 } }),
          api.get('/daily-attendance/my/'),
          api.get('/auth/profile/'),
        ])

        const noticesData = noticesRes.status === 'fulfilled'
          ? (noticesRes.value.data.results || noticesRes.value.data || [])
          : []
        setNotices(noticesData.slice(0, 5))

        const attendanceData = attendanceRes.status === 'fulfilled'
          ? (attendanceRes.value.data.results || attendanceRes.value.data || [])
          : []
        setRecentAttendance(attendanceData.slice(0, 7))

        if (profileRes.status === 'fulfilled') {
          const profile = profileRes.value.data
          if (profile.current_enrollment) {
            setEnrollment(profile.current_enrollment)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const presentDays = recentAttendance.filter(a => a.status === 'present').length
  const totalDays = recentAttendance.length
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  const quickActions = [
    { label: 'Attendance', icon: Calendar, href: '/student/attendance' },
    { label: 'Notices', icon: Bell, href: '/student/notices' },
    { label: 'Apply Leave', icon: ClipboardList, href: '/student/leaves' },
    { label: 'Profile', icon: GraduationCap, href: '/student/profile' },
  ]

  return (
    <StudentLayout title="Dashboard" activeRoute="/student/dashboard">
      <p className="text-sm text-zinc-500">Welcome, {serverUser?.full_name?.split(' ')[0] || 'Student'}</p>
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: Calendar, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Present Days', value: presentDays, icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Class', value: enrollment ? `${enrollment.class_name} — ${enrollment.section_name}` : '—', icon: GraduationCap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map(card => (
            <div key={card.label} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4">
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
          <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map(action => (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-800/60 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-all"
              >
                <action.icon className="w-5 h-5" />
                <span className="text-xs font-medium text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notices */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Recent Notices
            </h2>
            <button
              onClick={() => router.push('/student/notices')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {notices.length > 0 ? (
            <div className="space-y-3">
              {notices.map(notice => (
                <div key={notice.id} className="flex items-start gap-3 p-3 bg-zinc-800/40 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[notice.priority] || 'bg-zinc-700 text-zinc-400'}`}>
                        {notice.priority}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white mt-1 truncate">{notice.title}</p>
                    <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{notice.body}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{timeAgo(notice.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
              <Bell className="w-8 h-8 mb-2" />
              <p className="text-xs">No notices yet</p>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  )
}
