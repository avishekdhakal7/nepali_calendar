'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Building2, Users, GraduationCap, RefreshCw } from 'lucide-react'
import OwnerLayout from '@/components/layout/owner-layout'
import api from '@/lib/api'

interface SchoolStats {
  id: number
  name: string
  district: string
  total_staff: number
  total_students: number
  active_enrollments: number
}

export default function OwnerReportsPage() {
  const [schools, setSchools] = useState<SchoolStats[]>([])
  const [loading, setLoading] = useState(true)
  const [totalSchools, setTotalSchools] = useState(0)
  const [totalStaff, setTotalStaff] = useState(0)
  const [totalStudents, setTotalStudents] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch all schools
      const schoolsRes = await api.get('/schools/')
      const schoolList = schoolsRes.data.results || schoolsRes.data
      setTotalSchools(schoolsRes.data.count || schoolList.length)

      // Fetch per-school dashboard stats in parallel
      const dashboardPromises = schoolList.map((s: { id: number }) =>
        api.get(`/schools/${s.id}/dashboard/`).catch(() => ({ data: { total_staff: 0, total_students: 0, active_enrollments: 0 } }))
      )
      const dashboards = await Promise.all(dashboardPromises)

      const schoolStats: SchoolStats[] = schoolList.map((s: { id: number; name: string; district?: string }, i: number) => ({
        id: s.id,
        name: s.name,
        district: s.district || '',
        total_staff: dashboards[i].data.total_staff || 0,
        total_students: dashboards[i].data.active_enrollments || dashboards[i].data.total_students || 0,
        active_enrollments: dashboards[i].data.active_enrollments || 0,
      }))

      setSchools(schoolStats)
      const staffSum = schoolStats.reduce((acc, s) => acc + s.total_staff, 0)
      const studentSum = schoolStats.reduce((acc, s) => acc + s.active_enrollments, 0)
      setTotalStaff(staffSum)
      setTotalStudents(studentSum)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <OwnerLayout title="Reports" activeRoute="/owner/reports">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm text-zinc-500">Overview of all schools</h2>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total Schools</p>
              <p className="text-2xl font-bold text-white">{loading ? '—' : totalSchools}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total Staff</p>
              <p className="text-2xl font-bold text-white">{loading ? '—' : totalStaff}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total Students</p>
              <p className="text-2xl font-bold text-white">{loading ? '—' : totalStudents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Per-School Breakdown */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
          <h2 className="text-sm font-semibold text-white">School Performance</h2>
          <span className="text-xs text-zinc-500">{schools.length} schools</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">School</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">District</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Staff</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Active Students</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3"><div className="h-4 bg-zinc-800 rounded w-40 animate-pulse" /></td>
                    <td className="px-5 py-3"><div className="h-4 bg-zinc-800 rounded w-24 animate-pulse" /></td>
                    <td className="px-5 py-3"><div className="h-4 bg-zinc-800 rounded w-16 animate-pulse" /></td>
                    <td className="px-5 py-3"><div className="h-4 bg-zinc-800 rounded w-16 animate-pulse" /></td>
                  </tr>
                ))
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-zinc-600">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No schools registered yet</p>
                  </td>
                </tr>
              ) : (
                schools.map((school) => (
                  <tr key={school.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-white font-medium">{school.name}</td>
                    <td className="px-5 py-3 text-sm text-zinc-400">{school.district || '—'}</td>
                    <td className="px-5 py-3 text-sm text-white text-right">{school.total_staff}</td>
                    <td className="px-5 py-3 text-sm text-white text-right">{school.total_students}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Growth Analytics Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h2 className="text-white font-semibold">Student Trends</h2>
          </div>
          <p className="text-sm text-zinc-500">Student enrollment trends over academic years will appear here once schools start enrolling students.</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h2 className="text-white font-semibold">Growth Analytics</h2>
          </div>
          <p className="text-sm text-zinc-500">Growth metrics across all schools will be available once more data is captured by the system.</p>
        </div>
      </div>
    </OwnerLayout>
  )
}
