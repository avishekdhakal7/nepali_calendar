'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react'
import TeacherLayout from '@/components/layout/teacher-layout'
import api from '@/lib/api'
import type { AxiosError } from 'axios'
import { adToBsApi } from '@/lib/date-utils'
import BsCalendarGrid from '@/components/calendar/BsCalendarGrid'
import type { DateClickResult } from '@/components/calendar/BsCalendarGrid'

interface Section {
  id: number
  class_name: string
  section: string
  section_id: number
  academic_year: string
}

interface Enrollment {
  id: number
  student: number
  student_name?: string
  roll_number: number
  status: string
  class_name: string
  section_name: string
}

export default function TeacherAttendancePage() {
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSection, setSelectedSection] = useState<number | null>(null)
  const [students, setStudents] = useState<Enrollment[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [dateBs, setDateBs] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSections()
  }, [])

  async function fetchSections() {
    setLoading(true)
    try {
      const res = await api.get('/my-classes/')
      const data = res.data.results || res.data || []
      setSections(data)
      if (data.length > 0) {
        setSelectedSection(data[0].section_id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedSection) {
      fetchStudents()
    }
  }, [selectedSection])

  async function fetchStudents() {
    if (!selectedSection) return
    setLoading(true)
    try {
      const res = await api.get(`/enrollments/?section=${selectedSection}&status=active`)
      const data = (res.data.results || res.data || []) as Enrollment[]
      const studentIds = data.map((e) => e.student).filter(Boolean)
      const studentsRes = await api.get(`/students/?ids=${studentIds.join(',')}`).catch(() => ({ data: { results: [] } }))
      const studentMap: Record<number, string> = {}
      ;(studentsRes.data.results || []).forEach((s: { id: number; full_name: string }) => { studentMap[s.id] = s.full_name })
      setStudents(data.map((e) => ({
        id: e.id,
        student: e.student,
        student_name: studentMap[e.student] || 'Unknown',
        roll_number: e.roll_number || 0,
        status: 'present',
        class_name: e.class_name,
        section_name: e.section_name,
      })))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function updateStatus(id: number, status: string) {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s))
  }

  function handleDateChange(dateStr: string) {
    setSelectedDate(dateStr)
    adToBsApi(new Date(dateStr)).then(setDateBs).catch(() => setDateBs(''))
  }

  async function handleSave() {
    if (!selectedSection) return
    setSaving(true)
    try {
      await api.post('/daily-attendance/bulk-mark/', {
        section: selectedSection,
        date_ad: selectedDate,
        date_bs: dateBs,
        records: students.map(s => ({
          enrollment_id: s.id,
          status: s.status,
        })),
      })
      alert('Attendance saved successfully!')
    } catch (e: unknown) {
      console.error(e)
      const err = e as AxiosError
      alert((err.response?.data as { error?: string })?.error || 'Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const presentCount = students.filter(s => s.status === 'present').length
  const absentCount = students.filter(s => s.status === 'absent').length
  const leaveCount = students.filter(s => s.status === 'leave').length

  return (
    <TeacherLayout title="Mark Attendance" activeRoute="/teacher/attendance">
      {/* Controls */}
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Select Class</label>
              <select
                value={selectedSection || ''}
                onChange={e => setSelectedSection(parseInt(e.target.value))}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white"
              >
                {sections.map(s => (
                  <option key={s.section_id} value={s.section_id}>
                    {s.class_name} — Section {s.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Select Date</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => handleDateChange(e.target.value)}
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
                />
                {dateBs && (
                  <span className="text-amber-400 text-sm font-medium">({dateBs})</span>
                )}
              </div>
            </div>
          </div>

          {students.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="w-4 h-4" /> {presentCount}
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <XCircle className="w-4 h-4" /> {absentCount}
                </span>
                <span className="flex items-center gap-1 text-yellow-400">
                  <Clock className="w-4 h-4" /> {leaveCount}
                </span>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          )}
        </div>
        <div className="w-full max-w-sm">
          <BsCalendarGrid
            selectedAdDate={selectedDate}
            onDateSelect={(result: DateClickResult) => { setSelectedDate(result.bs.ad); setDateBs(result.bs.bs) }}
          />
        </div>
      </div>

      {/* Students List */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800/60">
          <h2 className="text-sm font-semibold text-white">
            Students ({students.length})
          </h2>
        </div>
        <div className="divide-y divide-zinc-800/40">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-48" />
                <div className="h-8 bg-zinc-800 rounded w-24" />
              </div>
            ))
          ) : students.length === 0 ? (
            <div className="px-5 py-12 text-center text-zinc-600">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No students found</p>
            </div>
          ) : (
            students.map((student) => (
              <div key={student.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-500 w-8">{student.roll_number}</span>
                  <span className="text-sm text-white">{student.student_name}</span>
                </div>
                <div className="flex gap-1">
                  {['present', 'absent', 'leave'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateStatus(student.id, status)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                        student.status === status
                          ? status === 'present' ? 'bg-green-500/20 text-green-400 border border-green-500' :
                            status === 'absent' ? 'bg-red-500/20 text-red-400 border border-red-500' :
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </TeacherLayout>
  )
}
