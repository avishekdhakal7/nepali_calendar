'use client'

import { ShieldOff } from 'lucide-react'
import OwnerLayout from '@/components/layout/owner-layout'

export default function OwnerStudentsPage() {
  return (
    <OwnerLayout title="All Students" activeRoute="/owner/students">
      <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
        <ShieldOff className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium text-white">Access Restricted</p>
        <p className="text-sm text-zinc-500 mt-1">Student management is handled by individual school admins.</p>
      </div>
    </OwnerLayout>
  )
}
