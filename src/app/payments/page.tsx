'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SearchInput } from '@/components/ui/search-input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { Column } from '@/components/ui/data-table'
import type { Section, RaffleAction, ActionStatus, PaymentMethod } from '@/types'

const statusBadge = (status: string) => {
  const variants: Record<string, 'paid' | 'pending' | 'returned'> = {
    PAID: 'paid', PENDING: 'pending', RETURNED: 'returned',
  }
  const labels: Record<string, string> = {
    PAID: 'Pagada', PENDING: 'Pendiente', RETURNED: 'Devuelta',
  }
  return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>
}

interface ActionWithStudent extends RaffleAction {
  student_name?: string
}

export default function PaymentsPage() {
  const router = useRouter()
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSection, setSelectedSection] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [students, setStudents] = useState<{ id: string; full_name: string }[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [actions, setActions] = useState<ActionWithStudent[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmBulk, setConfirmBulk] = useState<{
    status: ActionStatus
    payment_method?: PaymentMethod | null
    label: string
  } | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/sections').then((r) => r.json()).then(setSections)
  }, [])

  useEffect(() => {
    if (!selectedSection && !searchQuery) {
      setStudents([])
      return
    }
    const params = new URLSearchParams()
    if (selectedSection) params.set('section_id', selectedSection)
    if (searchQuery) params.set('q', searchQuery)
    fetch(`/api/students?${params}`)
      .then((r) => r.json())
      .then(setStudents)
  }, [selectedSection, searchQuery])

  useEffect(() => {
    if (!selectedStudent) {
      setActions([])
      return
    }
    setLoading(true)
    fetch(`/api/students/${selectedStudent}/actions`)
      .then((r) => r.json())
      .then((data) => {
        setActions(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedStudent])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === actions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(actions.map((a) => a.id)))
    }
  }

  const handleBulkUpdate = async () => {
    if (!confirmBulk) return
    setBulkLoading(true)
    try {
      const ids = selectedIds.size > 0
        ? Array.from(selectedIds)
        : actions.map((a) => a.id)
      await fetch('/api/raffle-actions/bulk-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_ids: ids,
          status: confirmBulk.status,
          payment_method: confirmBulk.payment_method,
        }),
      })
      setConfirmBulk(null)
      setSelectedIds(new Set())
      const res = await fetch(`/api/students/${selectedStudent}/actions`)
      const data = await res.json()
      setActions(data)
    } catch {
      console.error('Error en actualización masiva')
    } finally {
      setBulkLoading(false)
    }
  }

  const totalPaid = actions.filter((a) => a.status === 'PAID').length
  const totalPending = actions.filter((a) => a.status === 'PENDING').length
  const totalReturned = actions.filter((a) => a.status === 'RETURNED').length
  const totalSinpe = actions.filter((a) => a.payment_method === 'SINPE').length
  const totalCash = actions.filter((a) => a.payment_method === 'CASH').length

  const columns: Column<ActionWithStudent>[] = [
    {
      key: 'select',
      header: '',
      render: (a) => (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300"
          checked={selectedIds.has(a.id)}
          onChange={() => toggleSelect(a.id)}
        />
      ),
    },
    { key: 'action_number', header: 'Acción', className: 'font-medium' },
    { key: 'status', header: 'Estado', render: (a) => statusBadge(a.status) },
    {
      key: 'payment_method',
      header: 'Pago',
      render: (a) =>
        a.payment_method ? (
          <Badge variant={a.payment_method === 'SINPE' ? 'sinpe' : 'cash'}>{a.payment_method}</Badge>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
  ]

  const bulkActions = [
    { status: 'PAID' as ActionStatus, payment_method: 'SINPE' as PaymentMethod, label: 'Todas SINPE', className: 'bg-blue-600 hover:bg-blue-700' },
    { status: 'PAID' as ActionStatus, payment_method: 'CASH' as PaymentMethod, label: 'Todas EFECTIVO', className: 'bg-purple-600 hover:bg-purple-700' },
    { status: 'RETURNED' as ActionStatus, label: 'Todas DEVUELTAS', className: 'bg-red-600 hover:bg-red-700' },
    { status: 'PENDING' as ActionStatus, label: 'Todas PENDIENTES' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pagos</h1>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-48">
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por sección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {sections.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-64">
          <SearchInput
            placeholder="Buscar estudiante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Estudiantes</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto rounded-lg border border-gray-200 p-2">
            {students.length === 0 && (selectedSection || searchQuery) ? (
              <p className="text-sm text-gray-500 py-4 text-center">Sin resultados</p>
            ) : students.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">Seleccione un filtro</p>
            ) : (
              students.map((s) => (
                <button
                  key={s.id}
                  className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                    selectedStudent === s.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => { setSelectedStudent(s.id); setSelectedIds(new Set()) }}
                >
                  {s.full_name}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {selectedStudent && (
            <>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>Pagadas: <strong className="text-green-600">{totalPaid}</strong></span>
                <span>Pendientes: <strong className="text-yellow-600">{totalPending}</strong></span>
                <span>Devueltas: <strong className="text-red-600">{totalReturned}</strong></span>
                <span>SINPE: <strong className="text-blue-600">{totalSinpe}</strong></span>
                <span>Efectivo: <strong className="text-purple-600">{totalCash}</strong></span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={selectedIds.size === actions.length && actions.length > 0}
                    onChange={selectAll}
                  />
                  Seleccionar todo ({actions.length})
                </label>
                {selectedIds.size > 0 && (
                  <span className="text-sm text-gray-500">
                    {selectedIds.size} seleccionad{selectedIds.size !== 1 ? 'os' : 'o'}
                  </span>
                )}
              </div>

              <DataTable
                columns={columns}
                data={actions}
                keyExtractor={(a) => a.id}
                loading={loading}
                emptyMessage="Este estudiante no tiene acciones"
                onRowClick={(action) => toggleSelect(action.id)}
              />

              <div className="flex flex-wrap gap-2">
                {bulkActions.map((action) => {
                  const count = selectedIds.size > 0 ? selectedIds.size : actions.length
                  if (count === 0) return null
                  return (
                    <Button
                      key={action.label}
                      size="sm"
                      className={action.className || undefined}
                      variant={action.className ? 'default' : 'outline'}
                      onClick={() => setConfirmBulk(action)}
                    >
                      {action.label} ({count})
                    </Button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmBulk}
        onOpenChange={(o) => { if (!o) setConfirmBulk(null) }}
        title="Actualización Masiva"
        description={`¿Estás seguro de marcar ${selectedIds.size || actions.length} accion${selectedIds.size !== 1 && actions.length !== 1 ? 'es' : ''} como ${confirmBulk?.label}${confirmBulk?.status === 'PAID' && confirmBulk?.payment_method ? ` (${confirmBulk.payment_method})` : ''}?`}
        onConfirm={handleBulkUpdate}
        loading={bulkLoading}
      />
    </div>
  )
}
