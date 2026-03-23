'use client'

import { useState, useEffect } from 'react'
import { Bell, ChevronRight, Search } from 'lucide-react'
import StudentLayout from '@/components/layout/student-layout'
import api from '@/lib/api'

interface Notice {
  id: number
  title: string
  body: string
  notice_type: string
  priority: string
  is_pinned: boolean
  created_at: string
  posted_by_name?: string
}

export default function StudentNoticesPage() {
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
      setNotices(res.data.results || res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredNotices = notices.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <StudentLayout title="Notices" activeRoute="/student/notices">
      {/* Header */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search notices..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
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
            <p className="text-lg font-medium">No notices found</p>
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <div key={notice.id} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 hover:bg-zinc-800/40 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {notice.is_pinned && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">Pinned</span>}
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      notice.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                      notice.priority === 'important' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {notice.priority}
                    </span>
                    <span className="text-xs text-zinc-500">{notice.notice_type}</span>
                  </div>
                  <h3 className="text-white font-semibold mt-2">{notice.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{notice.body}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                    <span>{notice.posted_by_name || 'School'}</span>
                    <span>•</span>
                    <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </StudentLayout>
  )
}
