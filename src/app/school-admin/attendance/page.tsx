'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, CheckCircle2, XCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { adToBsApi } from '@/lib/date-utils'
import BsCalendarGrid from '@/components/calendar/BsCalendarGrid'
import type { BsDay } from '@/lib/bsCalendar'

interface AttendanceSummary {
  percentage: number
  total_present: number
  total_absent: number
  submitted: number
  total_sections: number
}

interface SectionAttendance {
  id: number
  class: string
  section: string
  academic_year: string
  present: number
  absent: number
  percentage: number
  submitted: boolean
  marked_by: string | null
}

interface AcademicYear {
  id: number
  name: string
  is_active: boolean
}

export default function AttendancePage() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null)
  const [sectionData, setSectionData] = useState<SectionAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [dateBs, setDateBs] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeYear, setActiveYear] = useState<number | null>(null)

  useEffect(() => { fetchActiveYear() }, [])

  async function fetchActiveYear() {
    try {
      const res = await api.get('/academic-years/', { params: { school: 1 } })
      const years = res.data.results || res.data
      const active = years.find((y: AcademicYear) => y.is_active)
      if (active) setActiveYear(active.id)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (date) {
      fetchAttendance()
      adToBsApi(new Date(date)).then(setDateBs).catch(() => setDateBs(''))
    }
  }, [date, page, activeYear])

  async function fetchAttendance() {
    setLoading(true)
    try {
      const [summaryRes, sectionRes] = await Promise.allSettled([
        api.get('/daily-attendance/summary/', { params: { date, academic_year: activeYear } }),
        api.get('/daily-attendance/', { params: { date, page } }),
      ])

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data)
      if (sectionRes.status === 'fulfilled') {
        const data = sectionRes.value.data
        setSectionData(data.results || data)
        setTotalPages(data.total_pages || 1)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SchoolAdminLayout title="Attendance" activeRoute="/school-admin/attendance">
      {/* Date Selector + BS Calendar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={date}
            onChange={e => { setDate(e.target.value); setPage(1) }}
            className="px-4 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white focus:outline-none focus:border-pink-500/50"
          />
          {dateBs && (
            <span className="text-amber-400 text-sm font-medium">({dateBs})</span>
          )}
        </div>
        <div className="w-full max-w-sm">
          <BsCalendarGrid
            selectedAdDate={date}
            onDateSelect={(bs: BsDay) => { setDate(bs.ad); setDateBs(bs.bs); setPage(1) }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{summary.percentage}%</p>
            <p className="text-xs text-zinc-500 mt-1">Attendance Rate</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{summary.total_present}</p>
            <p className="text-xs text-zinc-500 mt-1">Present</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{summary.total_absent}</p>
            <p className="text-xs text-zinc-500 mt-1">Absent</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <p className="text-lg font-bold text-white">{summary.submitted}</p>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Submitted / {summary.total_sections} sections</p>
          </div>
        </div>
      )}

      {/* Section List */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Class</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Present</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Absent</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Rate</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Marked By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-zinc-800 rounded animate-pulse w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : sectionData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-600">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No attendance data for this date</p>
                  </td>
                </tr>
              ) : (
                sectionData.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">Class {s.class} - {s.section}</p>
                      <p className="text-xs text-zinc-600">{s.academic_year}</p>
                    </td>
                    <td className="px-4 py-3">
                      {s.submitted ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-yellow-400">
                          <XCircle className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-emerald-400 font-medium">{s.present}</td>
                    <td className="px-4 py-3 text-sm text-red-400 font-medium">{s.absent}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${s.percentage >= 75 ? 'bg-emerald-500' : s.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${s.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-400">{s.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{s.marked_by || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/60">
            <p className="text-xs text-zinc-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </SchoolAdminLayout>
  )
}
