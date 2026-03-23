'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Building2, ArrowLeft, Save, MapPin, X } from 'lucide-react'
import OwnerLayout from '@/components/layout/owner-layout'
import api from '@/lib/api'

export default function EditSchoolPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', contact_number: '', website: '',
    province: '', district: '', municipality: '', ward_no: '',
    registration_no: '', pan_no: '', established_year: '',
    school_type: 'regular',
    is_active: true,
  })

  useEffect(() => { fetchSchool() }, [id])

  async function fetchSchool() {
    setFetching(true)
    try {
      const res = await api.get(`/schools/${id}/`)
      const d = res.data
      setForm({
        name: d.name || '',
        email: d.email || '',
        contact_number: d.contact_number || '',
        website: d.website || '',
        province: d.province || '',
        district: d.district || '',
        municipality: d.municipality || '',
        ward_no: d.ward_no || '',
        registration_no: d.registration_no || '',
        pan_no: d.pan_no || '',
        established_year: d.established_year ? String(d.established_year) : '',
        school_type: d.school_type || 'regular',
        is_active: d.is_active ?? true,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setFetching(false)
    }
  }

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email) {
      setError('Name and email are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        email: form.email,
        contact_number: form.contact_number,
        website: form.website,
        province: form.province,
        district: form.district,
        municipality: form.municipality,
        ward_no: form.ward_no,
        registration_no: form.registration_no,
        pan_no: form.pan_no,
        established_year: form.established_year ? parseInt(form.established_year) : null,
        school_type: form.school_type,
        is_active: form.is_active,
      }
      await api.patch(`/schools/${id}/`, payload)
      router.push(`/owner/schools/${id}`)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: string | Record<string, string[]> } }
        const data = e.response?.data
        if (typeof data === 'string') {
          setError(data)
        } else if (data) {
          const record = data as Record<string, string[]>
          setError(Array.isArray(record.error) ? record.error.join(', ') : (record.error || JSON.stringify(record)))
        } else {
          setError('Failed to update school')
        }
      } else {
        setError('Failed to update school')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"

  if (fetching) {
    return (
      <OwnerLayout title="Edit School" activeRoute="/owner/schools">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </OwnerLayout>
    )
  }

  return (
    <OwnerLayout title="Edit School" activeRoute="/owner/schools">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 flex items-center gap-2">
              <X className="w-4 h-4" /> {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              School Information
            </h2>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">School Name *</label>
              <input required value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} placeholder="Rising Star Secondary School" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} placeholder="info@school.edu.np" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Phone</label>
                <input value={form.contact_number} onChange={e => update('contact_number', e.target.value)} className={inputClass} placeholder="01-4567890" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Website</label>
                <input value={form.website} onChange={e => update('website', e.target.value)} className={inputClass} placeholder="https://school.edu.np" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">School Type</label>
                <select value={form.school_type} onChange={e => update('school_type', e.target.value)} className={inputClass}>
                  <option value="regular">Regular</option>
                  <option value="program">Program Based</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Registration No.</label>
                <input value={form.registration_no} onChange={e => update('registration_no', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">PAN No.</label>
                <input value={form.pan_no} onChange={e => update('pan_no', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Established Year</label>
                <input type="number" value={form.established_year} onChange={e => update('established_year', e.target.value)} className={inputClass} placeholder="2010" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={e => update('is_active', e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-purple-500"
              />
              <label htmlFor="is_active" className="text-xs text-zinc-400">School is active</label>
            </div>
          </div>

          {/* Address */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Province</label>
                <input value={form.province} onChange={e => update('province', e.target.value)} className={inputClass} placeholder="Bagmati" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">District</label>
                <input value={form.district} onChange={e => update('district', e.target.value)} className={inputClass} placeholder="Kathmandu" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Municipality</label>
                <input value={form.municipality} onChange={e => update('municipality', e.target.value)} className={inputClass} placeholder="KTM Metropolitan" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Ward No.</label>
                <input value={form.ward_no} onChange={e => update('ward_no', e.target.value)} className={inputClass} placeholder="10" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </OwnerLayout>
  )
}
