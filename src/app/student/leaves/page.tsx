'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, Plus, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import StudentLayout from '@/components/layout/student-layout'
import api from '@/lib/api'

interface LeaveRequest {
  id: number
  from_date_ad: string
  to_date_ad: string
  from_date_bs?: string
  to_date_bs?: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  applied_on: string
  approved_by?: string
}

export default function StudentLeavesPage() {
  const router = useRouter()
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ from_date_ad: '', to_date_ad: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchLeaves()
  }, [])

  async function fetchLeaves() {
    setLoading(true)
    try {
      const res = await api.get('/leave-requests/my/')
      setLeaves(res.data.results || res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.from_date_ad || !form.to_date_ad || !form.reason) return
    setSubmitting(true)
    try {
      await api.post('/leave-requests/my/', {
        from_date_ad: form.from_date_ad,
        to_date_ad: form.to_date_ad,
        reason: form.reason,
      })
      setShowForm(false)
      setForm({ from_date_ad: '', to_date_ad: '', reason: '' })
      fetchLeaves()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <StudentLayout title="Leave Requests" activeRoute="/student/leaves">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-zinc-500">{leaves.length} leave request{leaves.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Apply for Leave</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">From Date</label>
                <input
                  type="date"
                  required
                  value={form.from_date_ad}
                  onChange={e => setForm({ ...form, from_date_ad: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">To Date</label>
                <input
                  type="date"
                  required
                  value={form.to_date_ad}
                  onChange={e => setForm({ ...form, to_date_ad: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Reason</label>
              <textarea
                required
                rows={3}
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500"
                placeholder="Enter reason for leave..."
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave Requests List */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
        <div className="divide-y divide-zinc-800/40">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-5 py-4 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-48 mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-32" />
              </div>
            ))
          ) : leaves.length === 0 ? (
            <div className="px-5 py-12 text-center text-zinc-600">
              <ClipboardList className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No leave requests yet</p>
            </div>
          ) : (
            leaves.map((leave) => (
              <div key={leave.id} className="px-5 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white">{leave.from_date_ad} to {leave.to_date_ad}</p>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        leave.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        leave.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{leave.reason}</p>
                    <p className="text-xs text-zinc-600 mt-1">Applied: {new Date(leave.applied_on).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </StudentLayout>
  )
}
