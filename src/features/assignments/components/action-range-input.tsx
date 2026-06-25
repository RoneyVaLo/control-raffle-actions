'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { parseActionRange } from '@/lib/utils'

interface ActionRangeInputProps {
  onChange: (numbers: number[]) => void
}

export function ActionRangeInput({ onChange }: ActionRangeInputProps) {
  const [value, setValue] = useState('')
  const [preview, setPreview] = useState<number[]>([])

  const handleChange = (val: string) => {
    setValue(val)
    const numbers = parseActionRange(val)
    setPreview(numbers)
    onChange(numbers)
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder="Ej: 1001, 1001-1005, 1001,1002,1003"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      />
      {preview.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <p className="text-xs text-gray-500 w-full">
            {preview.length} accion{preview.length !== 1 ? 'es' : ''}:
          </p>
          <div className="flex flex-wrap gap-1">
            {preview.slice(0, 30).map((n) => (
              <span key={n} className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {n}
              </span>
            ))}
            {preview.length > 30 && (
              <span className="text-xs text-gray-400">y {preview.length - 30} más</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
