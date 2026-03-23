'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Users, GraduationCap, Calendar, ChevronRight } from 'lucide-react'
import TeacherLayout from '@/components/layout/teacher-layout'
import api from '@/lib/api'

interface ClassTeacherAssignment {
  id: number
  class_name: string
  section: string
  section_id: number
  academic_year: string
}

interface SubjectTeacherAssignment {
  id: number
  subject_name: string
  class_name: string
  section: string
  section_id: number
}

export default function TeacherClassesPage() {
  const router = useRouter()
  const [classes, setClasses] = useState<ClassTeacherAssignment[]>([])
  const [subjects, setSubjects] = useState<SubjectTeacherAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [classRes, subRes] = await Promise.all([
        api.get('/my-classes/'),
        api.get('/my-subjects/'),
      ])
      setClasses(classRes.data.results || classRes.data)
      setSubjects(subRes.data.results || subRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <TeacherLayout title="My Classes" activeRoute="/teacher/classes">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Class Teacher Assignments */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-green-400" />
              <h2 className="text-sm font-semibold text-white">Class Teacher Assignments</h2>
              <span className="text-xs text-zinc-500 ml-auto">{classes.length} class{classes.length !== 1 ? 'es' : ''}</span>
            </div>
            <div className="divide-y divide-zinc-800/40">
              {classes.length === 0 ? (
                <div className="px-5 py-10 text-center text-zinc-600 text-sm">
                  No class teacher assignments yet
                </div>
              ) : classes.map(cls => (
                <div
                  key={cls.id}
                  className="px-5 py-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/teacher/attendance?section=${cls.section_id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Class {cls.class_name} - {cls.section}</p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {cls.academic_year}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Subject Teacher Assignments */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Subject Teacher Assignments</h2>
              <span className="text-xs text-zinc-500 ml-auto">{subjects.length} subject{subjects.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y divide-zinc-800/40">
              {subjects.length === 0 ? (
                <div className="px-5 py-10 text-center text-zinc-600 text-sm">
                  No subject assignments yet
                </div>
              ) : subjects.map(sub => (
                <div key={sub.id} className="px-5 py-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{sub.subject_name}</p>
                      <p className="text-xs text-zinc-500">
                        Class {sub.class_name} - {sub.section}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  )
}
