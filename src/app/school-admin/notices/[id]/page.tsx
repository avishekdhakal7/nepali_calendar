'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Megaphone, Pin, Calendar, Clock, User } from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { Notice, NOTICE_TYPES, NOTICE_PRIORITIES, NOTICE_AUDIENCES } from '@/types/notice'

export default function NoticeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [notice, setNotice] = useState<Notice | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', body: '', notice_type: 'general',
    priority: 'normal', audience: 'everyone', is_pinned: false, expiry_date: '',
  })

  useEffect(() => { fetchNotice() }, [id])

  async function fetchNotice() {
    try {
      const res = await api.get(`/notices/${id}/`)
      setNotice(res.data)
      const d = res.data
      setForm({
        title: d.title || '',
        body: d.body || '',
        notice_type: d.notice_type || 'general',
        priority: d.priority || 'normal',
        audience: d.audience || 'everyone',
        is_pinned: d.is_pinned || false,
        expiry_date: d.expiry_date || '',
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
      await api.patch(`/notices/${id}/`, form)
      setEditMode(false)
      fetchNotice()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this notice?')) return
    try {
      await api.delete(`/notices/${id}/`)
      router.push('/school-admin/notices')
    } catch (err) {
      console.error(err)
    }
  }

  const noticeTypeColors: Record<string, string> = {
    holiday:        'bg-blue-500/10 text-blue-400',
    emergency:      'bg-red-500/10 text-red-400',
    exam:           'bg-purple-500/10 text-purple-400',
    event:          'bg-pink-500/10 text-pink-400',
    staff_meeting:  'bg-orange-500/10 text-orange-400',
    general:        'bg-zinc-500/10 text-zinc-400',
  }
  const priorityColors: Record<string, string> = {
    urgent:    'bg-red-500/10 text-red-400 border border-red-500/20',
    important: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    normal:    'bg-green-500/10 text-green-400 border border-green-500/20',
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  if (loading) {
    return (
      <SchoolAdminLayout title="Notice Detail" activeRoute="/school-admin/notices">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </SchoolAdminLayout>
    )
  }

  if (!notice) {
    return (
      <SchoolAdminLayout title="Notice Detail" activeRoute="/school-admin/notices">
        <p className="text-zinc-500">Notice not found</p>
      </SchoolAdminLayout>
    )
  }

  return (
    <SchoolAdminLayout title="Notice Detail" activeRoute="/school-admin/notices">
      <button
        onClick={() => router.push('/school-admin/notices')}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Notices
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {editMode ? (
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">Edit Notice</h3>
                <div className="flex gap-2">
                  <button onClick={() => setEditMode(false)} className="text-xs text-zinc-500 hover:text-white">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="text-xs text-blue-400 hover:text-blue-300">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Body</label>
                <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={6} className={inputClass} placeholder="Notice content..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Type</label>
                  <select value={form.notice_type} onChange={e => setForm(p => ({ ...p, notice_type: e.target.value }))} className={inputClass}>
                    {NOTICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className={inputClass}>
                    {NOTICE_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Audience</label>
                  <select value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))} className={inputClass}>
                    {NOTICE_AUDIENCES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Expiry Date</label>
                  <input type="date" value={form.expiry_date} onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))} className={inputClass} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_pinned" checked={form.is_pinned} onChange={e => setForm(p => ({ ...p, is_pinned: e.target.checked }))} className="rounded" />
                  <label htmlFor="is_pinned" className="text-xs text-zinc-400">Pin this notice</label>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className={`text-xs px-2 py-0.5 rounded-md ${noticeTypeColors[notice.notice_type] || 'bg-zinc-700 text-zinc-400'}`}>
                  {notice.notice_type_display || notice.notice_type}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[notice.priority] || ''}`}>
                  {notice.priority}
                </span>
                {notice.is_pinned && <span className="text-xs text-blue-400"><Pin className="w-3 h-3 inline" /> Pinned</span>}
              </div>
              <h1 className="text-xl font-bold text-white mb-3">{notice.title}</h1>
              {notice.body && <p className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">{notice.body}</p>}
              {(!notice.body || notice.body.trim() === '') && (
                <p className="text-sm text-zinc-600 italic">No content</p>
              )}
            </div>
          )}

          {/* Delete */}
          {!editMode && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-lg border border-red-500/20 transition-colors"
            >
              Delete Notice
            </button>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Notice Info</h3>
            {!editMode && (
              <button onClick={() => setEditMode(true)} className="text-xs text-blue-400 hover:text-blue-300 mb-2">Edit Notice</button>
            )}
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-zinc-600" />
                <span className="text-zinc-500">Posted by:</span>
                <span className="text-white">{notice.posted_by_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-zinc-600" />
                <span className="text-zinc-500">Posted:</span>
                <span className="text-white">{new Date(notice.created_at).toLocaleDateString()}</span>
              </div>
              {notice.expiry_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-zinc-600" />
                  <span className="text-zinc-500">Expires:</span>
                  <span className="text-white">{notice.expiry_date}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SchoolAdminLayout>
  )
}
