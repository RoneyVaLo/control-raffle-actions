'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Banknote, Landmark, TrendingUp, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface MonetaryCardsProps {
  sinpe?: number
  cash?: number
  total?: number
  potential?: number
  loading?: boolean
}

export function MonetaryCards({ sinpe, cash, total, potential, loading }: MonetaryCardsProps) {
  const items = [
    { label: 'Total SINPE', value: sinpe, icon: Landmark, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Efectivo', value: cash, icon: Banknote, color: 'text-purple-600 bg-purple-50' },
    { label: 'Total Recaudado', value: total, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { label: 'Potencial Pendiente', value: potential, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
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
                <Skeleton className="mt-1 h-6 w-20" />
              ) : (
                <p className="text-lg font-bold">{formatCurrency(item.value ?? 0)}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
