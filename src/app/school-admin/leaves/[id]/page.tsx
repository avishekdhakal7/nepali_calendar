'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, XCircle, Clock, Calendar, Phone, User, FileText } from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { LeaveRequestDetail } from '@/types/leave'

export default function LeaveDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [leave, setLeave] = useState<LeaveRequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)

  useEffect(() => { fetchLeave() }, [id])

  async function fetchLeave() {
    try {
      const res = await api.get(`/leave-requests/${id}/`)
      setLeave(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove() {
    setActionLoading(true)
    try {
      await api.post(`/leave-requests/${id}/approve/`)
      router.push('/school-admin/leaves')
    } catch (err) {
      console.error(err)
      setActionLoading(false)
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) return
    setActionLoading(true)
    try {
      await api.post(`/leave-requests/${id}/reject/`, { reason: rejectReason })
      router.push('/school-admin/leaves')
    } catch (err) {
      console.error(err)
      setActionLoading(false)
    }
  }

  const statusBg: Record<string, string> = {
    pending:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  if (loading) {
    return (
      <SchoolAdminLayout title="Leave Request" activeRoute="/school-admin/leaves">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </SchoolAdminLayout>
    )
  }

  if (!leave) {
    return (
      <SchoolAdminLayout title="Leave Request" activeRoute="/school-admin/leaves">
        <p className="text-zinc-500">Leave request not found</p>
      </SchoolAdminLayout>
    )
  }

  return (
    <SchoolAdminLayout title="Leave Request" activeRoute="/school-admin/leaves">
      <button onClick={() => router.push('/school-admin/leaves')} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Leaves
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Banner */}
          <div className={`border rounded-xl p-5 flex items-center gap-3 ${statusBg[leave.status]}`}>
            {leave.status === 'pending' && <Clock className="w-5 h-5" />}
            {leave.status === 'approved' && <CheckCircle2 className="w-5 h-5" />}
            {leave.status === 'rejected' && <XCircle className="w-5 h-5" />}
            <div>
              <p className="text-sm font-semibold capitalize">{leave.status}</p>
              {leave.approved_by && <p className="text-xs opacity-70">By {leave.approved_by} on {leave.approved_at}</p>}
              {leave.status === 'rejected' && leave.rejection_reason && (
                <p className="text-xs opacity-70">Reason: {leave.rejection_reason}</p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-400" />
              Leave Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Student</p>
                <p className="text-sm text-white">{leave.student_name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Reason</p>
                <p className="text-sm text-white">{leave.reason}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">From</p>
                <p className="text-sm text-white flex items-center gap-1"><Calendar className="w-3 h-3" />{leave.from_date_ad}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">To</p>
                <p className="text-sm text-white flex items-center gap-1"><Calendar className="w-3 h-3" />{leave.to_date_ad}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Days</p>
                <p className="text-sm text-white">{leave.total_days} day{leave.total_days !== 1 ? 's' : ''}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Applied</p>
                <p className="text-sm text-white">{new Date(leave.applied_at).toLocaleDateString()}</p>
              </div>
              {leave.parent_name && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Parent</p>
                  <p className="text-sm text-white">{leave.parent_name}</p>
                </div>
              )}
              {leave.parent_phone && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Parent Contact</p>
                  <p className="text-sm text-white flex items-center gap-1"><Phone className="w-3 h-3" />{leave.parent_phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Reject Form */}
          {showReject && (
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Rejection Reason</h3>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                className={inputClass}
                placeholder="Enter reason for rejection..."
              />
              <div className="flex gap-2">
                <button onClick={() => setShowReject(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
                <button onClick={handleReject} disabled={actionLoading || !rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg disabled:opacity-50">
                  {actionLoading ? 'Submitting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions Sidebar */}
        {leave.status === 'pending' && (
          <div className="space-y-4">
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Actions</h3>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {actionLoading ? 'Processing...' : 'Approve Leave'}
              </button>
              {!showReject && (
                <button
                  onClick={() => setShowReject(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg border border-red-500/20 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Leave
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </SchoolAdminLayout>
  )
}
