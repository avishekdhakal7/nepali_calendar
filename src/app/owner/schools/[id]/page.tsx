'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Building2, MapPin, Mail, Phone, Globe, Edit,
  Trash2, UserPlus, X, Loader2, AlertTriangle, Unlock, Lock,
} from 'lucide-react'
import OwnerLayout from '@/components/layout/owner-layout'
import api from '@/lib/api'
import { normalizeEmail } from '@/lib/email'

interface School {
  id: number
  name: string
  email: string
  contact_number: string
  website: string
  province: string
  district: string
  municipality: string
  ward_no: string
  registration_no: string
  pan_no: string
  established_year: number
  school_type: string
  is_active: boolean
  is_restricted: boolean
  restricted_at?: string
  restricted_reason?: string
  created_at: string
  admin_name?: string
  principal_name?: string
  admin_email?: string
  principal_email?: string
}

interface SchoolAdminForm {
  first_name: string
  last_name: string
  email: string
  phone: string
  joining_date: string
}

export default function SchoolDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const schoolId = params.id
  const [school, setSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [showRestrictModal, setShowRestrictModal] = useState(false)
  const [restrictReason, setRestrictReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [adminForm, setAdminForm] = useState<SchoolAdminForm>({
    first_name: '', last_name: '', email: '', phone: '', joining_date: '',
  })
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [adminSuccess, setAdminSuccess] = useState('')

  useEffect(() => {
    fetchSchool()
  }, [schoolId])

  async function fetchSchool() {
    setLoading(true)
    try {
      const res = await api.get(`/schools/${schoolId}/`)
      setSchool(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleRestrictSchool() {
    setActionLoading(true)
    setActionError('')
    setActionSuccess('')
    try {
      const res = await api.post(`/schools/${schoolId}/restrict/`, {
        reason: restrictReason,
      })
      setActionSuccess(res.data.message)
      setTimeout(() => {
        setShowRestrictModal(false)
        setRestrictReason('')
        setActionSuccess('')
        fetchSchool()
      }, 1500)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: string | Record<string, string[]> } }
        const d = e.response?.data
        const msg = typeof d === 'string'
          ? d
          : (d as Record<string, string[]>)?.error?.[0]
          || (d as Record<string, string[]>)?.detail?.[0]
          || 'Failed to restrict school'
        setActionError(msg)
      } else {
        setActionError('Failed to restrict school')
      }
    } finally {
      setActionLoading(false)
    }
  }

  async function handleUnrestrictSchool() {
    if (!confirm('Are you sure you want to restore this school? All staff and student accounts will be reactivated.')) return
    setActionLoading(true)
    setActionError('')
    setActionSuccess('')
    try {
      const res = await api.post(`/schools/${schoolId}/unrestrict/`)
      setActionSuccess(res.data.message)
      setTimeout(() => {
        setActionSuccess('')
        fetchSchool()
      }, 1500)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: string | Record<string, string[]> } }
        const d = e.response?.data
        const msg = typeof d === 'string'
          ? d
          : (d as Record<string, string[]>)?.error?.[0]
          || (d as Record<string, string[]>)?.detail?.[0]
          || 'Failed to restore school'
        setActionError(msg)
      } else {
        setActionError('Failed to restore school')
      }
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDeleteSchool() {
    if (!confirm('Are you sure you want to PERMANENTLY delete this school and all its data? This cannot be undone.')) return
    try {
      await api.delete(`/schools/${schoolId}/`)
      router.push('/owner/schools')
    } catch (e) {
      console.error(e)
      alert('Failed to delete school')
    }
  }

  async function handleCreateSchoolAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!schoolId) {
      setAdminError('School ID is missing. Please reload the page.')
      return
    }
    setAdminLoading(true)
    setAdminError('')
    setAdminSuccess('')
    try {
      const res = await api.post(`/schools/${schoolId}/create-admin/`, {
        first_name: adminForm.first_name.trim(),
        last_name: adminForm.last_name.trim(),
        email: normalizeEmail(adminForm.email),
        phone: adminForm.phone.trim() || null,
        joining_date: adminForm.joining_date || null,
      })
      setAdminSuccess(
        `School admin created for ${adminForm.first_name} ${adminForm.last_name}. ` +
        (res.data.otp_sent
          ? 'An onboarding email with OTP has been sent.'
          : 'Failed to send OTP email — please check email configuration.')
      )
      setAdminForm({ first_name: '', last_name: '', email: '', phone: '', joining_date: '' })
      setTimeout(() => {
        setShowAdminModal(false)
        setAdminSuccess('')
        fetchSchool()
      }, 3000)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: string | Record<string, string[]> } }
        const data = e.response?.data
        if (typeof data === 'string') {
          setAdminError(data)
        } else if (data && typeof data === 'object') {
          const msgs = Object.values(data as Record<string, string[]>).flat()
          setAdminError(msgs.join(', ') || 'Failed to create school admin')
        } else {
          setAdminError('Failed to create school admin')
        }
      } else {
        setAdminError('Failed to create school admin')
      }
    } finally {
      setAdminLoading(false)
    }
  }

  function updateAdmin(field: keyof SchoolAdminForm, value: string) {
    setAdminForm(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <OwnerLayout title="School Details" activeRoute="/owner/schools">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-1/3" />
          <div className="h-64 bg-zinc-800 rounded" />
        </div>
      </OwnerLayout>
    )
  }

  if (!school) {
    return (
      <OwnerLayout title="School Details" activeRoute="/owner/schools">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-center py-16 text-zinc-600">School not found</div>
      </OwnerLayout>
    )
  }

  return (
    <OwnerLayout title="School Details" activeRoute="/owner/schools">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Schools
      </button>

      {/* Restricted Banner */}
      {school.is_restricted && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-400">This school is restricted</p>
            <p className="text-xs text-red-300/70 mt-0.5">
              {school.restricted_reason || 'All staff and student accounts are blocked from login.'}
              {school.restricted_at && (
                <> Restricted on {new Date(school.restricted_at).toLocaleDateString()}.</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-white">{school.name}</h1>
              {school.is_restricted ? (
                <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">Restricted</span>
              ) : (
                <span className={`text-xs px-2 py-1 rounded ${school.is_active ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {school.is_active ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500 mt-1">Registered: {new Date(school.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {school.admin_name === "—" && !school.is_restricted && (
              <button
                onClick={() => setShowAdminModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Create School Admin
              </button>
            )}
            <button
              onClick={() => router.push(`/owner/schools/${school.id}/edit`)}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
            {school.is_restricted ? (
              <button
                onClick={handleUnrestrictSchool}
                disabled={actionLoading}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                Restore School
              </button>
            ) : (
              <button
                onClick={() => setShowRestrictModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
              >
                <Lock className="w-4 h-4" /> Restrict
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Email</p>
                <p className="text-sm text-white">{school.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Phone</p>
                <p className="text-sm text-white">{school.contact_number || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Website</p>
                <p className="text-sm text-white">{school.website || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Address</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Location</p>
                <p className="text-sm text-white">
                  {school.municipality || '—'}, {school.district || '—'}, {school.province || '—'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Ward No.</p>
              <p className="text-sm text-white">{school.ward_no || '—'}</p>
            </div>
          </div>
        </div>

        {/* School Info */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">School Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500">School Type</p>
              <p className="text-sm text-white capitalize">{school.school_type}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Established</p>
              <p className="text-sm text-white">{school.established_year || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Registration No.</p>
              <p className="text-sm text-white">{school.registration_no || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">PAN No.</p>
              <p className="text-sm text-white">{school.pan_no || '—'}</p>
            </div>
          </div>
        </div>

        {/* School Admin Info */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">School Admin</h2>
          {school.admin_name ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 font-semibold text-sm">{school.admin_name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{school.admin_name}</p>
                  <p className="text-xs text-zinc-500">{school.admin_email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-zinc-500 mb-3">No school admin assigned yet</p>
              {!school.is_restricted && (
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors mx-auto"
                >
                  <UserPlus className="w-4 h-4" /> Create School Admin
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Restrict School Modal */}
      {showRestrictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Restrict School
              </h2>
              <button onClick={() => { setShowRestrictModal(false); setActionError(''); setActionSuccess('') }}
                className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-xs text-orange-400">
                <strong>This will immediately block all staff and students from logging in.</strong> All their accounts will be deactivated. You can restore access at any time.
              </p>
            </div>

            {actionError && (
              <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">{actionError}</div>
            )}
            {actionSuccess && (
              <div className="mb-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">{actionSuccess}</div>
            )}

            <div className="mb-4">
              <label className="block text-xs text-zinc-500 mb-1">Reason (optional)</label>
              <textarea
                value={restrictReason}
                onChange={e => setRestrictReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                placeholder="e.g., Pending verification, non-compliance, dispute..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowRestrictModal(false); setActionError(''); setActionSuccess('') }}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={handleRestrictSchool} disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                {actionLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Restrict School'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create School Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-purple-400" />
                  Create School Admin
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">{school?.name}</p>
              </div>
              <button onClick={() => { setShowAdminModal(false); setAdminError(''); setAdminSuccess('') }}
                className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminError && (
              <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">{adminError}</div>
            )}
            {adminSuccess && (
              <div className="mb-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">{adminSuccess}</div>
            )}

            <form onSubmit={handleCreateSchoolAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">First Name *</label>
                  <input required value={adminForm.first_name}
                    onChange={e => updateAdmin('first_name', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                    placeholder="Sita" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Last Name *</label>
                  <input required value={adminForm.last_name}
                    onChange={e => updateAdmin('last_name', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                    placeholder="Rai" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Email *</label>
                <input required type="email" value={adminForm.email}
                  onChange={e => updateAdmin('email', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="sita@school.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Phone</label>
                  <input value={adminForm.phone}
                    onChange={e => updateAdmin('phone', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                    placeholder="98XXXXXXXX" />
                </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Joining Date</label>
                <input type="date" value={adminForm.joining_date}
                  onChange={e => updateAdmin('joining_date', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50" />
              </div>
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-400">
                An onboarding email with OTP will be sent to the school admin to set up their password.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowAdminModal(false); setAdminError(''); setAdminSuccess('') }}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={adminLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  {adminLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create School Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OwnerLayout>
  )
}
