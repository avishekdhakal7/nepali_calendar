'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, ChevronRight, ChevronLeft, Megaphone, Pin, PinOff } from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { Notice } from '@/types/notice'

const noticeTypeColors: Record<string, string> = {
  holiday:        'bg-blue-500/10 text-blue-400',
  emergency:      'bg-red-500/10 text-red-400',
  exam:           'bg-purple-500/10 text-purple-400',
  event:          'bg-pink-500/10 text-pink-400',
  staff_meeting:  'bg-orange-500/10 text-orange-400',
  general:        'bg-zinc-500/10 text-zinc-400',
  absent_alert:   'bg-yellow-500/10 text-yellow-400',
  low_attendance: 'bg-red-500/10 text-red-400',
}

const priorityColors: Record<string, string> = {
  urgent:    'text-red-400 bg-red-500/10 border-red-500/20',
  important: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  normal:    'text-green-400 bg-green-500/10 border-green-500/20',
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

export default function NoticeListPage() {
  const router = useRouter()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { fetchNotices() }, [page, typeFilter])

  async function fetchNotices() {
    setLoading(true)
    try {
      const params: Record<string, string> = {
        ordering: '-is_pinned,-created_at',
        page: String(page),
      }
      if (search) params.search = search
      if (typeFilter) params.type = typeFilter

      const res = await api.get('/notices/', { params })
      const data = res.data
      setNotices(data.results || data)
      setTotalPages(data.total_pages || 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => { fetchNotices() }, 300)
    return () => clearTimeout(timer)
  }, [search])

  async function togglePin(notice: Notice, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await api.patch(`/notices/${notice.id}/`, { is_pinned: !notice.is_pinned })
      fetchNotices()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <SchoolAdminLayout title="Notice Board" activeRoute="/school-admin/notices" showBell badge={notices.length}>
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search notices..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="">All Types</option>
            <option value="holiday">Holiday</option>
            <option value="emergency">Emergency</option>
            <option value="exam">Exam</option>
            <option value="event">Event</option>
            <option value="staff_meeting">Staff Meeting</option>
            <option value="general">General</option>
          </select>
          <button
            onClick={() => router.push('/school-admin/notices/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Post Notice
          </button>
        </div>
      </div>

      {/* Notice List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-6 bg-zinc-800 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-1/3" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : notices.length === 0 ? (
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-12 text-center">
            <Megaphone className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">No notices found</p>
            <button
              onClick={() => router.push('/school-admin/notices/new')}
              className="mt-3 text-xs text-blue-400 hover:text-blue-300"
            >
              Post the first notice
            </button>
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 hover:border-zinc-700/60 transition-all cursor-pointer"
              onClick={() => router.push(`/school-admin/notices/${notice.id}`)}
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-2 items-start">
                  <span className={`text-xs px-2 py-0.5 rounded-md ${noticeTypeColors[notice.notice_type] || 'bg-zinc-700 text-zinc-400'}`}>
                    {notice.notice_type_display || notice.notice_type}
                  </span>
                  <button
                    onClick={(e) => togglePin(notice, e)}
                    className={`p-1 rounded transition-colors ${notice.is_pinned ? 'text-blue-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                  >
                    {notice.is_pinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-medium text-white">{notice.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${priorityColors[notice.priority] || ''}`}>
                      {notice.priority}
                    </span>
                  </div>
                  {notice.body && (
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{notice.body}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-zinc-600">{notice.posted_by_name}</span>
                    <span className="text-xs text-zinc-700">·</span>
                    <span className="text-xs text-zinc-600">{timeAgo(notice.created_at)}</span>
                    {notice.is_pinned && (
                      <>
                        <span className="text-xs text-zinc-700">·</span>
                        <span className="text-xs text-blue-400">Pinned</span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-1" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </SchoolAdminLayout>
  )
}
