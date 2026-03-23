'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, ChevronRight, ChevronLeft, GraduationCap, Phone, Mail, Calendar, Users, ArrowUpDown } from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { Student } from '@/types/student'

export default function StudentListPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { fetchStudents() }, [page, genderFilter])

  async function fetchStudents() {
    setLoading(true)
    try {
      const params: Record<string, string> = {
        ordering: '-admission_date',
        page: String(page),
      }
      if (search) params.search = search
      if (genderFilter) params.gender = genderFilter

      const res = await api.get('/students/', { params })
      const data = res.data
      setStudents(data.results || data)
      setTotalPages(data.total_pages || 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => { fetchStudents() }, 300)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <SchoolAdminLayout title="Student Management" activeRoute="/school-admin/students">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, admission no..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <select
            value={genderFilter}
            onChange={(e) => { setGenderFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <button
            onClick={() => router.push('/school-admin/students/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
          <button
            onClick={() => router.push('/school-admin/students/enroll')}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Users className="w-4 h-4" />
            Enroll
          </button>
          <button
            onClick={() => router.push('/school-admin/promotions')}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            Promotions
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Admission No.</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Class</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Gender</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Admission Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-zinc-800 rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-600">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No students found</p>
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`/school-admin/students/${s.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-400">{s.full_name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{s.full_name}</p>
                          {s.email && <p className="text-xs text-zinc-500 flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400 font-mono">{s.admission_number}</td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {s.current_class ? `${s.current_class.class}-${s.current_class.section}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400 capitalize">{s.gender}</td>
                    <td className="px-4 py-3 text-sm text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{s.admission_date}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/school-admin/students/${s.id}`) }}
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
