'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Users, Search, ChevronRight, GraduationCap } from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { useAuthStore } from '@/store/auth'
import { Student } from '@/types/student'
import { AcademicYearWithPrograms, AcademicClass, Section } from '@/types/academic'

export default function EnrollStudentPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const schoolId = user?.school_id || 1

  const [academicYears, setAcademicYears] = useState<AcademicYearWithPrograms[]>([])
  const [classes, setClasses] = useState<AcademicClass[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<Record<number, boolean>>({})
  const [error, setError] = useState('')

  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [selectedSection, setSelectedSection] = useState<number | null>(null)
  const [rollNumbers, setRollNumbers] = useState<Record<number, string>>({})
  const [search, setSearch] = useState('')

  useEffect(() => { fetchAcademicYears() }, [])

  async function fetchAcademicYears() {
    setLoading(true)
    try {
      const res = await api.get('/academic-years/', { params: { school: schoolId, ordering: '-start_year' } })
      const years: AcademicYearWithPrograms[] = res.data.results || res.data
      setAcademicYears(years)
      const active = years.find(y => y.is_active)
      if (active) {
        setSelectedYear(active.id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedYear) fetchClasses()
    else setClasses([])
  }, [selectedYear])

  useEffect(() => {
    if (selectedClass) fetchSections()
    else setSections([])
  }, [selectedClass])

  useEffect(() => {
    if (selectedSection) fetchUnenrolledStudents()
    else setStudents([])
  }, [selectedSection])

  async function fetchClasses() {
    setSelectedClass(null)
    setSelectedSection(null)
    setStudents([])
    try {
      const res = await api.get('/classes/', { params: { academic_year: selectedYear } })
      setClasses((res.data.results || res.data) as AcademicClass[])
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchSections() {
    setSelectedSection(null)
    setStudents([])
    try {
      const res = await api.get('/sections/', { params: { academic_class: selectedClass } })
      setSections((res.data.results || res.data) as Section[])
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchUnenrolledStudents() {
    setLoading(true)
    try {
      // Fetch all students in this school, then filter out those already enrolled in this section
      const [allRes, enrolledRes] = await Promise.all([
        api.get('/students/', { params: { school: schoolId, search } }),
        api.get('/enrollments/', { params: { section: selectedSection, status: 'active' } }),
      ])
      const allStudents: Student[] = allRes.data.results || allRes.data
      const enrolledIds = new Set(
        ((enrolledRes.data.results || enrolledRes.data) as Array<{ student: number }>).map(e => e.student)
      )
      setStudents(allStudents.filter(s => !enrolledIds.has(s.id) && s.is_active))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedSection) {
      const timer = setTimeout(() => { fetchUnenrolledStudents() }, 300)
      return () => clearTimeout(timer)
    }
  }, [search, selectedSection])

  async function handleEnroll(studentId: number) {
    const roll = rollNumbers[studentId]
    if (!roll) return
    setEnrolling(prev => ({ ...prev, [studentId]: true }))
    setError('')
    try {
      await api.post('/enrollments/', {
        student: studentId,
        section: selectedSection,
        roll_number: Number(roll),
        status: 'active',
      })
      setStudents(prev => prev.filter(s => s.id !== studentId))
      const newRoll = { ...rollNumbers }
      delete newRoll[studentId]
      setRollNumbers(newRoll)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: string | Record<string, string[]> } }
        setError(e.response?.data ? JSON.stringify(e.response.data) : 'Failed to enroll student')
      } else {
        setError('Failed to enroll student')
      }
    } finally {
      setEnrolling(prev => ({ ...prev, [studentId]: false }))
    }
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  return (
    <SchoolAdminLayout title="Enroll Student" activeRoute="/school-admin/students">
      <button
        onClick={() => router.push('/school-admin/students')}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Students
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Selectors */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-blue-400" />
          Select Section
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Academic Year *</label>
            <select
              value={selectedYear || ''}
              onChange={e => setSelectedYear(Number(e.target.value) || null)}
              className={inputClass}
            >
              <option value="">Select Year</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>
                  {y.start_year} - {y.end_year} {y.is_active ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Class *</label>
            <select
              value={selectedClass || ''}
              onChange={e => setSelectedClass(Number(e.target.value) || null)}
              disabled={!selectedYear}
              className={`${inputClass} ${!selectedYear ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Section *</label>
            <select
              value={selectedSection || ''}
              onChange={e => setSelectedSection(Number(e.target.value) || null)}
              disabled={!selectedClass}
              className={`${inputClass} ${!selectedClass ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Select Section</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>
                  Section {s.name} {s.class_teacher ? `(${s.class_teacher.full_name})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student List */}
      {selectedSection && (
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Unenrolled Students
            </h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by name or admission no..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-zinc-600">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">
                {selectedYear && selectedClass && selectedSection
                  ? 'No unenrolled students found, or all students are already enrolled in this section.'
                  : 'Select an academic year, class, and section to see available students.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Admission No.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Gender</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Current Class</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Roll No.</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-400">{s.full_name[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{s.full_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400 font-mono">{s.admission_number}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400 capitalize">{s.gender}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">
                        {s.current_class ? `${s.current_class.class}-${s.current_class.section}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          placeholder="Roll #"
                          value={rollNumbers[s.id] || ''}
                          onChange={e => setRollNumbers(prev => ({ ...prev, [s.id]: e.target.value }))}
                          className="w-24 px-2 py-1.5 bg-zinc-900/80 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50"
                          min="1"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEnroll(s.id)}
                          disabled={!rollNumbers[s.id] || enrolling[s.id]}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors ml-auto"
                        >
                          {enrolling[s.id] ? (
                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Save className="w-3 h-3" />
                          )}
                          Enroll
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </SchoolAdminLayout>
  )
}
