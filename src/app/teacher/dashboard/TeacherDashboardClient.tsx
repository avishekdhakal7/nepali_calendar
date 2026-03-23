'use client'

import { PortalLayout } from '@/components/layout/portal-layout'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import {
  GraduationCap, Users, UserCheck, CalendarDays,
  ChevronRight, CheckCircle2,
  Plus, BookOpen, Bell, Calendar, ClipboardList,
} from 'lucide-react'
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
  posted_by_name: string
  created_at: string
}

interface LeaveRequest {
  id: number
  student_name: string
  from_date_ad: string
  to_date_ad: string
  status: string
  reason: string
}

interface MyClass {
  id: number
  class_name: string
  section_name: string
  student_count: number
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

const noticeTypeColors: Record<string, string> = {
  holiday:        'bg-blue-500/10 text-blue-400',
  emergency:      'bg-red-500/10 text-red-400',
  exam:           'bg-purple-500/10 text-purple-400',
  event:          'bg-pink-500/10 text-pink-400',
  general:        'bg-zinc-500/10 text-zinc-400',
  absent_alert:   'bg-yellow-500/10 text-yellow-400',
}

const priorityColors: Record<string, string> = {
  urgent:    'bg-red-500/10 text-red-400 border border-red-500/20',
  important: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  normal:    'bg-green-500/10 text-green-400 border border-green-500/20',
}

export default function TeacherDashboard({ serverUser }: Props) {
  const { setUser } = useAuthStore()
  const router = useRouter()

  const [myClasses, setMyClasses] = useState<MyClass[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(serverUser)
  }, [serverUser, setUser])

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      try {
        const [classesRes, noticesRes, leavesRes] = await Promise.allSettled([
          api.get('/my-classes/'),
          api.get('/notices/', { params: { limit: 5 } }),
          api.get('/leave-requests/', { params: { status: 'pending' } }),
        ])

        const classes = classesRes.status === 'fulfilled'
          ? (classesRes.value.data.results || classesRes.value.data || [])
          : []
        setMyClasses(classes.slice(0, 5))

        const noticesData = noticesRes.status === 'fulfilled'
          ? (noticesRes.value.data.results || noticesRes.value.data || [])
          : []
        setNotices(noticesData.filter((n: Notice) => n.notice_type !== 'absent_alert').slice(0, 5))

        const leavesData = leavesRes.status === 'fulfilled'
          ? (leavesRes.value.data.results || leavesRes.value.data || [])
          : []
        setPendingLeaves(leavesData.slice(0, 5))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const totalStudents = myClasses.reduce((acc, c) => acc + (c.student_count || 0), 0)

  return (
    <PortalLayout
      title="Dashboard"
        subtitle={`Welcome back, ${serverUser?.full_name?.split(' ')[0] || 'Teacher'}`}
    >
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'My Classes', value: myClasses.length, icon: BookOpen, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Pending Leaves', value: pendingLeaves.length, icon: CalendarDays, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { label: 'Notices', value: notices.length, icon: Bell, color: 'text-purple-400', bg: 'bg-purple-500/10' },
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
            <Plus className="w-4 h-4 text-green-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Mark Attendance', icon: ClipboardList, href: '/teacher/attendance', color: 'bg-green-500/10 hover:bg-green-500/20 text-green-400' },
              { label: 'My Classes', icon: BookOpen, href: '/teacher/classes', color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400' },
              { label: 'Apply Leave', icon: Calendar, href: '/teacher/leaves', color: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400' },
              { label: 'Notices', icon: Bell, href: '/teacher/notices', color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400' },
            ].map((action) => (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* My Classes */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                My Classes
              </h2>
              <button
                onClick={() => router.push('/teacher/classes')}
                className="text-xs text-zinc-500 hover:text-green-400 transition-colors flex items-center gap-1"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {myClasses.length > 0 ? (
              <div className="space-y-2">
                {myClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-lg hover:bg-zinc-800/60 transition-all cursor-pointer"
                    onClick={() => router.push(`/teacher/classes/${cls.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {cls.class_name} — Section {cls.section_name}
                      </p>
                      <p className="text-xs text-zinc-500">{cls.student_count} students</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
                <BookOpen className="w-8 h-8 mb-2" />
                <p className="text-xs">No classes assigned yet</p>
              </div>
            )}
          </div>

          {/* Notices */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                Notices
              </h2>
              <button
                onClick={() => router.push('/teacher/notices')}
                className="text-xs text-zinc-500 hover:text-green-400 transition-colors flex items-center gap-1"
              >
                View all <ChevronRight className="w-3 h-3" />
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
                <Bell className="w-8 h-8 mb-2" />
                <p className="text-xs">No notices available</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Leaves */}
        {pendingLeaves.length > 0 && (
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-orange-400" />
                Pending Leave Requests
              </h2>
              <button
                onClick={() => router.push('/teacher/leaves')}
                className="text-xs text-zinc-500 hover:text-green-400 transition-colors flex items-center gap-1"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {pendingLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">{leave.student_name}</p>
                    <p className="text-xs text-zinc-500">{leave.from_date_ad} → {leave.to_date_ad}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  )
}
