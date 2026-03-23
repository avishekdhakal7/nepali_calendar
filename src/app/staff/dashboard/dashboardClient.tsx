'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, ClipboardList, Settings, FileText } from 'lucide-react'
import StaffLayout from '@/components/layout/staff-layout'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { AuthUser } from '@/types/auth'

interface Props {
  serverUser: AuthUser
}

interface StatCard {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
}

interface Notice {
  id: number
  title: string
  notice_type: string
  priority: string
  created_at: string
}

export default function StaffDashboard({ serverUser }: Props) {
  const { setUser } = useAuthStore()
  const router = useRouter()

  const [stats, setStats] = useState({ notices: 0, pending_leaves: 0 })
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(serverUser)
  }, [serverUser, setUser])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    setLoading(true)
    try {
      const [noticesRes, leavesRes] = await Promise.all([
        api.get('/notices/?limit=5').catch(() => ({ data: [] })),
        api.get('/leave-requests/?status=pending&limit=5').catch(() => ({ data: [] })),
      ])
      setNotices(noticesRes.data.results || noticesRes.data)
      setStats({
        notices: noticesRes.data.count || (noticesRes.data.results || noticesRes.data).length || 0,
        pending_leaves: leavesRes.data.count || (leavesRes.data.results || leavesRes.data).length || 0,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const statCards: StatCard[] = [
    { label: 'Notices', value: stats.notices, icon: Bell, color: 'bg-cyan-500/20 text-cyan-400' },
    { label: 'Pending Leaves', value: stats.pending_leaves, icon: ClipboardList, color: 'bg-yellow-500/20 text-yellow-400' },
  ]

  return (
    <StaffLayout title="Dashboard" activeRoute="/staff/dashboard">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 rounded-xl p-6">
        <h1 className="text-xl font-bold text-white">Welcome!</h1>
        <p className="text-sm text-zinc-400 mt-1">View notices and manage your leave requests.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">{stat.label}</p>
                <p className="text-xl font-bold text-white mt-1">{loading ? '—' : stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/staff/leaves')}
          className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 hover:bg-zinc-800/40 transition-all"
        >
          <ClipboardList className="w-6 h-6 text-cyan-400 mb-2" />
          <p className="text-white font-medium text-sm">Leave Request</p>
          <p className="text-xs text-zinc-500">Apply for leave</p>
        </button>

        <button
          onClick={() => router.push('/staff/notices')}
          className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 hover:bg-zinc-800/40 transition-all"
        >
          <Bell className="w-6 h-6 text-cyan-400 mb-2" />
          <p className="text-white font-medium text-sm">Notices</p>
          <p className="text-xs text-zinc-500">View announcements</p>
        </button>

        <button
          onClick={() => router.push('/staff/settings')}
          className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 hover:bg-zinc-800/40 transition-all"
        >
          <Settings className="w-6 h-6 text-cyan-400 mb-2" />
          <p className="text-white font-medium text-sm">Settings</p>
          <p className="text-xs text-zinc-500">Account settings</p>
        </button>
      </div>

      {/* Notices */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
          <h2 className="text-sm font-semibold text-white">Recent Notices</h2>
          <button onClick={() => router.push('/staff/notices')} className="text-xs text-cyan-400 hover:text-cyan-300">
            View All
          </button>
        </div>
        <div className="divide-y divide-zinc-800/40">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-5 py-3">
                <div className="h-4 bg-zinc-800 rounded w-48 animate-pulse" />
                <div className="h-3 bg-zinc-800 rounded w-32 mt-1 animate-pulse" />
              </div>
            ))
          ) : notices.length === 0 ? (
            <div className="px-5 py-8 text-center text-zinc-600">
              <Bell className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No notices available</p>
            </div>
          ) : (
            notices.slice(0, 5).map((notice) => (
              <div key={notice.id} className="px-5 py-3 hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate flex-1">{notice.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
                    notice.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                    notice.priority === 'important' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {notice.priority}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{notice.notice_type} • {new Date(notice.created_at).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </StaffLayout>
  )
}
