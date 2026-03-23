'use client'

import { FileText } from 'lucide-react'
import StudentLayout from '@/components/layout/student-layout'

export default function StudentReportsPage() {
  return (
    <StudentLayout title="Reports" activeRoute="/student/reports">
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-8 text-center">
        <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Reports Coming Soon</h2>
        <p className="text-sm text-zinc-500">Your academic reports and progress cards will be available here.</p>
      </div>
    </StudentLayout>
  )
}
