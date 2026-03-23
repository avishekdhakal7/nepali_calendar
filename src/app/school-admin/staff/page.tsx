'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, ChevronRight, ChevronLeft, Users, Calendar } from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { Staff } from '@/types/staff'

export default function StaffListPage() {
  const router = useRouter()
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => { fetchStaff() }, [page, roleFilter])

  async function fetchStaff() {
    setLoading(true)
    try {
      const params: Record<string, string> = {
        ordering: 'first_name',
        page: String(page),
      }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter

      const res = await api.get('/staff/', { params })
      const data = res.data
      setStaff(data.results || data)
      setTotalPages(data.total_pages || 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => { fetchStaff() }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const roleColors: Record<string, string> = {
    teacher: 'bg-blue-500/10 text-blue-400',
    principal: 'bg-amber-500/10 text-amber-400',
    vice_principal: 'bg-orange-500/10 text-orange-400',
    accountant: 'bg-emerald-500/10 text-emerald-400',
    librarian: 'bg-pink-500/10 text-pink-400',
    clerk: 'bg-cyan-500/10 text-cyan-400',
    peon: 'bg-zinc-500/10 text-zinc-400',
    security: 'bg-red-500/10 text-red-400',
  }

  return (
    <SchoolAdminLayout title="Staff Management" activeRoute="/school-admin/staff">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="">All Roles</option>
            <option value="teacher">Teacher</option>
            <option value="principal">Principal</option>
            <option value="vice_principal">Vice Principal</option>
            <option value="accountant">Accountant</option>
            <option value="librarian">Librarian</option>
            <option value="clerk">Clerk</option>
            <option value="peon">Peon</option>
            <option value="security">Security</option>
          </select>
          <button
            onClick={() => router.push('/school-admin/staff/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Roles</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-zinc-800 rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-600">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No staff members found</p>
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`/school-admin/staff/${s.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-violet-400">{s.full_name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{s.full_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.is_admin && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-medium">
                            School Admin
                          </span>
                        )}
                        {(s.active_roles || []).map((role) => (
                          <span
                            key={role}
                            className={`text-xs px-2 py-0.5 rounded-full capitalize ${roleColors[role] || 'bg-zinc-700 text-zinc-400'}`}
                          >
                            {role.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> {s.joining_date}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/school-admin/staff/${s.id}`) }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/60">
            <p className="text-xs text-zinc-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </SchoolAdminLayout>
  )
}
