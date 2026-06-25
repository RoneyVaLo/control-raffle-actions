'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AssignmentPreviewProps {
  studentName: string
  actionNumbers: number[]
  onConfirm: () => void
  loading?: boolean
}

export function AssignmentPreview({
  studentName,
  actionNumbers,
  onConfirm,
  loading,
}: AssignmentPreviewProps) {
  if (actionNumbers.length === 0) return null

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div>
          <p className="text-sm text-gray-500">Estudiante</p>
          <p className="font-medium">{studentName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">
            Acciones a asignar ({actionNumbers.length})
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {actionNumbers.slice(0, 50).map((n) => (
              <span
                key={n}
                className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
              >
                {n}
              </span>
            ))}
            {actionNumbers.length > 50 && (
              <span className="text-xs text-gray-400">y {actionNumbers.length - 50} más</span>
            )}
          </div>
        </div>
        <Button onClick={onConfirm} loading={loading} className="w-full sm:w-auto">
          Asignar {actionNumbers.length} accion{actionNumbers.length !== 1 ? 'es' : ''}
        </Button>
      </CardContent>
    </Card>
  )
}
