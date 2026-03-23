'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Users, GraduationCap, Bell, TrendingUp, Calendar, Plus, ArrowRight } from 'lucide-react'
import OwnerLayout from '@/components/layout/owner-layout'
import api from '@/lib/api'
import type { AuthUser } from '@/types/auth'
import type { AxiosError } from 'axios'

interface Props {
  serverUser: AuthUser
}

interface StatCard {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  change?: string
}

interface School {
  id: number
  name: string
  email: string
  contact_number: string
  district: string
  is_active: boolean
  staff_count?: number
  student_count?: number
}

interface Notice {
  id: number
  title: string
  notice_type: string
  priority: string
  created_at: string
  school_name?: string
}

export default function OwnerDashboard({ serverUser }: Props) {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [schoolsRes, noticesRes] = await Promise.all([
          api.get('/schools/?limit=5'),
          api.get('/notices/?limit=5'),
        ])
        if (cancelled) return
        setSchools(schoolsRes.data.results || schoolsRes.data)
        setNotices(noticesRes.data.results || noticesRes.data)
        setStats({
          schools: schoolsRes.data.count || schoolsRes.data.results?.length || 0,
          staff: schoolsRes.data.results?.reduce((acc: number, s: School) => acc + (s.staff_count || 0), 0) || 0,
          students: schoolsRes.data.results?.reduce((acc: number, s: School) => acc + (s.student_count || 0), 0) || 0,
          notices: noticesRes.data.count || noticesRes.data.results?.length || 0,
        })
      } catch (e: unknown) {
        if (cancelled) return
        const err = e as AxiosError
        if (err.response?.status === 401) {
          window.location.href = '/login'
          return
        }
        console.error('Dashboard error:', err.response?.status, err.response?.data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const [stats, setStats] = useState({ schools: 0, staff: 0, students: 0, notices: 0 })
  const [schools, setSchools] = useState<School[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchDashboardData() {
    setLoading(true)
    try {
      const [schoolsRes, noticesRes] = await Promise.all([
        api.get('/schools/?limit=5'),
        api.get('/notices/?limit=5'),
      ])
      setSchools(schoolsRes.data.results || schoolsRes.data)
      setNotices(noticesRes.data.results || noticesRes.data)
      setStats({
        schools: schoolsRes.data.count || schoolsRes.data.results?.length || 0,
        staff: schoolsRes.data.results?.reduce((acc: number, s: School) => acc + (s.staff_count || 0), 0) || 0,
        students: schoolsRes.data.results?.reduce((acc: number, s: School) => acc + (s.student_count || 0), 0) || 0,
        notices: noticesRes.data.count || noticesRes.data.results?.length || 0,
      })
    } catch (e: unknown) {
      // Only redirect on 401 (unauthorized) — not on server errors
      const err = e as AxiosError
      if (err.response?.status === 401) {
        window.location.href = '/login'
        return
      }
      // Log server errors for debugging
      console.error('Dashboard API error:', err.response?.status, err.response?.data)
      setLoading(false)
    }
  }

  const statCards: StatCard[] = [
    { label: 'Total Schools', value: stats.schools, icon: Building2, color: 'bg-purple-500/20 text-purple-400' },
    { label: 'Total Staff', value: stats.staff, icon: Users, color: 'bg-blue-500/20 text-blue-400' },
    { label: 'Total Students', value: stats.students, icon: GraduationCap, color: 'bg-green-500/20 text-green-400' },
    { label: 'Active Notices', value: stats.notices, icon: Bell, color: 'bg-pink-500/20 text-pink-400' },
  ]

  return (
    <OwnerLayout title="Dashboard" activeRoute="/owner/dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{loading ? '—' : stat.value}</p>
                {stat.change && <p className="text-xs text-zinc-500 mt-1">{stat.change}</p>}
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/owner/schools/new')}
          className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 hover:bg-zinc-800/40 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Plus className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">Add New School</p>
              <p className="text-xs text-zinc-500">Register a new school</p>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-600 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => router.push('/owner/schools')}
          className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 hover:bg-zinc-800/40 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">Manage Schools</p>
              <p className="text-xs text-zinc-500">View all registered schools</p>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-600 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => router.push('/owner/reports')}
          className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 hover:bg-zinc-800/40 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">View Reports</p>
              <p className="text-xs text-zinc-500">Analytics & statistics</p>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-600 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Schools & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Schools */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
            <h2 className="text-sm font-semibold text-white">Recent Schools</h2>
            <button onClick={() => router.push('/owner/schools')} className="text-xs text-purple-400 hover:text-purple-300">
              View All
            </button>
          </div>
          <div className="divide-y divide-zinc-800/40">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-zinc-800 rounded w-32 animate-pulse" />
                    <div className="h-3 bg-zinc-800 rounded w-24 mt-1 animate-pulse" />
                  </div>
                </div>
              ))
            ) : schools.length === 0 ? (
              <div className="px-5 py-8 text-center text-zinc-600">
                <Building2 className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No schools registered yet</p>
              </div>
            ) : (
              schools.map((school) => (
                <button
                  key={school.id}
                  onClick={() => router.push(`/owner/schools/${school.id}`)}
                  className="w-full px-5 py-3 flex items-center gap-4 hover:bg-zinc-800/30 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{school.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{school.district} • {school.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${school.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {school.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Recent Notices */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
            <h2 className="text-sm font-semibold text-white">Recent Notices</h2>
            <button onClick={() => router.push('/owner/notices')} className="text-xs text-purple-400 hover:text-purple-300">
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
                <p className="text-sm">No notices yet</p>
              </div>
            ) : (
              notices.map((notice) => (
                <div key={notice.id} className="px-5 py-3 hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate flex-1">{notice.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      notice.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                      notice.priority === 'important' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {notice.priority}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{notice.school_name || 'System'} • {new Date(notice.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </OwnerLayout>
  )
}
