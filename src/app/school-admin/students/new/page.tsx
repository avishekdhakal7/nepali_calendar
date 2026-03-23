'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, GraduationCap } from 'lucide-react'
import api from '@/lib/api'
import { normalizeEmail } from '@/lib/email'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { useAuthStore } from '@/store/auth'

export default function AddStudentPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    first_name: '', last_name: '', admission_number: '', emis_number: '',
    gender: 'male', date_of_birth: '', nationality: '', birth_place: '',
    religion: '', caste: '', email: '', phone: '',
    admission_date: '', address: '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/students/', {
        ...form,
        email: normalizeEmail(form.email),
        is_active: true,
        school: user?.school_id,
      })
      router.push(`/school-admin/students/${res.data.id}`)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: string | Record<string, string[]> } }
        setError(e.response?.data ? JSON.stringify(e.response.data) : 'Failed to add student')
      } else {
        setError('Failed to add student')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  return (
    <SchoolAdminLayout title="Add Student" activeRoute="/school-admin/students">
      <div className="max-w-3xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">First Name *</label>
                <input required value={form.first_name} onChange={e => update('first_name', e.target.value)} className={inputClass} placeholder="First name" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Last Name *</label>
                <input required value={form.last_name} onChange={e => update('last_name', e.target.value)} className={inputClass} placeholder="Last name" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Admission No. *</label>
                <input required value={form.admission_number} onChange={e => update('admission_number', e.target.value)} className={inputClass} placeholder="e.g. 2024-001" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">EMIS Number</label>
                <input value={form.emis_number} onChange={e => update('emis_number', e.target.value)} className={inputClass} placeholder="EMIS ID" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Gender *</label>
                <select required value={form.gender} onChange={e => update('gender', e.target.value)} className={inputClass}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Date of Birth *</label>
                <input required type="date" value={form.date_of_birth} onChange={e => update('date_of_birth', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Admission Date *</label>
                <input required type="date" value={form.admission_date} onChange={e => update('admission_date', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Nationality</label>
                <input value={form.nationality} onChange={e => update('nationality', e.target.value)} className={inputClass} placeholder="Nationality" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Birth Place</label>
                <input value={form.birth_place} onChange={e => update('birth_place', e.target.value)} className={inputClass} placeholder="Place of birth" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Religion</label>
                <input value={form.religion} onChange={e => update('religion', e.target.value)} className={inputClass} placeholder="Religion" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Caste</label>
                <input value={form.caste} onChange={e => update('caste', e.target.value)} className={inputClass} placeholder="Caste/Ethnicity" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Phone</label>
                <input value={form.phone} onChange={e => update('phone', e.target.value)} className={inputClass} placeholder="+977-..." />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} placeholder="student@email.com" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">Address</label>
                <input value={form.address} onChange={e => update('address', e.target.value)} className={inputClass} placeholder="Full address" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Student'}
            </button>
          </div>
        </form>
      </div>
    </SchoolAdminLayout>
  )
}
