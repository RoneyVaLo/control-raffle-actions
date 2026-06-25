'use client'

import { SearchInput } from './search-input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select'
import { Button } from './button'
import { RotateCcw } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
}

interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
  placeholder?: string
}

interface FilterBarProps {
  filters: FilterConfig[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  onReset?: () => void
}

export function FilterBar({
  filters,
  values,
  onChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  onReset,
}: FilterBarProps) {
  const hasActiveFilters =
    Object.values(values).some((v) => v !== '') || (searchValue && searchValue !== '')

  return (
    <div className="flex flex-wrap items-end gap-3">
      {onSearchChange && (
        <div className="w-full sm:w-64">
          <SearchInput
            placeholder={searchPlaceholder}
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
      {filters.map((filter) => (
        <div key={filter.key} className="w-full sm:w-48">
          <Select
            value={values[filter.key] || ''}
            onValueChange={(value) => onChange(filter.key, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder || filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      {hasActiveFilters && onReset && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="mr-1 h-3 w-3" />
          Limpiar
        </Button>
      )}
    </div>
  )
}
