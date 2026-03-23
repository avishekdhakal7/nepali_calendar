'use client'

import { useState } from 'react'
import StaffSidebar from '@/components/layout/staff-sidebar'
import PageHeader from '@/components/layout/page-header'

interface StaffLayoutProps {
  children: React.ReactNode
  title: string
  activeRoute: string
  showBell?: boolean
  badge?: number
}

export default function StaffLayout({
  children,
  title,
  activeRoute,
  showBell = false,
  badge = 0,
}: StaffLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <StaffSidebar activeRoute={activeRoute} />

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
