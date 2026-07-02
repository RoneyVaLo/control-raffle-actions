'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ActionRangeInput } from '@/features/assignments/components/action-range-input'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Column } from '@/components/ui/data-table'
import type { RaffleAction } from '@/types'

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

export default function StudentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionNumbers, setActionNumbers] = useState<number[]>([])
  const [assigning, setAssigning] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteActionId, setDeleteActionId] = useState<string | null>(null)
  const [deletingAction, setDeletingAction] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/students/${params.id}`)
      const d = await res.json()
      setData(d)
    } catch {
      // handled
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAssign = async () => {
    if (actionNumbers.length === 0) return
    setAssigning(true)
    setMessage(null)
    try {
      const res = await fetch('/api/raffle-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: params.id, action_numbers: actionNumbers }),
      })
      const result = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: result.error || 'Error al asignar' })
      } else {
        setMessage({ type: 'success', text: `${result.length} acción(es) asignada(s) exitosamente` })
        setActionNumbers([])
        fetchData()
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setAssigning(false)
    }
  }

  const handleDeleteAction = async () => {
    if (!deleteActionId) return
    setDeletingAction(true)
    try {
      const res = await fetch(`/api/raffle-actions/${deleteActionId}`, { method: 'DELETE' })
      if (!res.ok) {
        const result = await res.json()
        console.error(result.error)
      }
      setDeleteActionId(null)
      fetchData()
    } finally {
      setDeletingAction(false)
    }
  }

  const actionColumns: Column<RaffleAction>[] = [
    { key: 'action_number', header: 'Acción', className: 'font-medium' },
    { key: 'status', header: 'Estado', render: (a) => statusBadge(a.status) },
    { key: 'payment_method', header: 'Pago', render: (a) => paymentBadge(a.payment_method) },
    {
      key: 'actions',
      header: '',
      render: (a) =>
        a.status === 'PENDING' ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={(e) => { e.stopPropagation(); setDeleteActionId(a.id) }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null,
    },
  ]

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">Estudiante no encontrado</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/students')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{data.full_name}</h1>
          <p className="text-sm text-gray-500">Sección {data.section_name || data.section_id}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card><CardHeader className="p-4"><CardTitle className="text-sm text-gray-500">Total Acciones</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold">{data.total_actions}</p></CardContent></Card>
        <Card><CardHeader className="p-4"><CardTitle className="text-sm text-green-600">Pagadas</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold text-green-600">{data.paid_actions}</p></CardContent></Card>
        <Card><CardHeader className="p-4"><CardTitle className="text-sm text-yellow-600">Pendientes</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold text-yellow-600">{data.pending_actions}</p></CardContent></Card>
        <Card><CardHeader className="p-4"><CardTitle className="text-sm text-red-600">Devueltas</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold text-red-600">{data.returned_actions}</p></CardContent></Card>
        <Card><CardHeader className="p-4"><CardTitle className="text-sm text-blue-600">Total</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold">{formatCurrency(data.total_collected)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Asignar Acciones</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <ActionRangeInput onChange={setActionNumbers} />
          {actionNumbers.length > 0 && (
            <Button onClick={handleAssign} loading={assigning}>
              Asignar {actionNumbers.length} acción{actionNumbers.length !== 1 ? 'es' : ''}
            </Button>
          )}
          {message && (
            <div
              className={`rounded-lg p-3 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold">Acciones</h2>
      <DataTable
        columns={actionColumns}
        data={data.raffle_actions ?? []}
        keyExtractor={(a) => a.id}
        emptyMessage="Este estudiante no tiene acciones asignadas"
        onRowClick={(action) => router.push(`/actions/${action.action_number}`)}
      />

      <ConfirmDialog
        open={!!deleteActionId}
        onOpenChange={(open) => { if (!open) setDeleteActionId(null) }}
        title="Eliminar Acción"
        description="¿Estás seguro de eliminar esta acción? Solo se pueden eliminar acciones pendientes."
        onConfirm={handleDeleteAction}
        confirmLabel="Eliminar"
        variant="destructive"
        loading={deletingAction}
      />
    </div>
  )
}
