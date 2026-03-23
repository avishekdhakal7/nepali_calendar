'use client'

import { useState } from 'react'

export function SidebarToggle({ children }: { children: (collapsed: boolean, setCollapsed: (v: boolean) => void) => React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  return children(collapsed, setCollapsed)
}
