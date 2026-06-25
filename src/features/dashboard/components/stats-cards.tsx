'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TicketCheck, CheckCircle2, Clock, RotateCcw } from 'lucide-react'

interface StatsCardsProps {
  total?: number
  paid?: number
  pending?: number
  returned?: number
  loading?: boolean
}

export function StatsCards({ total, paid, pending, returned, loading }: StatsCardsProps) {
  const items = [
    { label: 'Total Acciones', value: total, icon: TicketCheck, color: 'text-blue-600 bg-blue-50' },
    { label: 'Pagadas', value: paid, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'Pendientes', value: pending, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Devueltas', value: returned, icon: RotateCcw, color: 'text-red-600 bg-red-50' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`rounded-lg p-2.5 ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">{item.label}</p>
              {loading ? (
                <Skeleton className="mt-1 h-6 w-16" />
              ) : (
                <p className="text-2xl font-bold">{item.value ?? 0}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
