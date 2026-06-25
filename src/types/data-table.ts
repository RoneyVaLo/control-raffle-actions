import { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  sortable?: boolean
  className?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string | number
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}
