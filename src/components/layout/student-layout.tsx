'use client'

import { useState } from 'react'
import StudentSidebar from '@/components/layout/student-sidebar'
import PageHeader from '@/components/layout/page-header'

interface StudentLayoutProps {
  children: React.ReactNode
  title: string
  activeRoute: string
  showBell?: boolean
  badge?: number
}

export default function StudentLayout({
  children,
  title,
  activeRoute,
  showBell = false,
  badge = 0,
}: StudentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <StudentSidebar activeRoute={activeRoute} />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <PageHeader
          title={title}
          showBell={showBell}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          badge={badge}
        />
        <div className="p-6 space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}
