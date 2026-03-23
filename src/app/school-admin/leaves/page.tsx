'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { LeaveRequest } from '@/types/leave'

export default function LeaveListPage() {
  const router = useRouter()
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { fetchLeaves() }, [page, statusFilter])

  async function fetchLeaves() {
    setLoading(true)
    try {
      const params: Record<string, string> = { ordering: '-applied_at', page: String(page) }
      if (statusFilter) params.status = statusFilter

      const res = await api.get('/leave-requests/', { params })
      const data = res.data
      setLeaves(data.results || data)
      setTotalPages(data.total_pages || 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const statusIcon: Record<string, React.ReactNode> = {
    pending:  <Clock className="w-3.5 h-3.5 text-yellow-400" />,
    approved: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    rejected: <XCircle className="w-3.5 h-3.5 text-red-400" />,
  }
  const statusBg: Record<string, string> = {
    pending:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <SchoolAdminLayout title="Leave Requests" activeRoute="/school-admin/leaves">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <p className="text-xs text-zinc-500">{leaves.length} request{leaves.length !== 1 ? 's' : ''}</p>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-1/3" />
            </div>
          ))
        ) : leaves.length === 0 ? (
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-12 text-center">
            <FileText className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">No leave requests found</p>
          </div>
        ) : (
          leaves.map((leave) => (
            <div
              key={leave.id}
              className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 hover:border-zinc-700/60 transition-all cursor-pointer"
              onClick={() => router.push(`/school-admin/leaves/${leave.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{leave.student_name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 capitalize ${statusBg[leave.status]}`}>
                      {statusIcon[leave.status]}
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 truncate">{leave.reason}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {leave.from_date_ad} → {leave.to_date_ad}
                    {leave.total_days > 0 && ` (${leave.total_days} day${leave.total_days !== 1 ? 's' : ''})`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-1" />
              </div>
            </div>
          ))
        )}
      </div>

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
