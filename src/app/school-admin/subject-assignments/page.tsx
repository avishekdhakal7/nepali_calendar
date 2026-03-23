'use client'

import { useState, useEffect, startTransition } from 'react'
import { Plus, Search, Trash2, Users, BookOpen, X, GraduationCap, Save } from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { useAuthStore } from '@/store/auth'
import { Staff, ClassTeacherAssignment } from '@/types/staff'
import { AcademicYearWithPrograms, AcademicClass, Section, Subject } from '@/types/academic'
import { SubjectTeacherAssignment } from '@/types/staff'

type Tab = 'subjects' | 'class-teachers'

// ─── Add Assignment Modal ──────────────────────────────────────────────────────
function AddSubjectTeacherModal({ open, onClose, onSave, teachers, subjects, sections, classes, selectedClassId, selectedSectionId }: {
  open: boolean
  onClose: () => void
  onSave: (data: { staff: number; subject: number; section: number }) => void
  teachers: Staff[]
  subjects: Subject[]
  sections: Section[]
  classes: AcademicClass[]
  selectedClassId: number | null
  selectedSectionId: number | null
}) {
  const [classId, setClassId] = useState<number | null>(null)
  const [sectionId, setSectionId] = useState<number | null>(null)
  const [staffId, setStaffId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Inherit page filter context when modal opens; cascade when class changes
  useEffect(() => {
    if (!open) return
    startTransition(() => setClassId(selectedClassId))
    startTransition(() => setSectionId(selectedSectionId))
    startTransition(() => setStaffId(''))
    startTransition(() => setSubjectId(''))
    startTransition(() => setError(''))
  }, [open, selectedClassId, selectedSectionId])

  // When class changes, reset section (new class = new section options)
  useEffect(() => {
    if (!classId) { startTransition(() => setSectionId(null)); return }
    const classSections = sections.filter(s => s.academic_class === classId || String(s.academic_class) === String(classId))
    if (classSections.length === 0) startTransition(() => setSectionId(null))
  }, [classId, sections])

  if (!open) return null

  // Derived filtered lists based on selected class
  const classSections = classId ? sections.filter(s => s.academic_class === classId || String(s.academic_class) === String(classId)) : []
  const classSubjects = classId
    ? subjects.filter(s => s.academic_class === classId || String(s.academic_class) === String(classId))
    : subjects
  const currentClass = classes.find(c => c.id === classId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!staffId || !subjectId) { setError('Teacher and subject are required'); return }
    setSaving(true); setError('')
    await onSave({ staff: Number(staffId), subject: Number(subjectId), section: sectionId ? Number(sectionId) : 0 })
    setSaving(false)
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-5 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Assign Subject Teacher</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        {error && <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Class — only shown when page has no class filter */}
          {!selectedClassId ? (
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Class *</label>
              <select required value={classId ?? ''} onChange={e => setClassId(e.target.value ? Number(e.target.value) : null)} className={inputClass}>
                <option value="">Select class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">Class: <strong>{currentClass?.name}</strong></span>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Subject *</label>
            <select required value={subjectId} onChange={e => setSubjectId(e.target.value)} className={inputClass}>
              <option value="">Select subject</option>
              {classSubjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          {/* Teacher */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Teacher *</label>
            <select required value={staffId} onChange={e => setStaffId(e.target.value)} className={inputClass}>
              <option value="">Select teacher</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name} ({t.active_roles.join(', ')})</option>)}
            </select>
          </div>

          {/* Section — filtered to selected class, optional */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">
              Section {classSections.length > 0 ? <span className="text-zinc-600">(optional)</span> : <span className="text-zinc-600">— no sections for this class</span>}
            </label>
            <select value={sectionId ?? ''} onChange={e => setSectionId(e.target.value ? Number(e.target.value) : null)} className={inputClass} disabled={classSections.length === 0}>
              <option value="">Any section — class-wide</option>
              {classSections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Add Class Teacher Modal ────────────────────────────────────────────────────
function AddClassTeacherModal({ open, onClose, onSave, teachers, sections, classes, selectedClassId, selectedSectionId, academicYear }: {
  open: boolean
  onClose: () => void
  onSave: (data: { staff: number; section: number; academic_year: number }) => void
  teachers: Staff[]
  sections: Section[]
  classes: AcademicClass[]
  selectedClassId: number | null
  selectedSectionId: number | null
  academicYear: number | null
}) {
  const [classId, setClassId] = useState<number | null>(null)
  const [sectionId, setSectionId] = useState<number | null>(null)
  const [staffId, setStaffId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Inherit page filter context when modal opens
  useEffect(() => {
    if (!open) return
    startTransition(() => setClassId(selectedClassId))
    startTransition(() => setSectionId(selectedSectionId))
    startTransition(() => setStaffId(''))
    startTransition(() => setError(''))
  }, [open, selectedClassId, selectedSectionId])

  // Cascade: class selection changes section options
  useEffect(() => {
    if (!classId) { startTransition(() => setSectionId(null)); return }
    const classSections = sections.filter(s => s.academic_class === classId || String(s.academic_class) === String(classId))
    if (classSections.length === 0) startTransition(() => setSectionId(null))
  }, [classId, sections])

  if (!open) return null

  const classSections = classId ? sections.filter(s => s.academic_class === classId || String(s.academic_class) === String(classId)) : []
  const sectionRequired = classSections.length > 0
  const currentClass = classes.find(c => c.id === classId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!staffId) { setError('Teacher is required'); return }
    if (sectionRequired && !sectionId) { setError('Section is required for this class'); return }
    setSaving(true); setError('')
    await onSave({ staff: Number(staffId), section: sectionId ? Number(sectionId) : 0, academic_year: academicYear || 0 })
    setSaving(false)
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-5 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Assign Class Teacher</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        {error && <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Class — only shown when page has no class filter */}
          {!selectedClassId ? (
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Class *</label>
              <select required value={classId ?? ''} onChange={e => { setClassId(e.target.value ? Number(e.target.value) : null); setSectionId(null) }} className={inputClass}>
                <option value="">Select class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300">Class: <strong>{currentClass?.name}</strong></span>
            </div>
          )}

          {/* Teacher */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Teacher *</label>
            <select required value={staffId} onChange={e => setStaffId(e.target.value)} className={inputClass}>
              <option value="">Select teacher</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name} ({t.active_roles.join(', ')})</option>)}
            </select>
          </div>

          {/* Section — filtered to selected class, required only when sections exist */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">
              Section {sectionRequired ? '*' : <span className="text-zinc-600">(optional — no sections for this class)</span>}
            </label>
            <select
              value={sectionId ?? ''}
              onChange={e => setSectionId(e.target.value ? Number(e.target.value) : null)}
              required={sectionRequired}
              disabled={classSections.length === 0}
              className={inputClass}
            >
              <option value="">{sectionRequired ? 'Select section' : 'No sections available'}</option>
              {classSections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function SubjectAssignmentsPage() {
  const { user } = useAuthStore()
  const schoolId = user?.school_id || 1

  const [tab, setTab] = useState<Tab>('subjects')
  const [academicYears, setAcademicYears] = useState<AcademicYearWithPrograms[]>([])
  const [classes, setClasses] = useState<AcademicClass[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Staff[]>([])
  const [subjectAssignments, setSubjectAssignments] = useState<SubjectTeacherAssignment[]>([])
  const [classTeacherAssignments, setClassTeacherAssignments] = useState<ClassTeacherAssignment[]>([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [search, setSearch] = useState('')

  // Modal state
  const [subjectModal, setSubjectModal] = useState<{ open: boolean }>({ open: false })
  const [classModal, setClassModal] = useState<{ open: boolean }>({ open: false })

  useEffect(() => { fetchAcademicYears() }, [])

  async function fetchAcademicYears() {
    try {
      const res = await api.get('/academic-years/', { params: { school: schoolId, ordering: '-start_year' } })
      const years: AcademicYearWithPrograms[] = res.data.results || res.data
      setAcademicYears(years)
      const active = years.find(y => y.is_active)
      if (active) setSelectedYear(String(active.id))
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    if (selectedYear) fetchClasses()
    else { setClasses([]); setSelectedClass('') }
  }, [selectedYear])

  useEffect(() => {
    if (selectedYear) fetchSubjects()
    else setSubjects([])
  }, [selectedYear])

  useEffect(() => {
    if (selectedClass) {
      fetchSections(Number(selectedClass))
    } else {
      setSections([])
      setSelectedSection('')
    }
  }, [selectedClass])

  useEffect(() => {
    fetchTeachers()
  }, [])

  useEffect(() => {
    if (tab === 'subjects') fetchSubjectAssignments()
    else fetchClassTeacherAssignments()
  }, [tab, selectedYear, selectedClass, selectedSection])

  async function fetchClasses() {
    setSelectedClass(''); setSelectedSection('')
    try {
      const res = await api.get('/classes/', { params: { academic_year: selectedYear } })
      setClasses((res.data.results || res.data) as AcademicClass[])
    } catch (e) { console.error(e) }
  }

  async function fetchSections(classId: number) {
    try {
      const res = await api.get('/sections/', { params: { academic_class: classId } })
      setSections((res.data.results || res.data) as Section[])
    } catch (e) { console.error(e) }
  }

  async function fetchSubjects() {
    try {
      const params: Record<string, string> = { academic_year: selectedYear }
      if (selectedClass) params.academic_class = selectedClass
      const res = await api.get('/subjects/', { params })
      setSubjects((res.data.results || res.data) as Subject[])
    } catch (e) { console.error(e) }
  }

  async function fetchTeachers() {
    try {
      const res = await api.get('/staff/', { params: { school: schoolId, role: 'teacher' } })
      const allStaff: Staff[] = res.data.results || res.data
      // Only show staff who have a teacher role (filter client-side)
      setTeachers(allStaff)
    } catch (e) { console.error(e) }
  }

  async function fetchSubjectAssignments() {
    setLoading(true)
    try {
      const params: Record<string, string | number> = {}
      if (selectedYear) params.academic_year = selectedYear
      if (selectedSection) params.section = selectedSection
      const res = await api.get('/subject-teachers/', { params })
      setSubjectAssignments((res.data.results || res.data) as SubjectTeacherAssignment[])
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: string | Record<string, string[]> } }
        console.error('Subject assignments error:', e.response?.data)
      } else {
        console.error(err)
      }
    } finally { setLoading(false) }
  }

  async function fetchClassTeacherAssignments() {
    setLoading(true)
    try {
      const params: Record<string, string | number> = {}
      if (selectedYear) params.academic_year = selectedYear
      if (selectedSection) params.section = selectedSection
      const res = await api.get('/class-teachers/', { params })
      setClassTeacherAssignments(res.data.results || res.data)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: string | Record<string, string[]> } }
        console.error('Class teacher assignments error:', e.response?.data)
      } else {
        console.error(err)
      }
    } finally { setLoading(false) }
  }

  async function handleAddSubjectAssignment(data: { staff: number; subject: number; section: number }) {
    try {
      await api.post('/subject-teachers/', {
        staff: data.staff,
        subject: data.subject,
        section: data.section || null,
        academic_year: selectedYear ? Number(selectedYear) : undefined,
      })
      setSubjectModal({ open: false })
      fetchSubjectAssignments()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: string | Record<string, string[]> } }
        alert((e.response?.data as { error?: string })?.error || 'Failed to assign subject teacher')
      } else {
        alert('Failed to assign subject teacher')
      }
    }
  }

  async function handleDeleteSubjectAssignment(id: number) {
    if (!confirm('Remove this subject assignment?')) return
    try {
      await api.delete(`/subject-teachers/${id}/`)
      fetchSubjectAssignments()
    } catch (err) { console.error(err); alert('Failed to delete') }
  }

  async function handleAddClassTeacher(data: { staff: number; section: number; academic_year: number }) {
    try {
      await api.post('/class-teachers/', {
        staff: data.staff,
        section: data.section || null,
        academic_year: data.academic_year || undefined,
      })
      setClassModal({ open: false })
      fetchClassTeacherAssignments()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: string | Record<string, string[]> } }
        alert((e.response?.data as { error?: string })?.error || 'Failed to assign class teacher')
      } else {
        alert('Failed to assign class teacher')
      }
    }
  }

  async function handleDeleteClassTeacher(id: number) {
    if (!confirm('Remove this class teacher assignment?')) return
    try {
      await api.delete(`/class-teachers/${id}/`)
      fetchClassTeacherAssignments()
    } catch (err) { console.error(err); alert('Failed to delete') }
  }

  const filteredSubjectAssignments = subjectAssignments.filter(a => {
    if (!search) return true
    const s = search.toLowerCase()
    return (a.staff_name || '').toLowerCase().includes(s) ||
      (a.subject_name || '').toLowerCase().includes(s) ||
      (a.section_name || '').toLowerCase().includes(s)
  })

  const filteredClassTeachers = classTeacherAssignments.filter((a: ClassTeacherAssignment) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (a.staff_name || '').toLowerCase().includes(s) ||
      (a.section_name || '').toLowerCase().includes(s)
  })

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  return (
    <SchoolAdminLayout title="Subject & Teacher Assignments" activeRoute="/school-admin/subject-assignments">
      {/* Filters */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Academic Year *</label>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className={inputClass}>
              <option value="">All Years</option>
              {academicYears.map(y => <option key={y.id} value={y.id}>{y.start_year} - {y.end_year}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Class</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={!selectedYear} className={`${inputClass} ${!selectedYear ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Section</label>
            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass} className={`${inputClass} ${!selectedClass ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <option value="">All Sections</option>
              {sections.filter(s => !selectedClass || String(s.academic_class) === selectedClass).map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Search</label>
            <input type="text" placeholder="Teacher or subject..." value={search} onChange={e => setSearch(e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-zinc-900/60 border border-zinc-800/60 rounded-lg p-1">
          <button
            onClick={() => setTab('subjects')}
            className={`px-4 py-1.5 text-sm rounded-md transition-all ${tab === 'subjects' ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-500 hover:text-white'}`}
          >
            <span className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" /> Subject Teachers</span>
          </button>
          <button
            onClick={() => setTab('class-teachers')}
            className={`px-4 py-1.5 text-sm rounded-md transition-all ${tab === 'class-teachers' ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-500 hover:text-white'}`}
          >
            <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Class Teachers</span>
          </button>
        </div>
        <button
          onClick={() => tab === 'subjects' ? setSubjectModal({ open: true }) : setClassModal({ open: true })}
          disabled={tab === 'subjects' ? !subjects.length : !teachers.length}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {tab === 'subjects' ? 'Assign Subject' : 'Assign Class Teacher'}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'subjects' ? (
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Teacher</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Class / Section</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filteredSubjectAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-zinc-600">
                      <BookOpen className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No subject assignments found</p>
                    </td>
                  </tr>
                ) : filteredSubjectAssignments.map(a => (
                  <tr key={a.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-400">{(a.staff_name || 'U')[0]}</span>
                        </div>
                        <span className="text-sm text-white">{a.staff_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{a.subject_name || a.subject} <span className="text-xs text-zinc-600">({a.subject_code})</span></td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{a.class_name} - {a.section_name}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDeleteSubjectAssignment(a.id)} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Teacher</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Class / Section</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filteredClassTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-zinc-600">
                      <Users className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No class teacher assignments found</p>
                    </td>
                  </tr>
                ) : filteredClassTeachers.map((a: ClassTeacherAssignment) => (
                  <tr key={a.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-green-400">{(a.staff_name || 'U')[0]}</span>
                        </div>
                        <span className="text-sm text-white">{a.staff_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{a.class_name} - {a.section_name}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDeleteClassTeacher(a.id)} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddSubjectTeacherModal
        open={subjectModal.open}
        onClose={() => setSubjectModal({ open: false })}
        onSave={handleAddSubjectAssignment}
        teachers={teachers}
        subjects={subjects}
        sections={sections}
        classes={classes}
        selectedClassId={selectedClass ? Number(selectedClass) : null}
        selectedSectionId={selectedSection ? Number(selectedSection) : null}
      />
      <AddClassTeacherModal
        open={classModal.open}
        onClose={() => setClassModal({ open: false })}
        onSave={handleAddClassTeacher}
        teachers={teachers}
        sections={sections}
        classes={classes}
        selectedClassId={selectedClass ? Number(selectedClass) : null}
        selectedSectionId={selectedSection ? Number(selectedSection) : null}
        academicYear={selectedYear ? Number(selectedYear) : null}
      />
    </SchoolAdminLayout>
  )
}
