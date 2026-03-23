'use client'

import { useState, useEffect } from 'react'
import { Users, Search } from 'lucide-react'
import TeacherLayout from '@/components/layout/teacher-layout'
import api from '@/lib/api'

interface Student {
  id: number
  student_id: number
  full_name: string
  admission_number: string
  roll_number: number
  class_name: string
  section: string
}

interface ClassAssignment {
  id: number
  section: { id: number; name: string; academic_class: { id: number; name: string } }
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    setLoading(true)
    try {
      // First get teacher's assigned sections
      const classesRes = await api.get('/my-classes/')
      const assignments: ClassAssignment[] = classesRes.data.results || classesRes.data || []

      // Fetch students from all assigned sections
      const sectionIds = assignments.map(c => c.section.id)
      const uniqueSectionIds = [...new Set(sectionIds)]

      const studentPromises = uniqueSectionIds.map(sectionId =>
        api.get(`/sections/${sectionId}/students/`).catch(() => ({ data: [] }))
      )

      const results = await Promise.all(studentPromises)
      const allStudents: Student[] = results.flatMap((res, i) => {
        const sectionStudents = res.data.results || res.data || []
        const sectionName = assignments.find(a => a.section.id === uniqueSectionIds[i])?.section.name || ''
        const className = assignments.find(a => a.section.id === uniqueSectionIds[i])?.section.academic_class.name || ''
        return sectionStudents.map((s: Record<string, unknown>) => ({
          ...s,
          class_name: className,
          section: sectionName,
        }))
      })

      setStudents(allStudents)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.admission_number?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <TeacherLayout title="My Students" activeRoute="/teacher/students">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
        />
      </div>

      {/* Students List */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60">
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Roll</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Name</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Admission No.</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Class</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-5 py-3"><div className="h-4 bg-zinc-800 rounded w-8 animate-pulse" /></td>
                  <td className="px-5 py-3"><div className="h-4 bg-zinc-800 rounded w-32 animate-pulse" /></td>
                  <td className="px-5 py-3"><div className="h-4 bg-zinc-800 rounded w-24 animate-pulse" /></td>
                  <td className="px-5 py-3"><div className="h-4 bg-zinc-800 rounded w-20 animate-pulse" /></td>
                </tr>
              ))
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-zinc-600">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No students found</p>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 text-sm text-white">{student.roll_number}</td>
                  <td className="px-5 py-3 text-sm text-white">{student.full_name}</td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{student.admission_number}</td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{student.class_name} - {student.section}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </TeacherLayout>
  )
}
