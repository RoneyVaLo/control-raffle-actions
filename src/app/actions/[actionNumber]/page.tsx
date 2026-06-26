'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ActionStatusButtons } from '@/features/raffle-actions/components/action-status-buttons'
import { ArrowLeft, Search } from 'lucide-react'
import type { RaffleActionWithRelations } from '@/types'

export default function ActionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [action, setAction] = useState<RaffleActionWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')

  const fetchAction = async (num: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/raffle-actions/number/${num}`)
      if (!res.ok) {
        setAction(null)
        return
      }
      const data = await res.json()
      setAction(data)
    } catch {
      setAction(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.actionNumber) {
      fetchAction(params.actionNumber as string)
    }
  }, [params.actionNumber])

  const handleSearch = () => {
    if (searchInput.trim()) {
      router.push(`/actions/${searchInput.trim()}`)
    }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-48" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/actions')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          Acción {params.actionNumber}
        </h1>
      </div>

      <div className="flex gap-2 w-full sm:w-80">
        <input
          className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          placeholder="Buscar otra acción..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button size="icon" variant="outline" onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {!action ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Acción no encontrada
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-sm text-gray-500">Acción</p>
                  <p className="text-lg font-bold">{action.action_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <Badge
                    variant={
                      action.status === 'PAID' ? 'paid' : action.status === 'PENDING' ? 'pending' : 'returned'
                    }
                    className="mt-1"
                  >
                    {action.status === 'PAID' ? 'Pagada' : action.status === 'PENDING' ? 'Pendiente' : 'Devuelta'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Método</p>
                  {action.payment_method ? (
                    <Badge variant={action.payment_method === 'SINPE' ? 'sinpe' : 'cash'} className="mt-1">
                      {action.payment_method}
                    </Badge>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">—</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor</p>
                  <p className="text-lg font-bold">₡2,500</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Estudiante</p>
                  <p className="font-medium">{action.student_name || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sección</p>
                  <p className="font-medium">{action.section_name || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cambiar Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <ActionStatusButtons
                actionId={action.id}
                currentStatus={action.status}
                currentPayment={action.payment_method}
                onUpdate={() => fetchAction(params.actionNumber as string)}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
