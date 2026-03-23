'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Megaphone } from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { NOTICE_TYPES, NOTICE_PRIORITIES, NOTICE_AUDIENCES } from '@/types/notice'
import { useAuthStore } from '@/store/auth'

export default function PostNoticePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', body: '', notice_type: 'general',
    priority: 'normal', audience: 'everyone', expiry_date: '',
    is_pinned: false,
  })

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/notices/', { ...form, school: user?.school_id })
      router.push('/school-admin/notices')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: string | Record<string, string[]> } }
        setError(e.response?.data ? JSON.stringify(e.response.data) : 'Failed to post notice')
      } else {
        setError('Failed to post notice')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  return (
    <SchoolAdminLayout title="Post Notice" activeRoute="/school-admin/notices">
      <div className="max-w-2xl">
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

          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-cyan-400" />
              New Notice
            </h2>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Title *</label>
              <input
                required
                value={form.title}
                onChange={e => update('title', e.target.value)}
                className={inputClass}
                placeholder="Notice title"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Content</label>
              <textarea
                value={form.body}
                onChange={e => update('body', e.target.value)}
                rows={6}
                className={inputClass}
                placeholder="Write your notice content here..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Notice Type</label>
                <select
                  value={form.notice_type}
                  onChange={e => update('notice_type', e.target.value)}
                  className={inputClass}
                >
                  {NOTICE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => update('priority', e.target.value)}
                  className={inputClass}
                >
                  {NOTICE_PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Audience</label>
                <select
                  value={form.audience}
                  onChange={e => update('audience', e.target.value)}
                  className={inputClass}
                >
                  {NOTICE_AUDIENCES.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiry_date}
                  onChange={e => update('expiry_date', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_pinned"
                checked={form.is_pinned}
                onChange={e => update('is_pinned', e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-blue-500"
              />
              <label htmlFor="is_pinned" className="text-xs text-zinc-400">
                Pin this notice (keeps it at the top)
              </label>
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
              <Save className="w-4 h-4" />
              {loading ? 'Posting...' : 'Post Notice'}
            </button>
          </div>
        </form>
      </div>
    </SchoolAdminLayout>
  )
}
