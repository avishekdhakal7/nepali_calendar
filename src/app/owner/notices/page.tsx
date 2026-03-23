'use client'

import { useState, useEffect } from 'react'
import { Bell, Search, Plus, X, Megaphone, Loader2 } from 'lucide-react'
import OwnerLayout from '@/components/layout/owner-layout'
import api from '@/lib/api'
import { NOTICE_PRIORITIES } from '@/types/notice'

interface Notice {
  id: number
  title: string
  body: string
  notice_type: string
  notice_type_display: string
  priority: string
  priority_display: string
  audience: string
  is_pinned: boolean
  created_at: string
  posted_by_name: string
  posted_by_role: string
}

export default function OwnerNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showPostModal, setShowPostModal] = useState(false)
  const [postLoading, setPostLoading] = useState(false)
  const [postError, setPostError] = useState('')
  const [postForm, setPostForm] = useState({
    title: '', body: '', priority: 'normal',
  })

  useEffect(() => {
    fetchNotices()
  }, [])

  async function fetchNotices() {
    setLoading(true)
    try {
      const res = await api.get('/notices/')
      setNotices(res.data.results || res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredNotices = notices.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.body.toLowerCase().includes(search.toLowerCase())
  )

  async function handlePostNotice(e: React.FormEvent) {
    e.preventDefault()
    if (!postForm.title.trim()) { setPostError('Title is required'); return }
    setPostLoading(true)
    setPostError('')
    try {
      await api.post('/notices/', {
        ...postForm,
        notice_type: 'system',
      })
      setShowPostModal(false)
      setPostForm({ title: '', body: '', priority: 'normal' })
      fetchNotices()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: string | Record<string, string[]> } }
        const data = e.response?.data
        if (typeof data === 'string') setPostError(data)
        else if (data && typeof data === 'object') {
          const msgs = Object.values(data as Record<string, string[]>).flat()
          setPostError(msgs.join(', ') || 'Failed to post notice')
        } else setPostError('Failed to post notice')
      } else setPostError('Failed to post notice')
    } finally {
      setPostLoading(false)
    }
  }

  return (
    <OwnerLayout title="System Notices" activeRoute="/owner/notices">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <p className="text-sm text-zinc-500">System notices visible to all school admins</p>
        <button
          onClick={() => setShowPostModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Post System Notice
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search notices..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-zinc-800 rounded w-1/2 mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
            </div>
          ))
        ) : filteredNotices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <Bell className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">No system notices yet</p>
            <p className="text-sm">Post a system notice to communicate with all school admins</p>
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <div key={notice.id} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 hover:bg-zinc-800/40 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {notice.is_pinned && <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">Pinned</span>}
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      notice.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                      notice.priority === 'important' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {notice.priority_display}
                    </span>
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                      {notice.notice_type_display}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold mt-2">{notice.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{notice.body}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                    <span>You</span>
                    <span>•</span>
                    <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Notice Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-purple-400" />
                Post to All School Admins
              </h2>
              <button onClick={() => { setShowPostModal(false); setPostError('') }}
                className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {postError && (
              <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">{postError}</div>
            )}

            <form onSubmit={handlePostNotice} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Title *</label>
                <input required value={postForm.title}
                  onChange={e => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="Notice title" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Content</label>
                <textarea value={postForm.body}
                  onChange={e => setPostForm(prev => ({ ...prev, body: e.target.value }))}
                  rows={5}
                  className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="Write your notice content..." />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Priority</label>
                <select value={postForm.priority}
                  onChange={e => setPostForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50">
                  {NOTICE_PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-xs text-purple-400">
                  This system notice will be visible to all school admins across all schools.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowPostModal(false); setPostError('') }}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={postLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  {postLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</> : 'Post Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OwnerLayout>
  )
}
