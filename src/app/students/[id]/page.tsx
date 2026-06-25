'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
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

  useEffect(() => {
    fetch(`/api/students/${params.id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  const actionColumns: Column<RaffleAction>[] = [
    { key: 'action_number', header: 'Acción', className: 'font-medium' },
    { key: 'status', header: 'Estado', render: (a) => statusBadge(a.status) },
    { key: 'payment_method', header: 'Pago', render: (a) => paymentBadge(a.payment_method) },
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

      <h2 className="text-lg font-semibold">Acciones</h2>
      <DataTable
        columns={actionColumns}
        data={data.raffle_actions ?? []}
        keyExtractor={(a) => a.id}
        emptyMessage="Este estudiante no tiene acciones asignadas"
        onRowClick={(action) => router.push(`/actions/${action.action_number}`)}
      />
    </div>
  )
}
