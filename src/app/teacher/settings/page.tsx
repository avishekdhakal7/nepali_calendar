'use client'

import { PortalLayout } from '@/components/layout/portal-layout'
import { useAuthStore } from '@/store/auth'
import { LogOut } from 'lucide-react'

export default function TeacherSettingsPage() {
  const { user, logout } = useAuthStore()

  function handleLogout() {
    logout()
    document.cookie = 'is_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    window.location.href = '/login'
  }

  return (
    <PortalLayout title="Settings">
      <div className="max-w-2xl space-y-6">

        {/* Profile */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Profile Information</h2>
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
                <p className="text-sm text-white capitalize">
                  {user?.roles?.[0]?.replace('_', ' ') || 'Teacher'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </PortalLayout>
  )
}
