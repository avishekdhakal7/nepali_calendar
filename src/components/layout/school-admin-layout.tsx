'use client'

import { useState } from 'react'
import SchoolAdminSidebar from '@/components/layout/school-admin-sidebar'
import PageHeader from '@/components/layout/page-header'

interface SchoolAdminLayoutProps {
  children: React.ReactNode
  title: string
  activeRoute: string
  showBell?: boolean
  badge?: number
}

export default function SchoolAdminLayout({
  children,
  title,
  activeRoute,
  showBell = false,
  badge = 0,
}: SchoolAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <SchoolAdminSidebar activeRoute={activeRoute} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-60' : 'lg:ml-16'}`}>
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
