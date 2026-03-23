'use client'

import { BarChart3, Download, FileText } from 'lucide-react'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'

export default function ReportsPage() {
  return (
    <SchoolAdminLayout title="Reports" activeRoute="/school-admin/reports">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Attendance Report', desc: 'Daily and monthly attendance summaries', color: 'emerald' },
          { label: 'Student Report', desc: 'Enrollment, demographics, and performance', color: 'blue' },
          { label: 'Staff Report', desc: 'Staff roster, roles, and salary summary', color: 'violet' },
          { label: 'Fee Report', desc: 'Collection, outstanding, and waiver report', color: 'orange' },
          { label: 'Library Report', desc: 'Book inventory and circulation summary', color: 'pink' },
          { label: 'Notice Report', desc: 'Posted notices and view statistics', color: 'cyan' },
        ].map((report) => (
          <div key={report.label} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 hover:border-zinc-700/60 transition-all">
            <div className={`w-10 h-10 rounded-lg bg-${report.color}-500/10 flex items-center justify-center mb-3`}>
              <FileText className={`w-5 h-5 text-${report.color}-400`} />
            </div>
            <h3 className="text-sm font-medium text-white mb-1">{report.label}</h3>
            <p className="text-xs text-zinc-500 mb-4">{report.desc}</p>
            <button className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
              <Download className="w-3.5 h-3.5" /> Generate Report
            </button>
          </div>
        ))}
      </div>
    </SchoolAdminLayout>
  )
}
