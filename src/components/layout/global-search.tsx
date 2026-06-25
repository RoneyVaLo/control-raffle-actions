'use client'

import { useRouter } from 'next/navigation'
import { SearchInput } from '@/components/ui/search-input'
import { useState } from 'react'

export function GlobalSearch() {
  const router = useRouter()
  const [value, setValue] = useState('')

  const handleSearch = (val: string) => {
    setValue(val)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      const trimmed = value.trim()
      if (/^\d+$/.test(trimmed)) {
        router.push(`/actions/${trimmed}`)
      } else {
        router.push(`/students?q=${encodeURIComponent(trimmed)}`)
      }
      setValue('')
    }
  }

  return (
    <SearchInput
      placeholder="Buscar acción (#) o estudiante..."
      value={value}
      onChange={(e) => handleSearch(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  )
}
