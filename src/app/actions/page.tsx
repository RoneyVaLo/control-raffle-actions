'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { FilterBar } from '@/components/ui/filter-bar'
import type { Column } from '@/components/ui/data-table'
import type { RaffleActionWithRelations } from '@/types'

const statusBadge = (status: string) => {
  const variants: Record<string, 'paid' | 'pending' | 'returned'> = {
    PAID: 'paid', PENDING: 'pending', RETURNED: 'returned',
  }
  const labels: Record<string, string> = {
    PAID: 'Pagada', PENDING: 'Pendiente', RETURNED: 'Devuelta',
  }
  return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>
}

const paymentBadge = (method: string | null) => {
  if (!method) return <span className="text-gray-400">—</span>
  const variants: Record<string, 'sinpe' | 'cash'> = { SINPE: 'sinpe', CASH: 'cash' }
  return <Badge variant={variants[method] || 'default'}>{method}</Badge>
}

export default function ActionsPage() {
  const router = useRouter()
  const [data, setData] = useState<RaffleActionWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sections, setSections] = useState<{ value: string; label: string }[]>([])
  const [filters, setFilters] = useState<Record<string, string>>({
    status: '', payment_method: '', section_id: '', student_id: '',
  })
  const [searchValue, setSearchValue] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (filters.status) params.set('status', filters.status)
      if (filters.payment_method) params.set('payment_method', filters.payment_method)
      if (filters.section_id) params.set('section_id', filters.section_id)
      if (filters.student_id) params.set('student_id', filters.student_id)
      if (searchValue) params.set('q', searchValue)

      const [actionsRes, sectionsRes] = await Promise.all([
        fetch(`/api/raffle-actions?${params}`),
        fetch('/api/sections'),
      ])
      const actionsData = await actionsRes.json()
      const sectionsData = await sectionsRes.json()
      setData(actionsData.data ?? [])
      setTotalPages(actionsData.totalPages ?? 1)
      setSections(sectionsData.map((s: any) => ({ value: s.id, label: s.name })))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, filters, searchValue])

  useEffect(() => { fetchData() }, [fetchData])

  const columns: Column<RaffleActionWithRelations>[] = [
    { key: 'action_number', header: 'Acción', className: 'font-medium' },
    { key: 'student_name', header: 'Estudiante', render: (a) => a.student_name || '-' },
    { key: 'section_name', header: 'Sección', render: (a) => a.section_name || '-' },
    { key: 'status', header: 'Estado', render: (a) => statusBadge(a.status) },
    { key: 'payment_method', header: 'Pago', render: (a) => paymentBadge(a.payment_method) },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Acciones</h1>

      <FilterBar
        filters={[
          { key: 'status', label: 'Estado', placeholder: 'Todos los estados', options: [
            { value: 'PENDING', label: 'Pendiente' },
            { value: 'PAID', label: 'Pagada' },
            { value: 'RETURNED', label: 'Devuelta' },
          ]},
          { key: 'payment_method', label: 'Método', placeholder: 'Todos los métodos', options: [
            { value: 'SINPE', label: 'SINPE' },
            { value: 'CASH', label: 'Efectivo' },
          ]},
          { key: 'section_id', label: 'Sección', placeholder: 'Todas las secciones', options: sections },
        ]}
        values={filters}
        onChange={(key, value) => { setFilters((prev) => ({ ...prev, [key]: value })); setPage(1) }}
        searchValue={searchValue}
        onSearchChange={(v) => { setSearchValue(v); setPage(1) }}
        searchPlaceholder="Buscar por # acción o nombre..."
        onReset={() => { setFilters({ status: '', payment_method: '', section_id: '', student_id: '' }); setSearchValue(''); setPage(1) }}
      />

      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(a) => a.id}
        loading={loading}
        emptyMessage="No se encontraron acciones"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onRowClick={(action) => router.push(`/actions/${action.action_number}`)}
      />
    </div>
  )
}
