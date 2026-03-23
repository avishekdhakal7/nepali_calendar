'use client'

import { PortalLayout } from '@/components/layout/portal-layout'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { CheckCircle, XCircle } from 'lucide-react'

interface LeaveRequest {
  id: number
  student_name: string
  enrollment_id: number
  from_date_ad: string
  to_date_ad: string
  reason: string
  status: string
  applied_on: string
}

const statusColors: Record<string, string> = {
  pending:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function TeacherLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchLeaves() }, [])

  async function fetchLeaves() {
    setLoading(true)
    try {
      const res = await api.get('/leave-requests/')
      setLeaves(res.data.results || res.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function approve(id: number) {
    try {
      await api.post(`/leave-requests/${id}/approve/`)
      fetchLeaves()
    } catch (e) {
      console.error(e)
      alert('Failed to approve')
    }
  }

  async function reject(id: number) {
    try {
      await api.post(`/leave-requests/${id}/reject/`)
      fetchLeaves()
    } catch (e) {
      console.error(e)
      alert('Failed to reject')
    }
  }

  const filtered = filter === 'all' ? leaves : leaves.filter(l => l.status === filter)
  const pendingCount = leaves.filter(l => l.status === 'pending').length

  return (
    <PortalLayout title="Leave Requests">
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm rounded-lg transition-all border ${
              filter === f
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border-transparent'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-1/3 mb-2" />
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <CheckCircle className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">No leave requests</p>
          </div>
        ) : (
          filtered.map(leave => (
            <div key={leave.id} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{leave.student_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${statusColors[leave.status]}`}>
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    {leave.from_date_ad} → {leave.to_date_ad}
                  </p>
                  <p className="text-sm text-zinc-400 mt-1">{leave.reason}</p>
                  <p className="text-xs text-zinc-600 mt-1">Applied: {new Date(leave.applied_on).toLocaleDateString()}</p>
                </div>
                {leave.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => approve(leave.id)}
                      className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-all"
                      title="Approve"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => reject(leave.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                      title="Reject"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </PortalLayout>
  )
}
