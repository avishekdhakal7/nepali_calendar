'use client'

import { useState, useEffect, startTransition } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Phone, Mail, Calendar, Save, Users, Shield, BookOpen, Plus, Edit2, Trash2, X } from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { StudentDetail, Guardian, PreviousSchool } from '@/types/student'

// ─── Guardian Modal ────────────────────────────────────────────────────────────
function GuardianModal({ open, onClose, onSave, guardian, studentId }: {
  open: boolean
  onClose: () => void
  onSave: (g: GuardianFormData) => void
  guardian?: Guardian | null
  studentId: number
}) {
  const [form, setForm] = useState({
    full_name: '', relation: 'father', phone: '', email: '',
    occupation: '', citizenship_no: '', is_primary: false,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (guardian) {
      startTransition(() => setForm({
        full_name: guardian.full_name || '',
        relation: guardian.relation || 'father',
        phone: guardian.phone || '',
        email: guardian.email || '',
        occupation: guardian.occupation || '',
        citizenship_no: guardian.citizenship_no || '',
        is_primary: guardian.is_primary || false,
      }))
    } else {
      startTransition(() => setForm({ full_name: '', relation: 'father', phone: '', email: '', occupation: '', citizenship_no: '', is_primary: false }))
    }
  }, [guardian, open])

  if (!open) return null

  const relations = [
    { value: 'father', label: 'Father' },
    { value: 'mother', label: 'Mother' },
    { value: 'grandfather', label: 'Grandfather' },
    { value: 'grandmother', label: 'Grandmother' },
    { value: 'uncle', label: 'Uncle' },
    { value: 'aunt', label: 'Aunt' },
    { value: 'brother', label: 'Brother' },
    { value: 'sister', label: 'Sister' },
    { value: 'legal', label: 'Legal Guardian' },
    { value: 'other', label: 'Other' },
  ]
  const occupations = [
    { value: 'government', label: 'Government Job' },
    { value: 'private', label: 'Private Job' },
    { value: 'business', label: 'Business' },
    { value: 'farming', label: 'Farming' },
    { value: 'foreign', label: 'Foreign Employment' },
    { value: 'other', label: 'Other' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-5 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">{guardian ? 'Edit Guardian' : 'Add Guardian'}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Full Name *</label>
            <input required value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className={inputClass} placeholder="Guardian name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Relation *</label>
              <select required value={form.relation} onChange={e => setForm(p => ({ ...p, relation: e.target.value }))} className={inputClass}>
                {relations.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Occupation</label>
              <select value={form.occupation} onChange={e => setForm(p => ({ ...p, occupation: e.target.value }))} className={inputClass}>
                <option value="">Select</option>
                {occupations.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Phone *</label>
            <input required type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputClass} placeholder="+977-..." />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputClass} placeholder="guardian@email.com" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Citizenship No.</label>
            <input value={form.citizenship_no} onChange={e => setForm(p => ({ ...p, citizenship_no: e.target.value }))} className={inputClass} placeholder="e.g. 12-34-56789" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_primary" checked={form.is_primary} onChange={e => setForm(p => ({ ...p, is_primary: e.target.checked }))} className="rounded border-zinc-700 bg-zinc-900 text-blue-500" />
            <label htmlFor="is_primary" className="text-xs text-zinc-400">Primary guardian</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

type GuardianFormData = { full_name: string; relation: string; phone: string; email: string; occupation: string; citizenship_no: string; is_primary: boolean }

// ─── Previous School Modal ─────────────────────────────────────────────────────
function PreviousSchoolModal({ open, onClose, onSave, prevSchool }: {
  open: boolean
  onClose: () => void
  onSave: (p: PrevSchoolFormData) => void
  prevSchool?: PreviousSchool | null
}) {
  const [form, setForm] = useState({
    school_name: '', address: '', last_class: '', leaving_date: '', tc_number: '', reason_for_leaving: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (prevSchool) {
      startTransition(() => setForm({
        school_name: prevSchool.school_name || '',
        address: prevSchool.address || '',
        last_class: prevSchool.last_class || '',
        leaving_date: prevSchool.leaving_date ? String(prevSchool.leaving_date) : '',
        tc_number: prevSchool.tc_number || '',
        reason_for_leaving: prevSchool.reason_for_leaving || '',
      }))
    } else {
      startTransition(() => setForm({ school_name: '', address: '', last_class: '', leaving_date: '', tc_number: '', reason_for_leaving: '' }))
    }
  }, [prevSchool, open])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-5 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">{prevSchool ? 'Edit Previous School' : 'Add Previous School'}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">School Name *</label>
            <input required value={form.school_name} onChange={e => setForm(p => ({ ...p, school_name: e.target.value }))} className={inputClass} placeholder="Previous school name" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Address</label>
            <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className={inputClass} placeholder="School address" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Last Class</label>
              <input value={form.last_class} onChange={e => setForm(p => ({ ...p, last_class: e.target.value }))} className={inputClass} placeholder="e.g. Class 8" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Year Left</label>
              <input type="number" value={form.leaving_date} onChange={e => setForm(p => ({ ...p, leaving_date: e.target.value }))} className={inputClass} placeholder="e.g. 2023" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">TC Number</label>
            <input value={form.tc_number} onChange={e => setForm(p => ({ ...p, tc_number: e.target.value }))} className={inputClass} placeholder="Transfer Certificate number" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Reason for Leaving</label>
            <input value={form.reason_for_leaving} onChange={e => setForm(p => ({ ...p, reason_for_leaving: e.target.value }))} className={inputClass} placeholder="e.g. Moved to new city" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

type PrevSchoolFormData = { school_name: string; address: string; last_class: string; leaving_date: string; tc_number: string; reason_for_leaving: string }

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    gender: '', date_of_birth: '', nationality: '', birth_place: '',
    religion: '', caste: '', address: '',
  })

  // Guardian modal state
  const [guardianModal, setGuardianModal] = useState<{ open: boolean; guardian: Guardian | null }>({ open: false, guardian: null })
  // Previous school modal state
  const [prevSchoolModal, setPrevSchoolModal] = useState<{ open: boolean; prevSchool: PreviousSchool | null }>({ open: false, prevSchool: null })

  useEffect(() => { fetchStudent() }, [id])

  async function fetchStudent() {
    setLoading(true)
    try {
      const res = await api.get(`/students/${id}/`)
      setStudent(res.data)
      const d = res.data
      setForm({
        first_name: d.first_name || '',
        last_name: d.last_name || '',
        email: d.email || '',
        phone: d.phone || '',
        gender: d.gender || '',
        date_of_birth: d.date_of_birth || '',
        nationality: d.nationality || '',
        birth_place: d.birth_place || '',
        religion: d.religion || '',
        caste: d.caste || '',
        address: d.address || '',
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveStudent() {
    setSaving(true)
    try {
      await api.patch(`/students/${id}/`, form)
      setEditMode(false)
      fetchStudent()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // Guardian CRUD
  async function handleSaveGuardian(data: GuardianFormData) {
    try {
      const payload = { ...data }
      if (guardianModal.guardian) {
        await api.patch(`/students/${id}/guardians/${guardianModal.guardian.id}/`, payload)
      } else {
        await api.post(`/students/${id}/guardians/`, payload)
      }
      setGuardianModal({ open: false, guardian: null })
      fetchStudent()
    } catch (err) {
      console.error(err)
      alert('Failed to save guardian')
    }
  }

  async function handleDeleteGuardian(g: Guardian) {
    if (!confirm(`Remove ${g.full_name} as guardian?`)) return
    try {
      await api.delete(`/students/${id}/guardians/${g.id}/`)
      fetchStudent()
    } catch (err) {
      console.error(err)
    }
  }

  // Previous School CRUD
  async function handleSavePrevSchool(data: PrevSchoolFormData) {
    try {
      const payload = {
        school_name: data.school_name,
        address: data.address,
        last_class: data.last_class,
        leaving_date: data.leaving_date ? `${data.leaving_date}-01-01` : null,
        tc_number: data.tc_number,
        reason_for_leaving: data.reason_for_leaving,
      }
      if (prevSchoolModal.prevSchool) {
        await api.patch(`/students/${id}/previous-school/${prevSchoolModal.prevSchool.id}/`, payload)
      } else {
        await api.post(`/students/${id}/previous-school/`, payload)
      }
      setPrevSchoolModal({ open: false, prevSchool: null })
      fetchStudent()
    } catch (err) {
      console.error(err)
      alert('Failed to save previous school')
    }
  }

  async function handleDeletePrevSchool(ps: PreviousSchool) {
    if (!confirm(`Remove ${ps.school_name} from previous schools?`)) return
    try {
      await api.delete(`/students/${id}/previous-school/${ps.id}/`)
      fetchStudent()
    } catch (err) {
      console.error(err)
    }
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  if (loading) {
    return (
      <SchoolAdminLayout title="Student Detail" activeRoute="/school-admin/students">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </SchoolAdminLayout>
    )
  }

  if (!student) {
    return (
      <SchoolAdminLayout title="Student Detail" activeRoute="/school-admin/students">
        <p className="text-zinc-500">Student not found</p>
      </SchoolAdminLayout>
    )
  }

  return (
    <SchoolAdminLayout title={student.full_name} activeRoute="/school-admin/students">
      <button
        onClick={() => router.push('/school-admin/students')}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Students
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Card */}
        <div className="space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-white">{student.full_name[0]}</span>
            </div>
            <h2 className="text-base font-semibold text-white">{student.full_name}</h2>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">{student.admission_number}</p>

            <div className="flex flex-col gap-2 mt-4 text-left text-xs text-zinc-400">
              {student.email && (
                <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> {student.email}</span>
              )}
              {student.phone && (
                <span className="flex items-center gap-2"><Phone className="w-3 h-3" /> {student.phone}</span>
              )}
              <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> DOB: {student.date_of_birth}</span>
              {student.current_class && (
                <span className="flex items-center gap-2"><BookOpen className="w-3 h-3" /> Class {student.current_class.class}-{student.current_class.section} · Roll #{student.current_class.roll_number}</span>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800/60">
              <span className={`text-xs px-2 py-1 rounded-full ${student.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {student.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Guardians Card */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" /> Guardians
              </h3>
              <button
                onClick={() => setGuardianModal({ open: true, guardian: null })}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            {(!student.guardians || student.guardians.length === 0) ? (
              <p className="text-xs text-zinc-600 py-2">No guardians added yet.</p>
            ) : (
              <div className="space-y-3">
                {student.guardians.map(g => (
                  <div key={g.id} className="p-3 bg-zinc-800/40 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-white">{g.full_name}</p>
                        <p className="text-xs text-zinc-500 capitalize">{g.relation}{g.is_primary ? ' (Primary)' : ''}</p>
                        {g.occupation && <p className="text-xs text-zinc-600">{g.occupation}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setGuardianModal({ open: true, guardian: g })}
                          className="p-1 rounded text-zinc-500 hover:text-blue-400"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteGuardian(g)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 text-right mt-1">
                      {g.phone && <span className="text-xs text-zinc-400 flex items-center gap-1 justify-end"><Phone className="w-3 h-3" />{g.phone}</span>}
                      {g.email && <span className="text-xs text-zinc-400 flex items-center gap-1 justify-end"><Mail className="w-3 h-3" />{g.email}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Form */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Personal Information</h3>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditMode(false)} className="text-xs text-zinc-500 hover:text-white">Cancel</button>
                  <button onClick={handleSaveStudent} disabled={saving} className="text-xs text-blue-400 hover:text-blue-300">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'First Name', field: 'first_name' },
                { label: 'Last Name', field: 'last_name' },
                { label: 'Email', field: 'email' },
                { label: 'Phone', field: 'phone' },
                { label: 'Date of Birth', field: 'date_of_birth' },
                { label: 'Gender', field: 'gender' },
                { label: 'Nationality', field: 'nationality' },
                { label: 'Birth Place', field: 'birth_place' },
                { label: 'Religion', field: 'religion' },
                { label: 'Caste', field: 'caste' },
              ].map(f => (
                <div key={f.field}>
                  <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
                  {f.field === 'gender' ? (
                    <select
                      value={editMode ? form.gender : student.gender}
                      onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                      disabled={!editMode}
                      className={`${inputClass} ${!editMode ? 'opacity-60' : ''}`}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <input
                      value={(editMode ? form[f.field as keyof typeof form] : (student as unknown as Record<string, string | undefined>)[f.field]) || ''}
                      onChange={e => setForm(p => ({ ...p, [f.field]: e.target.value }))}
                      disabled={!editMode}
                      className={`${inputClass} ${!editMode ? 'opacity-60' : ''}`}
                    />
                  )}
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">Address</label>
                <input
                  value={editMode ? form.address : (student.address || '')}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  disabled={!editMode}
                  className={`${inputClass} ${!editMode ? 'opacity-60' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Previous Schools Card */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-400" /> Previous Schools
              </h3>
              <button
                onClick={() => setPrevSchoolModal({ open: true, prevSchool: null })}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            {(!student.previous_schools || student.previous_schools.length === 0) ? (
              <p className="text-xs text-zinc-600 py-2">No previous schools added yet.</p>
            ) : (
              <div className="space-y-3">
                {student.previous_schools.map(ps => (
                  <div key={ps.id} className="p-3 bg-zinc-800/40 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-white">{ps.school_name}</p>
                        <p className="text-xs text-zinc-500">
                          {ps.last_class ? `Class ${ps.last_class}` : ''} {ps.leaving_date ? `· ${ps.leaving_date}` : ''}
                        </p>
                        {ps.tc_number && <p className="text-xs text-zinc-600">TC: {ps.tc_number}</p>}
                        {ps.reason_for_leaving && <p className="text-xs text-zinc-600 italic">{ps.reason_for_leaving}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPrevSchoolModal({ open: true, prevSchool: ps })}
                          className="p-1 rounded text-zinc-500 hover:text-blue-400"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeletePrevSchool(ps)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <GuardianModal
        open={guardianModal.open}
        onClose={() => setGuardianModal({ open: false, guardian: null })}
        onSave={handleSaveGuardian}
        guardian={guardianModal.guardian}
        studentId={Number(id)}
      />
      <PreviousSchoolModal
        open={prevSchoolModal.open}
        onClose={() => setPrevSchoolModal({ open: false, prevSchool: null })}
        onSave={handleSavePrevSchool}
        prevSchool={prevSchoolModal.prevSchool}
      />
    </SchoolAdminLayout>
  )
}
