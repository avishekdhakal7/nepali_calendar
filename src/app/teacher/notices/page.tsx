'use client'

import { PortalLayout } from '@/components/layout/portal-layout'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Bell, Search } from 'lucide-react'

interface Notice {
  id: number
  title: string
  body: string
  notice_type: string
  notice_type_display: string
  priority: string
  posted_by_name: string
  created_at: string
  is_pinned: boolean
}

const noticeTypeColors: Record<string, string> = {
  holiday:        'bg-blue-500/10 text-blue-400',
  emergency:      'bg-red-500/10 text-red-400',
  exam:           'bg-purple-500/10 text-purple-400',
  event:          'bg-pink-500/10 text-pink-400',
  general:        'bg-zinc-500/10 text-zinc-400',
  absent_alert:   'bg-yellow-500/10 text-yellow-400',
}

const priorityColors: Record<string, string> = {
  urgent:    'bg-red-500/10 text-red-400',
  important: 'bg-yellow-500/10 text-yellow-400',
  normal:    'bg-green-500/10 text-green-400',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'just now'
}

export default function TeacherNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchNotices()
  }, [])

  async function fetchNotices() {
    setLoading(true)
    try {
      const res = await api.get('/notices/')
      setNotices(res.data.results || res.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = notices.filter(n =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.body.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PortalLayout title="Notices">
      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search notices..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
        />
      </div>

      {/* Notices */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-zinc-800 rounded w-1/2 mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <Bell className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">No notices found</p>
          </div>
        ) : (
          filtered.map(notice => (
            <div key={notice.id} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 hover:bg-zinc-800/40 transition-all">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {notice.is_pinned && (
                      <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">
                        Pinned
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded ${noticeTypeColors[notice.notice_type] || 'bg-zinc-700 text-zinc-400'}`}>
                      {notice.notice_type_display}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[notice.priority] || ''}`}>
                      {notice.priority}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold mt-2">{notice.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{notice.body}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
                    <span>{notice.posted_by_name}</span>
                    <span>·</span>
                    <span>{timeAgo(notice.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </PortalLayout>
  )
}
