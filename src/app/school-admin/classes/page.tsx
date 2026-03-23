'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, ChevronDown,
  BookOpen, Users, GraduationCap, Calendar,
  Trash2, Edit2, X, Save
} from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { useAuthStore } from '@/store/auth'
import { AcademicYearWithPrograms, AcademicClass, Section, Subject, Program } from '@/types/academic'

type Tab = 'classes' | 'programs'

export default function ClassesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const schoolId = user?.school_id

  // Bulk subject row — stable IDs via useRef to avoid module-level stale state across HMR
  type BulkSubjectRow = { id: number; name: string; code: string; credit_hours: string; is_optional: boolean }
  const bulkIdRef = useRef(0)
  const newBulkSubjectRow = useCallback((): BulkSubjectRow => {
    return { id: ++bulkIdRef.current, name: '', code: '', credit_hours: '', is_optional: false }
  }, [])

  const addBulkRow = () => setBulkSubjects(prev => [...prev, newBulkSubjectRow()])

  const [tab, setTab] = useState<Tab>('classes')
  const [academicYears, setAcademicYears] = useState<AcademicYearWithPrograms[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedYear, setExpandedYear] = useState<number | null>(null)
  const [expandedClass, setExpandedClass] = useState<number | null>(null)
  const [classSubjects, setClassSubjects] = useState<Map<number, Subject[]>>(new Map())

  // Modals
  const [showYearModal, setShowYearModal] = useState(false)
  const [showClassModal, setShowClassModal] = useState(false)
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [showBulkSubjectModal, setShowBulkSubjectModal] = useState(false)
  // bulkSubjects uses stable object identity per row to avoid inline-closure stale-state
  // Each row: { id, name, code, credit_hours, is_optional }
  const [bulkSubjects, setBulkSubjects] = useState<BulkSubjectRow[]>([
    newBulkSubjectRow()
  ])
  const [editingYear, setEditingYear] = useState<AcademicYearWithPrograms | null>(null)
  const [editingClass, setEditingClass] = useState<{ yearId: number; cls: AcademicClass } | null>(null)
  const [editingSection, setEditingSection] = useState<{ classId: number; section: Section } | null>(null)
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null)
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)

  // Year form
  const [yearForm, setYearForm] = useState({ start_year: '', end_year: '', is_active: false })
  const [yearError, setYearError] = useState('')
  // Class form
  const [classForm, setClassForm] = useState({ name: '' })
  // Section form
  const [sectionForm, setSectionForm] = useState({ name: '' })

  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = useCallback(async () => {
    if (!schoolId) return
    setLoading(true)
    try {
      const [yearRes, progRes] = await Promise.all([
        api.get('/academic-years/', { params: { school: schoolId, ordering: '-start_year' } }),
        tab === 'programs' ? api.get('/programs/', { params: { academic_year: expandedYear || '' } }) : Promise.resolve({ data: { results: [] } }),
      ])
      setAcademicYears(yearRes.data.results || yearRes.data)
      setPrograms(progRes.data.results || progRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [schoolId, tab, expandedYear])

  async function fetchYearClasses(yearId: number) {
    try {
      const res = await api.get('/classes/', { params: { academic_year: yearId } })
      const classes: AcademicClass[] = res.data.results || res.data
      // For each class, fetch sections
      const withSections = await Promise.all(
        classes.map(async (cls) => {
          try {
            const secRes = await api.get('/sections/', { params: { academic_class: cls.id } })
            return { ...cls, sections: (secRes.data.results || secRes.data) as Section[] }
          } catch {
            return { ...cls, sections: [] }
          }
        })
      )
      return withSections
    } catch {
      return []
    }
  }

  async function fetchYearPrograms(yearId: number) {
    try {
      const res = await api.get('/programs/', { params: { academic_year: yearId } })
      return (res.data.results || res.data) as Program[]
    } catch {
      return []
    }
  }

  async function fetchClassSubjects(classId: number, yearId: number) {
    try {
      const res = await api.get('/subjects/', { params: { academic_year: yearId, academic_class: classId } })
      const subs: Subject[] = res.data.results || res.data
      setClassSubjects(prev => new Map(prev).set(classId, subs))
    } catch {
      setClassSubjects(prev => new Map(prev).set(classId, []))
    }
  }

  async function toggleYear(yearId: number) {
    if (expandedYear === yearId) {
      setExpandedYear(null)
    } else {
      setExpandedYear(yearId)
      // Check if we already have classes loaded
      const year = academicYears.find(y => y.id === yearId)
      if (year && !year.classes) {
        const withSections = await fetchYearClasses(yearId)
        setAcademicYears(prev => prev.map(y =>
          y.id === yearId ? { ...y, classes: withSections } : y
        ))
      }
      if (year && !year.programs) {
        const progs = await fetchYearPrograms(yearId)
        setAcademicYears(prev => prev.map(y =>
          y.id === yearId ? { ...y, programs: progs } : y
        ))
      }
    }
  }

  async function toggleClass(classId: number, yearId: number) {
    if (expandedClass === classId) {
      setExpandedClass(null)
    } else {
      setExpandedClass(classId)
      if (!classSubjects.has(classId)) {
        await fetchClassSubjects(classId, yearId)
      }
    }
  }

  const handleSaveYear = useCallback(async () => {
    setSaving(true)
    try {
      const payload = {
        start_year: Number(yearForm.start_year),
        end_year: Number(yearForm.end_year),
        is_active: yearForm.is_active,
      }
      if (editingYear) {
        await api.patch(`/academic-years/${editingYear.id}/`, payload)
      } else {
        await api.post('/academic-years/', payload)
      }
      setShowYearModal(false)
      setYearForm({ start_year: '', end_year: '', is_active: false })
      setEditingYear(null)
      fetchData()
    } catch (err) {
      const msg = (err as { response?: { data?: string | Record<string, string[]> } })
        ?.response?.data
        ? JSON.stringify((err as { response?: { data?: Record<string, string[]> } }).response?.data)
        : 'Failed to save academic year'
      setYearError(msg)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }, [yearForm, editingYear])

  const handleSaveClass = useCallback(async () => {
    setSaving(true)
    try {
      const payload = { academic_year: selectedYearId, name: classForm.name }
      if (editingClass) {
        await api.patch(`/classes/${editingClass.cls.id}/`, payload)
      } else {
        await api.post('/classes/', payload)
      }
      setShowClassModal(false)
      setClassForm({ name: '' })
      setEditingClass(null)
      if (expandedYear) {
        const withSections = await fetchYearClasses(expandedYear)
        setAcademicYears(prev => prev.map(y =>
          y.id === expandedYear ? { ...y, classes: withSections } : y
        ))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }, [selectedYearId, classForm.name, editingClass, expandedYear])

  const handleSaveSection = useCallback(async () => {
    setSaving(true)
    try {
      const payload = { academic_class: selectedClassId, name: sectionForm.name }
      if (editingSection) {
        await api.patch(`/sections/${editingSection.section.id}/`, payload)
      } else {
        await api.post('/sections/', payload)
      }
      setShowSectionModal(false)
      setSectionForm({ name: '' })
      setEditingSection(null)
      if (expandedYear && selectedClassId) {
        const withSections = await fetchYearClasses(expandedYear)
        setAcademicYears(prev => prev.map(y =>
          y.id === expandedYear ? { ...y, classes: withSections } : y
        ))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }, [selectedClassId, sectionForm.name, editingSection, expandedYear])

  const handleBulkSaveSubjects = useCallback(async () => {
    const rowsToSave = bulkSubjects.filter(r => r.name.trim() && r.code.trim())
    if (!rowsToSave.length) return
    setSaving(true)
    try {
      if (editingSubjectId !== null) {
        const row = rowsToSave[0]
        await api.patch(`/subjects/${editingSubjectId}/`, {
          name: row.name.trim(),
          code: row.code.trim(),
          is_optional: row.is_optional,
          credit_hours: row.credit_hours ? Number(row.credit_hours) : undefined,
        })
      } else {
        await Promise.all(rowsToSave.map(row =>
          api.post('/subjects/', {
            academic_year: selectedYearId,
            academic_class: selectedClassId,
            name: row.name.trim(),
            code: row.code.trim(),
            is_optional: row.is_optional,
            credit_hours: row.credit_hours ? Number(row.credit_hours) : undefined,
          })
        ))
      }
      setShowBulkSubjectModal(false)
      setBulkSubjects([newBulkSubjectRow()])
      setEditingSubjectId(null)
      if (selectedClassId && selectedYearId) {
        await fetchClassSubjects(selectedClassId, selectedYearId)
      }
    } catch (err) {
      console.error(err)
      const msg = (err as { response?: { data?: string | Record<string, string[]> } })?.response?.data
        ? JSON.stringify((err as { response?: { data?: Record<string, string[]> } }).response?.data)
        : 'Failed to save. Please check the form.'
      alert(msg)
    } finally {
      setSaving(false)
    }
  }, [bulkSubjects, editingSubjectId, selectedYearId, selectedClassId])

  const handleSetActiveYear = useCallback(async (id: number) => {
    try {
      await api.post(`/academic-years/${id}/set-active/`)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }, [])

  const handleDeleteYear = useCallback(async (id: number) => {
    if (!confirm('Delete this academic year? This will affect all classes and sections.')) return
    try {
      await api.delete(`/academic-years/${id}/`)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }, [])

  const handleDeleteClass = useCallback(async (yearId: number, classId: number) => {
    if (!confirm('Delete this class and its sections?')) return
    try {
      await api.delete(`/classes/${classId}/`)
      const withSections = await fetchYearClasses(yearId)
      setAcademicYears(prev => prev.map(y =>
        y.id === yearId ? { ...y, classes: withSections } : y
      ))
    } catch (err) {
      console.error(err)
    }
  }, [])

  const handleDeleteSection = useCallback(async (classId: number, sectionId: number) => {
    if (!confirm('Delete this section?')) return
    try {
      await api.delete(`/sections/${sectionId}/`)
      if (expandedYear) {
        const withSections = await fetchYearClasses(expandedYear)
        setAcademicYears(prev => prev.map(y =>
          y.id === expandedYear ? { ...y, classes: withSections } : y
        ))
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const openAddYear = useCallback(() => {
    setEditingYear(null)
    setYearForm({ start_year: '', end_year: '', is_active: false })
    setYearError('')
    setShowYearModal(true)
  }, [])

  const openEditYear = useCallback((year: AcademicYearWithPrograms) => {
    setEditingYear(year)
    setYearForm({ start_year: String(year.start_year), end_year: String(year.end_year), is_active: year.is_active })
    setYearError('')
    setShowYearModal(true)
  }, [])

  const openAddClass = useCallback((yearId: number) => {
    setSelectedYearId(yearId)
    setEditingClass(null)
    setClassForm({ name: '' })
    setShowClassModal(true)
  }, [])

  const openEditClass = useCallback((yearId: number, cls: AcademicClass) => {
    setSelectedYearId(yearId)
    setEditingClass({ yearId, cls })
    setClassForm({ name: cls.name })
    setShowClassModal(true)
  }, [])

  const openAddSection = useCallback((classId: number) => {
    setSelectedClassId(classId)
    setEditingSection(null)
    setSectionForm({ name: '' })
    setShowSectionModal(true)
  }, [])

  const openBulkAddSubject = useCallback((classId: number, yearId: number, subject?: Subject) => {
    setSelectedClassId(classId)
    setSelectedYearId(yearId)
    if (subject) {
      setEditingSubjectId(subject.id)
      setBulkSubjects([{ id: 0, name: subject.name, code: subject.code, credit_hours: String(subject.credit_hours || ''), is_optional: subject.is_optional }])
    } else {
      setEditingSubjectId(null)
      setBulkSubjects([newBulkSubjectRow()])
    }
    setShowBulkSubjectModal(true)
  }, [])

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!open) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-5 w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          {children}
        </div>
      </div>
    )
  }

  return (
    <SchoolAdminLayout title="Classes & Sections" activeRoute="/school-admin/classes">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-zinc-400">
            Manage academic years, classes, sections, and subjects
          </h2>
        </div>
        <button
          onClick={openAddYear}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Academic Year
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : academicYears.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-12 text-center">
          <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-white mb-1">No Academic Years</h3>
          <p className="text-xs text-zinc-500 mb-4">Create your first academic year to start managing classes and sections.</p>
          <button onClick={openAddYear} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
            Add Academic Year
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {academicYears.map(year => (
            <div key={year.id} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
              {/* Year Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                onClick={() => toggleYear(year.id)}
              >
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${expandedYear === year.id ? '' : '-rotate-90'}`} />
                <div className="flex items-center gap-2 flex-1">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">
                    {year.start_year} - {year.end_year}
                  </span>
                  {year.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Active</span>
                  )}
                </div>
                <span className="text-xs text-zinc-500">
                  {year.classes?.length || 0} classes
                </span>
                <div className="flex items-center gap-1">
                  {!year.is_active && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSetActiveYear(year.id) }}
                      className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditYear(year) }}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteYear(year.id) }}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded: Classes */}
              {expandedYear === year.id && (
                <div className="border-t border-zinc-800/40">
                  {/* Add Class Button */}
                  <div className="px-6 py-2 border-b border-zinc-800/30">
                    <button
                      onClick={() => openAddClass(year.id)}
                      className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Class
                    </button>
                  </div>

                  {year.classes && year.classes.length > 0 ? (
                    year.classes.map(cls => (
                      <div key={cls.id}>
                        {/* Class Row */}
                        <div
                          className="flex items-center gap-3 px-6 py-2.5 hover:bg-zinc-800/20 transition-colors cursor-pointer border-b border-zinc-800/20"
                          onClick={() => toggleClass(cls.id, year.id)}
                        >
                          <ChevronDown className={`w-3.5 h-3.5 text-zinc-600 transition-transform ${expandedClass === cls.id ? '' : '-rotate-90'}`} />
                          <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                          <span className="text-sm text-zinc-300 flex-1">{cls.name}</span>
                          <span className="text-xs text-zinc-600">
                            {cls.sections?.length || 0} sections
                            {classSubjects.get(cls.id)?.length ? ` · ${classSubjects.get(cls.id)!.length} subjects` : ''}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); openAddSection(cls.id) }}
                              className="p-1 rounded text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10"
                              title="Add Section"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); openBulkAddSubject(cls.id, year.id) }}
                              className="p-1 rounded text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                              title="Add / Edit Subjects"
                            >
                              <GraduationCap className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); openEditClass(year.id, cls) }}
                              className="p-1 rounded text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteClass(year.id, cls.id) }}
                              className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded: Sections */}
                        {expandedClass === cls.id && cls.sections && (
                          <div className="bg-zinc-950/40">
                            {cls.sections.length > 0 ? (
                              cls.sections.map(sec => (
                                <div
                                  key={sec.id}
                                  className="flex items-center gap-3 px-10 py-2 hover:bg-zinc-800/20 transition-colors border-b border-zinc-800/10"
                                >
                                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                                  <span className="text-sm text-zinc-400 flex-1">
                                    Section {sec.name}
                                  </span>
                                  <span className="text-xs text-zinc-600">
                                    {sec.total_students || 0} students
                                  </span>
                                  {sec.class_teacher && (
                                    <span className="text-xs text-zinc-500">
                                      CT: {sec.class_teacher.full_name}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => { /* TODO: edit section */ }}
                                    className="p-1 rounded text-zinc-600 hover:text-blue-400"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSection(cls.id, sec.id)}
                                    className="p-1 rounded text-zinc-600 hover:text-red-400"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="px-10 py-3 text-xs text-zinc-600">No sections yet</div>
                            )}
                          </div>
                        )}

                        {/* Expanded: Subjects */}
                        {expandedClass === cls.id && (
                          <div className="bg-zinc-950/20 border-t border-zinc-800/10">
                            <div className="px-8 py-2">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Subjects</span>
                              </div>
                              {classSubjects.get(cls.id)?.length ? (
                                <div className="space-y-1">
                                  {classSubjects.get(cls.id)!.map(sub => (
                                    <div key={sub.id} className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-zinc-800/30 group">
                                      <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                                      <span className="text-sm text-zinc-300 flex-1">{sub.name}</span>
                                      <span className="text-xs text-zinc-600">{sub.code}</span>
                                      {sub.is_optional && (
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">Optional</span>
                                      )}
                                      <span className="text-xs text-zinc-600">{sub.credit_hours ? `${sub.credit_hours} hrs` : ''}</span>
                                      <button
                                        onClick={() => openBulkAddSubject(cls.id, year.id, sub)}
                                        className="p-1 rounded text-zinc-600 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={async () => { if (confirm(`Delete subject "${sub.name}"?`)) { try { await api.delete(`/subjects/${sub.id}/`); if (selectedYearId) await fetchClassSubjects(cls.id, selectedYearId) } catch (err) { console.error(err) } } }}
                                        className="p-1 rounded text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-zinc-600 py-2">No subjects yet. Click the + icon in the class row to add subjects.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-xs text-zinc-600">No classes yet. Click {"Add Class"} above.</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Year Modal */}
      <Modal open={showYearModal} onClose={() => setShowYearModal(false)} title={editingYear ? 'Edit Academic Year' : 'Add Academic Year'}>
        <div className="space-y-4">
          {yearError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {yearError}
            </div>
          )}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Start Year *</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={yearForm.start_year}
              onChange={e => setYearForm(p => ({ ...p, start_year: e.target.value }))}
              className={inputClass}
              placeholder="e.g. 2024"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">End Year *</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={yearForm.end_year}
              onChange={e => setYearForm(p => ({ ...p, end_year: e.target.value }))}
              className={inputClass}
              placeholder="e.g. 2025"
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={yearForm.is_active} onChange={e => setYearForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded border-zinc-700 bg-zinc-900 text-blue-500" />
            <label htmlFor="is_active" className="text-xs text-zinc-400">Set as active academic year</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowYearModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            <button onClick={handleSaveYear} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Class Modal */}
      <Modal open={showClassModal} onClose={() => setShowClassModal(false)} title={editingClass ? 'Edit Class' : 'Add Class'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Class Name *</label>
            <input value={classForm.name} onChange={e => setClassForm({ name: e.target.value })} className={inputClass} placeholder="Hint : Don't Type Class 1 instead use only number 1 " />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowClassModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            <button onClick={handleSaveClass} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Section Modal */}
      <Modal open={showSectionModal} onClose={() => setShowSectionModal(false)} title={editingSection ? 'Edit Section' : 'Add Section'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Section Name *</label>
            <input value={sectionForm.name} onChange={e => setSectionForm({ name: e.target.value })} className={inputClass} placeholder="e.g. A, B, C" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowSectionModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            <button onClick={handleSaveSection} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Subject Modal — also used for single add/edit */}
      <Modal
        open={showBulkSubjectModal}
        onClose={() => { setShowBulkSubjectModal(false); setBulkSubjects([newBulkSubjectRow()]); setEditingSubjectId(null) }}
        title={editingSubjectId !== null ? 'Edit Subject' : 'Add Subjects'}
      >
        <div className="space-y-4">
          {editingSubjectId !== null ? (
            <p className="text-xs text-zinc-500">Editing a subject. Change the values below and save.</p>
          ) : (
            <p className="text-xs text-zinc-500">Add one or more subjects. Leave name and code blank to skip a row.</p>
          )}
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {bulkSubjects.map((row) => (
              <div key={row.id} className="flex items-center gap-2">
                <input
                  value={row.name}
                  onChange={e => setBulkSubjects(prev => prev.map(r => r.id === row.id ? { ...r, name: e.target.value } : r))}
                  placeholder="Subject name"
                  className={inputClass}
                />
                <input
                  value={row.code}
                  onChange={e => setBulkSubjects(prev => prev.map(r => r.id === row.id ? { ...r, code: e.target.value } : r))}
                  placeholder="Code"
                  className="w-24 px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"
                />
                <input
                  value={row.credit_hours}
                  onChange={e => setBulkSubjects(prev => prev.map(r => r.id === row.id ? { ...r, credit_hours: e.target.value } : r))}
                  placeholder="Hrs"
                  className="w-16 px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"
                />
                <input
                  type="checkbox"
                  checked={row.is_optional}
                  onChange={e => setBulkSubjects(prev => prev.map(r => r.id === row.id ? { ...r, is_optional: e.target.checked } : r))}
                  className="rounded border-zinc-700 bg-zinc-900 text-blue-500"
                />
                {bulkSubjects.length > 1 && (
                  <button
                    onClick={() => setBulkSubjects(prev => prev.filter(r => r.id !== row.id))}
                    className="p-1 text-zinc-600 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {editingSubjectId === null && (
            <button
              onClick={addBulkRow}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-3 h-3" /> Add another subject
            </button>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowBulkSubjectModal(false); setBulkSubjects([newBulkSubjectRow()]); setEditingSubjectId(null) }} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            <button onClick={handleBulkSaveSubjects} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : editingSubjectId !== null ? 'Save Changes' : 'Save All'}
            </button>
          </div>
        </div>
      </Modal>
    </SchoolAdminLayout>
  )
}
