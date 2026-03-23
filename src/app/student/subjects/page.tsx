'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, BookOpen } from 'lucide-react'
import StudentLayout from '@/components/layout/student-layout'
import api from '@/lib/api'

interface EnrolledSubject {
  id: number
  name: string
  code: string
  class_name: string
  section: string
  teacher_name?: string
  credit_hours?: number
  is_optional: boolean
}

export default function StudentSubjectsPage() {
  const [subjects, setSubjects] = useState<EnrolledSubject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSubjects() }, [])

  async function fetchSubjects() {
    setLoading(true)
    try {
      const res = await api.get('/my-subjects/')
      setSubjects(res.data.results || res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <StudentLayout title="My Subjects" activeRoute="/student/subjects">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-12 text-center">
          <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-white mb-1">No Subjects Enrolled</h3>
          <p className="text-xs text-zinc-500">Subjects will appear here once you are enrolled in a class.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(sub => (
            <div key={sub.id} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 hover:border-zinc-700/60 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                </div>
                {sub.is_optional && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">Optional</span>
                )}
              </div>
              <h3 className="text-sm font-medium text-white mb-1">{sub.name}</h3>
              <p className="text-xs text-zinc-500 font-mono mb-2">{sub.code}</p>
              <div className="space-y-1">
                <p className="text-xs text-zinc-400">
                  Class {sub.class_name} - {sub.section}
                </p>
                {sub.teacher_name && (
                  <p className="text-xs text-zinc-500">Teacher: {sub.teacher_name}</p>
                )}
                {sub.credit_hours && (
                  <p className="text-xs text-zinc-600">{sub.credit_hours} credit hour{sub.credit_hours !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  )
}
