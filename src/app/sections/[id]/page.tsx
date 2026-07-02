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

interface StudentSummary {
  id: string
  full_name: string
  action_count: number
}

export default function SectionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/sections/${params.id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  const studentColumns: Column<StudentSummary>[] = [
    { key: 'full_name', header: 'Nombre' },
    {
      key: 'action_count',
      header: 'Acciones',
      render: (item) => <Badge variant="default">{item.action_count}</Badge>,
    },
  ]

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">Sección no encontrada</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/sections')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Sección {data.name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card><CardHeader className="p-4"><CardTitle className="text-sm text-gray-500">Estudiantes</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold">{data.students?.length ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="p-4"><CardTitle className="text-sm text-gray-500">Total Acciones</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold">{data.total_actions}</p></CardContent></Card>
        <Card><CardHeader className="p-4"><CardTitle className="text-sm text-yellow-600">Pendientes</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold text-yellow-600">{data.pending_actions}</p></CardContent></Card>
        <Card><CardHeader className="p-4"><CardTitle className="text-sm text-green-600">Pagadas</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold text-green-600">{data.paid_actions}</p></CardContent></Card>
        <Card><CardHeader className="p-4"><CardTitle className="text-sm text-blue-600">Recaudado</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold">{formatCurrency(data.total_collected)}</p></CardContent></Card>
      </div>

      <h2 className="text-lg font-semibold">Estudiantes</h2>
      <DataTable
        columns={studentColumns}
        data={(data.students ?? []).map((s: any) => ({
          id: s.id,
          full_name: s.full_name,
          action_count: s.action_count || 0,
        }))}
        keyExtractor={(s) => s.id}
        emptyMessage="No hay estudiantes en esta sección"
        onRowClick={(student) => router.push(`/students/${student.id}`)}
      />
    </div>
  )
}
