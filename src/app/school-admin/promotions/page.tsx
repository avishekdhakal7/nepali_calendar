'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, GraduationCap, Users, Search, CheckCircle, XCircle, Award } from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { useAuthStore } from '@/store/auth'
import { AcademicYearWithPrograms, AcademicClass, Section } from '@/types/academic'

type Decision = 'promoted' | 'detained' | 'graduated'

interface EnrollmentRecord {
  id: number
  student: number
  student_name: string
  roll_number: number
  section: number
}

interface StudentDecision {
  enrollment_id: number
  student_name: string
  current_roll: number
  decision: Decision
  new_roll: string
}

export default function PromotionsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const schoolId = user?.school_id || 1

  const [academicYears, setAcademicYears] = useState<AcademicYearWithPrograms[]>([])
  const [fromClasses, setFromClasses] = useState<AcademicClass[]>([])
  const [toClasses, setToClasses] = useState<AcademicClass[]>([])
  const [fromSections, setFromSections] = useState<Section[]>([])
  const [toSections, setToSections] = useState<Section[]>([])
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedFromClass, setSelectedFromClass] = useState<number | null>(null)
  const [selectedFromSection, setSelectedFromSection] = useState<number | null>(null)
  const [selectedToClass, setSelectedToClass] = useState<number | null>(null)
  const [selectedToSection, setSelectedToSection] = useState<number | null>(null)
  const [graduatedToSection, setGraduatedToSection] = useState<number | null>(null)

  const [decisions, setDecisions] = useState<Record<number, StudentDecision>>({})
  const [search, setSearch] = useState('')

  useEffect(() => { fetchAcademicYears() }, [])

  async function fetchAcademicYears() {
    setLoading(true)
    try {
      const res = await api.get('/academic-years/', { params: { school: schoolId, ordering: '-start_year' } })
      const years: AcademicYearWithPrograms[] = res.data.results || res.data
      setAcademicYears(years)
      const active = years.find(y => y.is_active)
      if (active) setSelectedYear(active.id)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Fetch from-classes when year changes
  useEffect(() => {
    if (selectedYear) {
      fetchFromClasses()
    } else {
      setFromClasses([])
      setSelectedFromClass(null)
    }
  }, [selectedYear])

  // Fetch to-classes (next year) when year or from-class changes
  useEffect(() => {
    if (selectedYear) {
      fetchToClasses()
    }
  }, [selectedYear, selectedFromClass])

  useEffect(() => {
    if (selectedFromClass) fetchFromSections()
    else { setFromSections([]); setSelectedFromSection(null) }
  }, [selectedFromClass])

  useEffect(() => {
    if (selectedToClass) fetchToSections()
    else { setToSections([]); setSelectedToSection(null) }
  }, [selectedToClass])

  useEffect(() => {
    if (selectedFromSection) fetchEnrollments()
    else setEnrollments([])
  }, [selectedFromSection])

  async function fetchFromClasses() {
    if (!selectedYear) return
    setSelectedFromClass(null)
    setSelectedFromSection(null)
    try {
      const res = await api.get('/classes/', { params: { academic_year: selectedYear } })
      setFromClasses((res.data.results || res.data) as AcademicClass[])
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchToClasses() {
    if (!selectedYear) return
    setSelectedToClass(null)
    setSelectedToSection(null)
    try {
      const res = await api.get('/classes/', { params: { academic_year: selectedYear } })
      const allClasses: AcademicClass[] = res.data.results || res.data
      // Filter to just the next class (in a real app, we'd use actual next-year data)
      // For now, show same-year classes as target (school admin can pick appropriate one)
      setToClasses(allClasses)
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchFromSections() {
    if (!selectedFromClass) return
    setSelectedFromSection(null)
    try {
      const res = await api.get('/sections/', { params: { academic_class: selectedFromClass } })
      setFromSections((res.data.results || res.data) as Section[])
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchToSections() {
    if (!selectedToClass) return
    setSelectedToSection(null)
    try {
      const res = await api.get('/sections/', { params: { academic_class: selectedToClass } })
      setToSections((res.data.results || res.data) as Section[])
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchEnrollments() {
    if (!selectedFromSection) return
    setLoading(true)
    setDecisions({})
    try {
      const res = await api.get('/enrollments/', {
        params: { section: selectedFromSection, status: 'active' }
      })
      const records = (res.data.results || res.data) as EnrollmentRecord[]

      // Batch fetch all student names at once to avoid N+1 problem
      const studentIds = [...new Set(records.map(e => e.student).filter(Boolean))]
      const studentMap: Record<number, string> = {}

      if (studentIds.length > 0) {
        try {
          // Try to fetch all students in one request if backend supports ?id__in=...
          // Fallback: fetch each student individually but in parallel
          const studentResponses = await Promise.all(
            studentIds.map(id => api.get(`/students/${id}/`).catch(() => ({ data: { full_name: 'Unknown' } })))
          )
          studentResponses.forEach((sRes, i) => {
            studentMap[studentIds[i]] = sRes.data?.full_name || 'Unknown'
          })
        } catch {
          studentIds.forEach(id => { studentMap[id] = 'Unknown' })
        }
      }

      const withNames = records.map(e => ({
        id: e.id,
        student: e.student,
        student_name: studentMap[e.student] || 'Unknown',
        roll_number: e.roll_number || 0,
        section: e.section,
      }))

      setEnrollments(withNames)

      // Initialize decisions with promote and current roll
      const initial: Record<number, StudentDecision> = {}
      withNames.forEach(r => {
        initial[r.id] = {
          enrollment_id: r.id,
          student_name: r.student_name,
          current_roll: r.roll_number,
          decision: 'promoted',
          new_roll: String(r.roll_number),
        }
      })
      setDecisions(initial)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function updateDecision(enrollmentId: number, field: keyof StudentDecision, value: string | Decision) {
    setDecisions(prev => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], [field]: value }
    }))
  }

  function setAllDecision(decision: Decision) {
    const updated: Record<number, StudentDecision> = {}
    Object.values(decisions).forEach(d => {
      updated[d.enrollment_id] = { ...d, decision }
    })
    setDecisions(updated)
  }

  async function handleSubmit() {
    if (Object.keys(decisions).length === 0) return

    const graduatedIds = Object.values(decisions)
      .filter(d => d.decision === 'graduated')
      .map(d => d.enrollment_id)

    // For graduation, we don't need a to_section
    const bulkPayload = {
      from_section: selectedFromSection,
      to_section: graduatedIds.length === Object.keys(decisions).length ? null : selectedToSection,
      decisions: Object.values(decisions).map(d => ({
        enrollment_id: d.enrollment_id,
        status: d.decision,
        roll_number: d.decision === 'graduated' ? null : (d.new_roll ? Number(d.new_roll) : null),
      })),
    }

    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.post('/promotions/bulk-promote/', bulkPayload)
      setSuccess(res.data.message || `${res.data.count} students processed successfully.`)
      // Refresh enrollments
      fetchEnrollments()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: string | Record<string, string[]> } }
        const data = e.response?.data
        if (typeof data === 'string') {
          setError(data)
        } else if (data) {
          const record = data as Record<string, string[]>
          setError(Array.isArray(record.error) ? record.error.join(', ') : (record.error || JSON.stringify(data)))
        } else {
          setError('Failed to process promotions')
        }
      } else {
        setError('Failed to process promotions')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const filteredDecisions = Object.values(decisions).filter(d =>
    d.student_name.toLowerCase().includes(search.toLowerCase())
  )

  const promotedCount = Object.values(decisions).filter(d => d.decision === 'promoted').length
  const detainedCount = Object.values(decisions).filter(d => d.decision === 'detained').length
  const graduatedCount = Object.values(decisions).filter(d => d.decision === 'graduated').length

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  return (
    <SchoolAdminLayout title="Bulk Promotions" activeRoute="/school-admin/students">
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
      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400">
          {success}
        </div>
      )}

      {/* Section Selectors */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-blue-400" />
          Promotion Setup
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* From Section */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">From Class *</label>
            <select
              value={selectedFromClass || ''}
              onChange={e => setSelectedFromClass(Number(e.target.value) || null)}
              disabled={!selectedYear}
              className={`${inputClass} ${!selectedYear ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Select Class</option>
              {fromClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">From Section *</label>
            <select
              value={selectedFromSection || ''}
              onChange={e => setSelectedFromSection(Number(e.target.value) || null)}
              disabled={!selectedFromClass}
              className={`${inputClass} ${!selectedFromClass ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Select Section</option>
              {fromSections.map(s => (
                <option key={s.id} value={s.id}>
                  Section {s.name} {s.total_students ? `(${s.total_students} students)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* To Section (not needed for graduation-only) */}
          {!(Object.values(decisions).length > 0 && graduatedCount === Object.values(decisions).length) && (
            <>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">To Class *</label>
                <select
                  value={selectedToClass || ''}
                  onChange={e => setSelectedToClass(Number(e.target.value) || null)}
                  disabled={!selectedFromClass}
                  className={`${inputClass} ${!selectedFromClass ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select Target Class</option>
                  {toClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">To Section *</label>
                <select
                  value={selectedToSection || ''}
                  onChange={e => setSelectedToSection(Number(e.target.value) || null)}
                  disabled={!selectedToClass}
                  className={`${inputClass} ${!selectedToClass ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select Target Section</option>
                  {toSections.map(s => (
                    <option key={s.id} value={s.id}>Section {s.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Students with Decisions */}
      {selectedFromSection && (
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800/60 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Students ({enrollments.length})
              </h3>
              {/* Quick stats */}
              {enrollments.length > 0 && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle className="w-3 h-3" /> {promotedCount} promote
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <XCircle className="w-3 h-3" /> {detainedCount} detain
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Award className="w-3 h-3" /> {graduatedCount} graduate
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              {enrollments.length > 0 && (
                <div className="flex gap-1">
                  {(['promoted', 'detained', 'graduated'] as Decision[]).map(d => (
                    <button
                      key={d}
                      onClick={() => setAllDecision(d)}
                      className="px-2 py-1.5 text-xs rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors capitalize"
                    >
                      All {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : enrollments.length === 0 ? (
            <div className="py-12 text-center text-zinc-600">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No active enrollments in this section.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Current Roll</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Decision</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">New Roll</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {filteredDecisions.map(d => (
                    <tr key={d.enrollment_id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-400">{d.student_name[0]}</span>
                          </div>
                          <span className="text-sm font-medium text-white">{d.student_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400 font-mono">{d.current_roll}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {(['promoted', 'detained', 'graduated'] as Decision[]).map(decision => (
                            <button
                              key={decision}
                              onClick={() => updateDecision(d.enrollment_id, 'decision', decision)}
                              className={`px-2.5 py-1.5 text-xs rounded-lg transition-all capitalize ${
                                d.decision === decision
                                  ? decision === 'promoted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
                                    : decision === 'detained' ? 'bg-red-500/20 text-red-400 border border-red-500'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500'
                                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-transparent'
                              }`}
                            >
                              {decision}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {d.decision !== 'graduated' ? (
                          <input
                            type="number"
                            placeholder="Roll #"
                            value={d.new_roll}
                            onChange={e => updateDecision(d.enrollment_id, 'new_roll', e.target.value)}
                            className="w-24 px-2 py-1.5 bg-zinc-900/80 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50"
                            min="1"
                          />
                        ) : (
                          <span className="text-xs text-zinc-600 italic">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Submit */}
          {enrollments.length > 0 && (
            <div className="p-4 border-t border-zinc-800/60 flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                {Object.keys(decisions).length} students to process
              </p>
              <button
                onClick={handleSubmit}
                disabled={submitting || (graduatedCount !== Object.keys(decisions).length && !selectedToSection)}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {submitting ? 'Processing...' : 'Process Promotions'}
              </button>
            </div>
          )}
        </div>
      )}
    </SchoolAdminLayout>
  )
}
