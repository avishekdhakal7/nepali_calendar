'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, UserCheck, UserPlus, X } from 'lucide-react'

function normalizePhone(value: string) {
  return value.replace(/-/g, '').replace(/\s/g, '').replace(/^\+?977/, '')
}
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { useAuthStore } from '@/store/auth'

const ROLES = [
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

interface FoundUser {
  user_id: number
  email: string
  phone: string | null
  memberships: {
    id: number
    school_id: number
    school_name: string
    roles: string[]
  }[]
}

export default function AddStaffPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [mode, setMode] = useState<'search' | 'found' | 'create'>('search')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null)
  const [linkSuccess, setLinkSuccess] = useState(false)

  const [searchEmail, setSearchEmail] = useState('')
  const [searchPhone, setSearchPhone] = useState('')

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    gender: 'male',
    joining_date: '',
    password: '',
    roles: [] as string[],
  })

  async function handleCheck() {
    if (!searchEmail.trim() && !searchPhone.trim()) return
    setChecking(true)
    setError('')
    setFoundUser(null)
    try {
      const res = await api.post('/staff/check-user/', {
        email: searchEmail.trim() || undefined,
        phone: normalizePhone(searchPhone) || undefined,
      })
      if (res.data.found) {
        setFoundUser(res.data)
        setMode('found')
      } else {
        setMode('create')
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: string | Record<string, unknown> } }
      const data = e.response?.data
      const msg = typeof data === 'object' && data && 'error' in data ? String(data.error) : 'Failed to check user. Please try again.'
      setError(msg)
    } finally {
      setChecking(false)
    }
  }

  async function handleLinkStaff() {
    if (!foundUser) return
    setLoading(true)
    setError('')
    try {
      await api.post('/staff/add-existing-user/', {
        user_id: foundUser.user_id,
        email: foundUser.email,
        first_name: form.first_name,
        last_name: form.last_name,
        joining_date: form.joining_date,
        roles: form.roles,
      })
      router.push('/school-admin/staff')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: string | Record<string, string[]> } }
        setError(e.response?.data ? JSON.stringify(e.response?.data) : 'Failed to add staff')
      } else {
        setError('Failed to add staff')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateNew(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload: Record<string, unknown> = {
        first_name: form.first_name,
        last_name: form.last_name,
        gender: form.gender,
        joining_date: form.joining_date,
        is_active: true,
      }
      if (form.password) payload.password = form.password

      const res = await api.post('/staff/', payload)
      const staffId = res.data.id

      for (const role of form.roles) {
        await api.post(`/staff/${staffId}/roles/`, { role })
      }

      router.push('/school-admin/staff')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: string | Record<string, string[]> } }
        setError(e.response?.data ? JSON.stringify(e.response?.data) : 'Failed to add staff')
      } else {
        setError('Failed to add staff')
      }
    } finally {
      setLoading(false)
    }
  }

  function toggleRole(role: string) {
    setForm(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role],
    }))
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  return (
    <SchoolAdminLayout title="Add Staff" activeRoute="/school-admin/staff">
      <div className="max-w-3xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {mode === 'search' && (
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-1">Find Staff Member</h2>
            <p className="text-xs text-zinc-500 mb-5">
              Enter email or phone to check if they already have an account.
              If found, we{"'"}ll link them to your school. If not, we{"'"}ll create a new account.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Email</label>
                <input
                  type="email"
                  value={searchEmail}
                  onChange={e => setSearchEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCheck()}
                  placeholder="staff@school.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Phone</label>
                <input
                  value={searchPhone}
                  onChange={e => setSearchPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCheck()}
                  placeholder="+977-98..."
                  className={inputClass}
                />
              </div>
            </div>
            <button
              onClick={handleCheck}
              disabled={checking || (!searchEmail.trim() && !searchPhone.trim())}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {checking ? 'Checking...' : 'Check User'}
            </button>
          </div>
        )}

        {mode === 'found' && foundUser && (
          <div className="space-y-5">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-emerald-400">User Found</h2>
                  <p className="text-xs text-zinc-400">{foundUser.email}</p>
                </div>
              </div>
              {foundUser.memberships.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-zinc-500 mb-1.5">Already a member of:</p>
                  <div className="flex flex-wrap gap-2">
                    {foundUser.memberships.map(m => (
                      <span key={m.id} className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400">
                        {m.school_name} ({m.roles.join(', ')})
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => setMode('search')}
                className="text-xs text-zinc-500 hover:text-white"
              >
                ← Search again
              </button>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Link to Your School</h2>
              <p className="text-xs text-zinc-500">
                Add <strong className="text-zinc-300">{foundUser.email}</strong> as staff to your school.
                Their existing account will be preserved.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">First Name</label>
                  <input
                    value={form.first_name}
                    onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                    className={inputClass}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Last Name</label>
                  <input
                    value={form.last_name}
                    onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                    className={inputClass}
                    placeholder="Last name"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={form.joining_date}
                    onChange={e => setForm(p => ({ ...p, joining_date: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-500 mb-2">Assign Roles</p>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map(role => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => toggleRole(role.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        form.roles.includes(role.value)
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/40'
                          : 'bg-zinc-800/40 text-zinc-400 border-zinc-700/40 hover:border-zinc-600'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('search')}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkStaff}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  {loading ? 'Adding...' : 'Link to School'}
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreateNew} className="space-y-5">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-xs text-blue-400">
                No existing account found. Fill in the details below to create a new staff account.
              </p>
              <button
                type="button"
                onClick={() => setMode('search')}
                className="text-xs text-zinc-500 hover:text-white mt-1"
              >
                ← Search again
              </button>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-violet-400" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">First Name *</label>
                  <input required value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} className={inputClass} placeholder="First name" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Last Name *</label>
                  <input required value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} className={inputClass} placeholder="Last name" />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Gender *</label>
                  <select required value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className={inputClass}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Joining Date *</label>
                  <input required type="date" value={form.joining_date} onChange={e => setForm(p => ({ ...p, joining_date: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Password</label>
                  <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className={inputClass} placeholder="Leave blank for default" />
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Assign Roles</h2>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(role => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => toggleRole(role.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      form.roles.includes(role.value)
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/40'
                        : 'bg-zinc-800/40 text-zinc-400 border-zinc-700/40 hover:border-zinc-600'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                {loading ? 'Creating...' : 'Create Staff'}
              </button>
            </div>
          </form>
        )}
      </div>
    </SchoolAdminLayout>
  )
}
