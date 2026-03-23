'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Plus, Mail, Phone, ArrowLeft } from 'lucide-react'
import StudentLayout from '@/components/layout/student-layout'
import { useAuthStore } from '@/store/auth'

export default function StudentProfilePage() {
  const router = useRouter()
  const { user } = useAuthStore()

  return (
    <StudentLayout title="My Profile" activeRoute="/student/profile">
      {/* Profile Card */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user?.full_name || 'Student'}</h1>
            <p className="text-sm text-zinc-500">{user?.email}</p>
            <span className="inline-block mt-2 text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">Student</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-zinc-800/40">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-zinc-500" />
              <span className="text-xs text-zinc-500">Email</span>
            </div>
            <span className="text-sm text-white">{user?.email || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-zinc-800/40">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-zinc-500" />
              <span className="text-xs text-zinc-500">Admission No.</span>
            </div>
            <span className="text-sm text-white">{user?.admission_number || '—'}</span>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-zinc-500">More profile details will be shown once connected to the backend.</p>
    </StudentLayout>
  )
}
