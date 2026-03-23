'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, User, LogOut } from 'lucide-react'
import StaffLayout from '@/components/layout/staff-layout'
import { useAuthStore } from '@/store/auth'

export default function StaffSettingsPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  function handleLogout() {
    logout()
    document.cookie = 'is_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/login')
  }

  return (
    <StaffLayout title="Settings" activeRoute="/staff/settings">
      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-cyan-400" />
            Profile Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-zinc-800/40">
              <div>
                <p className="text-xs text-zinc-500">Full Name</p>
                <p className="text-sm text-white">{user?.full_name || '—'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-zinc-800/40">
              <div>
                <p className="text-xs text-zinc-500">Email</p>
                <p className="text-sm text-white">{user?.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-xs text-zinc-500">Role</p>
                <p className="text-sm text-white">Staff</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </StaffLayout>
  )
}
