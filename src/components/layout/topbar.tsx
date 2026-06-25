'use client'

import { Menu } from 'lucide-react'
import { GlobalSearch } from './global-search'
import { Button } from '@/components/ui/button'

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1" />
      <div className="w-full max-w-md">
        <GlobalSearch />
      </div>
    </header>
  )
}
