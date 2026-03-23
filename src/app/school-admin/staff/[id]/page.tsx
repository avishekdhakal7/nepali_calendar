'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, Save, Shield, BookOpen, Plus, X, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { StaffDetail, ClassTeacherAssignment, SubjectTeacherAssignment } from '@/types/staff'
import { useAuthStore } from '@/store/auth'

const AVAILABLE_ROLES = [
  { value: 'teacher', label: 'Teacher' },
  { value: 'principal', label: 'Principal' },
  { value: 'vice_principal', label: 'Vice Principal' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'librarian', label: 'Librarian' },
  { value: 'clerk', label: 'Clerk' },
  { value: 'peon', label: 'Peon' },
  { value: 'security', label: 'Security' },
  { value: 'other', label: 'Other' },
]

export default function StaffDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { user } = useAuthStore()
  const schoolId = user?.school_id || 1

  const [staff, setStaff] = useState<StaffDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addingRole, setAddingRole] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', gender: '', joining_date: '', is_active: true,
  })

  // Assignment modals
  const [addingClassTeacher, setAddingClassTeacher] = useState(false)
  const [addingSubjectTeacher, setAddingSubjectTeacher] = useState(false)
  const [classTeacherForm, setClassTeacherForm] = useState({ section_id: '' })
  const [subjectTeacherForm, setSubjectTeacherForm] = useState({ section_id: '', subject_id: '' })
  const [availableSections, setAvailableSections] = useState<{ id: number; name: string; class_name: string }[]>([])
  const [availableSubjects, setAvailableSubjects] = useState<{ id: number; name: string; code: string }[]>([])
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [removing, setRemoving] = useState(false)

  useEffect(() => { fetchStaff() }, [id])

  async function fetchStaff() {
    setLoading(true)
    try {
      const res = await api.get(`/staff/${id}/`)
      setStaff(res.data)
      const d = res.data
      setForm({
        first_name: d.first_name || '',
        last_name: d.last_name || '',
        gender: d.gender || '',
        joining_date: d.joining_date || '',
        is_active: d.is_active ?? true,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await api.patch(`/staff/${id}/`, {
        first_name: form.first_name,
        last_name: form.last_name,
        gender: form.gender,
        joining_date: form.joining_date,
        is_active: form.is_active,
      })
      setEditMode(false)
      fetchStaff()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleAddRole() {
    if (!newRole) return
    try {
      await api.post(`/staff/${id}/roles/`, { role: newRole })
      setNewRole('')
      setAddingRole(false)
      fetchStaff()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleRemoveRole(roleId: number) {
    try {
      await api.delete(`/staff/${id}/roles/${roleId}/`)
      fetchStaff()
    } catch (err) {
      console.error(err)
    }
  }

  async function openClassTeacherModal() {
    try {
      const res = await api.get('/sections/', { params: { academic_class__academic_year__school: schoolId } })
      setAvailableSections((res.data.results || res.data).map((s: { id: number; name: string; academic_class: { name: string } }) => ({
        id: s.id,
        name: s.name,
        class_name: s.academic_class?.name || '',
      })))
      setAddingClassTeacher(true)
    } catch (e) {
      console.error(e)
    }
  }

  async function openSubjectTeacherModal() {
    try {
      const [secRes, subRes] = await Promise.all([
        api.get('/sections/', { params: { academic_class__academic_year__school: schoolId } }),
        api.get('/subjects/', { params: { academic_year__school: schoolId } }),
      ])
      setAvailableSections((secRes.data.results || secRes.data).map((s: { id: number; name: string; academic_class: { name: string } }) => ({
        id: s.id,
        name: s.name,
        class_name: s.academic_class?.name || '',
      })))
      setAvailableSubjects((subRes.data.results || subRes.data).map((s: { id: number; name: string; code: string }) => ({
        id: s.id,
        name: s.name,
        code: s.code,
      })))
      setAddingSubjectTeacher(true)
    } catch (e) {
      console.error(e)
    }
  }

  async function handleAssignClassTeacher() {
    if (!classTeacherForm.section_id) return
    try {
      await api.post('/class-teachers/', { membership: staff?.membership?.id, section: Number(classTeacherForm.section_id) })
      setClassTeacherForm({ section_id: '' })
      setAddingClassTeacher(false)
      fetchStaff()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleAssignSubjectTeacher() {
    if (!subjectTeacherForm.section_id || !subjectTeacherForm.subject_id) return
    try {
      await api.post('/subject-teachers/', {
        membership: staff?.membership?.id,
        section: Number(subjectTeacherForm.section_id),
        subject: Number(subjectTeacherForm.subject_id),
      })
      setSubjectTeacherForm({ section_id: '', subject_id: '' })
      setAddingSubjectTeacher(false)
      fetchStaff()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleRemoveClassTeacher(ctId: number) {
    try {
      await api.delete(`/class-teachers/${ctId}/`)
      fetchStaff()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleRemoveSubjectTeacher(stId: number) {
    try {
      await api.delete(`/subject-teachers/${stId}/`)
      fetchStaff()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleRemoveFromSchool() {
    if (!staff?.membership) return
    setRemoving(true)
    try {
      await api.delete(`/staff/${id}/membership/`)
      setConfirmRemove(false)
      router.push('/school-admin/staff')
    } catch (err) {
      console.error(err)
    } finally {
      setRemoving(false)
    }
  }

  const roleColors: Record<string, string> = {
    teacher: 'bg-blue-500/10 text-blue-400',
    principal: 'bg-amber-500/10 text-amber-400',
    vice_principal: 'bg-orange-500/10 text-orange-400',
    accountant: 'bg-emerald-500/10 text-emerald-400',
    librarian: 'bg-pink-500/10 text-pink-400',
    clerk: 'bg-cyan-500/10 text-cyan-400',
    peon: 'bg-zinc-500/10 text-zinc-400',
    security: 'bg-red-500/10 text-red-400',
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  if (loading) {
    return (
      <SchoolAdminLayout title="Staff Detail" activeRoute="/school-admin/staff">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </SchoolAdminLayout>
    )
  }

  if (!staff) {
    return (
      <SchoolAdminLayout title="Staff Detail" activeRoute="/school-admin/staff">
        <p className="text-zinc-500">Staff not found</p>
      </SchoolAdminLayout>
    )
  }

  return (
    <SchoolAdminLayout title={staff.full_name} activeRoute="/school-admin/staff">
      <button
        onClick={() => router.push('/school-admin/staff')}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Staff
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Card */}
        <div className="space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-white">{staff.full_name[0]}</span>
            </div>
            <h2 className="text-base font-semibold text-white">{staff.full_name}</h2>

            <div className="flex flex-wrap gap-1 justify-center mt-3">
              {staff.is_admin && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-medium">
                  School Admin
                </span>
              )}
              {(staff.active_roles || []).map(r => (
                <span key={r} className={`text-xs px-2 py-0.5 rounded-full capitalize ${roleColors[r] || 'bg-zinc-700 text-zinc-400'}`}>
                  {r.replace('_', ' ')}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-2 mt-4 text-left text-xs text-zinc-400">
              {[
                staff.municipality,
                staff.district,
                staff.province,
              ].filter(Boolean).length > 0 && (
                <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {[
                  staff.municipality,
                  staff.district,
                  staff.province,
                ].filter(Boolean).join(', ')}</span>
              )}
              <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Joined {staff.joining_date}</span>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full ${staff.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {staff.is_active ? 'Active' : 'Inactive'}
              </span>
              {staff.membership && (
                <button
                  onClick={() => setConfirmRemove(true)}
                  className="flex items-center gap-1 text-xs text-red-400/60 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Remove from School
                </button>
              )}
            </div>
          </div>

          {/* Class Teacher Assignments */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" /> Class Teacher
              </h3>
              <button
                onClick={openClassTeacherModal}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <Plus className="w-3 h-3" /> Assign
              </button>
            </div>
            <div className="space-y-2">
              {(!staff.class_teacher_of || staff.class_teacher_of.length === 0) ? (
                <p className="text-xs text-zinc-600 py-2 text-center">No class teacher assignments</p>
              ) : staff.class_teacher_of.map((ct: ClassTeacherAssignment) => (
                <div key={ct.id} className="flex items-center justify-between p-2 bg-zinc-800/40 rounded-lg">
                  <div>
                    <p className="text-xs text-white">Class {ct.class_name} - {ct.section_name}</p>
                    <p className="text-xs text-zinc-500">{ct.academic_year}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveClassTeacher(ct.id)}
                    className="p-1 text-zinc-600 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Teacher Assignments */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" /> Subject Teacher
              </h3>
              <button
                onClick={openSubjectTeacherModal}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                <Plus className="w-3 h-3" /> Assign
              </button>
            </div>
            <div className="space-y-2">
              {(!staff.subject_assignments || staff.subject_assignments.length === 0) ? (
                <p className="text-xs text-zinc-600 py-2 text-center">No subject assignments</p>
              ) : staff.subject_assignments.map((sa: SubjectTeacherAssignment) => (
                <div key={sa.id} className="flex items-center justify-between p-2 bg-zinc-800/40 rounded-lg">
                  <div>
                    <p className="text-xs text-white">{sa.subject_name} ({sa.subject_code})</p>
                    <p className="text-xs text-zinc-500">Class {sa.class_name} - {sa.section_name}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveSubjectTeacher(sa.id)}
                    className="p-1 text-zinc-600 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Details & Roles */}
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
                  <button onClick={handleSave} disabled={saving} className="text-xs text-blue-400 hover:text-blue-300">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">First Name</label>
                <input
                  value={editMode ? form.first_name : staff.first_name}
                  onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                  disabled={!editMode}
                  className={`${inputClass} ${!editMode ? 'opacity-60' : ''}`}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Last Name</label>
                <input
                  value={editMode ? form.last_name : staff.last_name}
                  onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                  disabled={!editMode}
                  className={`${inputClass} ${!editMode ? 'opacity-60' : ''}`}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Joining Date</label>
                <input
                  value={editMode ? form.joining_date : staff.joining_date}
                  onChange={e => setForm(p => ({ ...p, joining_date: e.target.value }))}
                  disabled={!editMode}
                  className={`${inputClass} ${!editMode ? 'opacity-60' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Roles Management */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-400" /> Roles
              </h3>
              {!addingRole ? (
                <button
                  onClick={() => setAddingRole(true)}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  <Plus className="w-3 h-3" /> Add Role
                </button>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-white"
                  >
                    <option value="">Select role</option>
                    {AVAILABLE_ROLES.filter(r => !staff.active_roles?.includes(r.value)).map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <button onClick={handleAddRole} className="text-xs text-blue-400 hover:text-blue-300">Add</button>
                  <button onClick={() => { setAddingRole(false); setNewRole('') }} className="text-xs text-zinc-500 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {staff.roles && staff.roles.length > 0 ? staff.roles.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-lg">
                  <div>
                    <span className="text-sm text-white capitalize">{r.role.replace('_', ' ')}</span>
                    <span className={`text-xs ml-2 px-1.5 py-0.5 rounded-full ${r.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {r.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveRole(r.id)}
                    className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )) : (
                <p className="text-xs text-zinc-600 py-4 text-center">No roles assigned</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Class Teacher Modal */}
      {addingClassTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-5 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Assign as Class Teacher</h3>
              <button onClick={() => setAddingClassTeacher(false)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Section *</label>
                <select
                  value={classTeacherForm.section_id}
                  onChange={e => setClassTeacherForm({ section_id: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select section</option>
                  {availableSections.map(s => (
                    <option key={s.id} value={s.id}>{s.class_name} - {s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setAddingClassTeacher(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
                <button
                  onClick={handleAssignClassTeacher}
                  disabled={!classTeacherForm.section_id}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Subject Teacher Modal */}
      {addingSubjectTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-5 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Assign Subject</h3>
              <button onClick={() => setAddingSubjectTeacher(false)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Section *</label>
                <select
                  value={subjectTeacherForm.section_id}
                  onChange={e => setSubjectTeacherForm({ ...subjectTeacherForm, section_id: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select section</option>
                  {availableSections.map(s => (
                    <option key={s.id} value={s.id}>{s.class_name} - {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Subject *</label>
                <select
                  value={subjectTeacherForm.subject_id}
                  onChange={e => setSubjectTeacherForm({ ...subjectTeacherForm, subject_id: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select subject</option>
                  {availableSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setAddingSubjectTeacher(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
                <button
                  onClick={handleAssignSubjectTeacher}
                  disabled={!subjectTeacherForm.section_id || !subjectTeacherForm.subject_id}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove from School Confirmation */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-sm font-semibold text-white text-center mb-2">Remove from School?</h3>
            <p className="text-xs text-zinc-400 text-center mb-5">
              This will remove <strong className="text-white">{staff.full_name}</strong> from your school.
              Their roles and assignments will be revoked. Their account will remain and they can still access other schools.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRemove(false)}
                className="flex-1 px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveFromSchool}
                disabled={removing}
                className="flex-1 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {removing ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SchoolAdminLayout>
  )
}
