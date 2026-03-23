'use client'

import { FileText } from 'lucide-react'
import TeacherLayout from '@/components/layout/teacher-layout'

export default function TeacherReportsPage() {
  return (
    <TeacherLayout title="Reports" activeRoute="/teacher/reports">
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-8 text-center">
        <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Reports Coming Soon</h2>
        <p className="text-sm text-zinc-500">Attendance reports and class analytics will be available here.</p>
      </div>
    </TeacherLayout>
  )
}
