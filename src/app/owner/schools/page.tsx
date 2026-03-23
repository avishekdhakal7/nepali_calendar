'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Search, ChevronRight, Mail, Phone, MapPin } from 'lucide-react'
import OwnerLayout from '@/components/layout/owner-layout'
import api from '@/lib/api'

interface School {
  id: number
  name: string
  email: string
  contact_number: string
  district: string
  municipality: string
  is_active: boolean
  established_year: number
  school_type: string
  staff_count?: number
  student_count?: number
}

export default function SchoolsPage() {
  const router = useRouter()
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchSchools()
  }, [])

  async function fetchSchools() {
    setLoading(true)
    try {
      const res = await api.get('/schools/')
      setSchools(res.data.results || res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredSchools = schools.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.district?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <OwnerLayout title="Schools" activeRoute="/owner/schools">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search schools..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <button
          onClick={() => router.push('/owner/schools/new')}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add School
        </button>
      </div>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 animate-pulse">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl mb-4" />
              <div className="h-5 bg-zinc-800 rounded w-3/4 mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-1/2" />
            </div>
          ))
        ) : filteredSchools.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-zinc-600">
            <Building2 className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">No schools found</p>
            <p className="text-sm">{search ? 'Try a different search term' : 'Add your first school to get started'}</p>
          </div>
        ) : (
          filteredSchools.map((school) => (
            <button
              key={school.id}
              onClick={() => router.push(`/owner/schools/${school.id}`)}
              className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 hover:bg-zinc-800/40 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold truncate">{school.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${school.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {school.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 truncate">{school.district}, {school.municipality}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-800/40 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500">Staff</p>
                  <p className="text-sm font-medium text-white">{school.staff_count || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Students</p>
                  <p className="text-sm font-medium text-white">{school.student_count || 0}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {school.email}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors" />
              </div>
            </button>
          ))
        )}
      </div>
    </OwnerLayout>
  )
}
