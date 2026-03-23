'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Settings, User, Bell, Shield, LogOut, Save } from 'lucide-react'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [tab, setTab] = useState<'profile' | 'notifications' | 'security'>('profile')

  function handleLogout() {
    logout()
    document.cookie = 'is_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/login')
  }

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: Shield },
  ] as const

  const inputClass = "w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  return (
    <SchoolAdminLayout title="Settings" activeRoute="/school-admin/settings">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3 h-fit">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                tab === t.key
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {tab === 'profile' && (
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Profile Information
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{user?.full_name?.[0] || 'S'}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user?.full_name || 'School Admin'}</p>
                  <p className="text-xs text-zinc-500">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Full Name</label>
                  <input defaultValue={user?.full_name || ''} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Email</label>
                  <input defaultValue={user?.email || ''} type="email" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">School</label>
                  <input defaultValue={user?.school_name || ''} className={inputClass} />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                Notification Preferences
              </h3>
              {['New student admission', 'Leave requests', 'Staff attendance alerts', 'Fee payment updates'].map((item) => (
                <div key={item} className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-lg">
                  <span className="text-sm text-white">{item}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {tab === 'security' && (
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-400" />
                Security Settings
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-zinc-800/40 rounded-lg">
                  <p className="text-sm text-white mb-1">Change Password</p>
                  <p className="text-xs text-zinc-500 mb-3">Update your account password</p>
                  <button className="text-xs text-blue-400 hover:text-blue-300">Change Password</button>
                </div>
                <div className="p-3 bg-zinc-800/40 rounded-lg">
                  <p className="text-sm text-white mb-1">Active Sessions</p>
                  <p className="text-xs text-zinc-500 mb-3">Manage your logged-in devices</p>
                  <button className="text-xs text-blue-400 hover:text-blue-300">View Sessions</button>
                </div>
                <div className="pt-4 border-t border-zinc-800/60">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-lg border border-red-500/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out All Devices
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SchoolAdminLayout>
  )
}
