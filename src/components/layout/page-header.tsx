'use client'

import { Bell, Settings, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  title: string
  showBell?: boolean
  showSettings?: boolean
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
  badge?: number
  children?: React.ReactNode
}

export default function PageHeader({
  title,
  showBell = false,
  showSettings = false,
  sidebarOpen = true,
  onToggleSidebar,
  badge = 0,
  children,
}: PageHeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-30 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="text-base font-semibold text-white">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {showBell && (
          <button
            onClick={() => router.push('/school-admin/notices')}
            className="relative p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <Bell className="w-4 h-4" />
            {badge > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </button>
        )}
        {showSettings && (
          <button
            onClick={() => router.push('/school-admin/settings')}
            className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  )
}
