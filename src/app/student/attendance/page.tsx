'use client'

import { useState, useEffect } from 'react'
import { Calendar, CheckCircle, XCircle, Clock, Download } from 'lucide-react'
import StudentLayout from '@/components/layout/student-layout'
import api from '@/lib/api'

interface AttendanceRecord {
  id: number
  date_ad: string
  date_bs: string
  status: string
  status_display?: string
  marked_by?: string
}

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchAttendance()
  }, [])

  async function fetchAttendance() {
    setLoading(true)
    try {
      const res = await api.get('/daily-attendance/my/')
      setAttendance(res.data.results || res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredAttendance = attendance.filter(a => {
    if (filter === 'all') return true
    return a.status === filter
  })

  const presentCount = attendance.filter(a => a.status === 'present').length
  const absentCount = attendance.filter(a => a.status === 'absent').length
  const leaveCount = attendance.filter(a => a.status === 'leave').length
  const rate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0

  return (
    <StudentLayout title="My Attendance" activeRoute="/student/attendance">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Present</p>
              <p className="text-lg font-bold text-white">{presentCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Absent</p>
              <p className="text-lg font-bold text-white">{absentCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Leave</p>
              <p className="text-lg font-bold text-white">{leaveCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Rate</p>
              <p className="text-lg font-bold text-white">{rate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'present', 'absent', 'leave'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
              filter === f
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Attendance List */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
        <div className="divide-y divide-zinc-800/40">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-32" />
                <div className="h-4 bg-zinc-800 rounded w-20" />
              </div>
            ))
          ) : filteredAttendance.length === 0 ? (
            <div className="px-5 py-12 text-center text-zinc-600">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No attendance records found</p>
            </div>
          ) : (
            filteredAttendance.map((record) => (
              <div key={record.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{record.date_ad}</p>
                  <p className="text-xs text-zinc-500">{record.date_ad} ({record.date_bs})</p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-lg ${
                  record.status === 'present' ? 'bg-green-500/20 text-green-400' :
                  record.status === 'absent' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </StudentLayout>
  )
}
