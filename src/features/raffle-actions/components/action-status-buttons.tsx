'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import type { ActionStatus, PaymentMethod } from '@/types'

interface ActionStatusButtonsProps {
  actionId: string
  currentStatus: ActionStatus
  currentPayment?: PaymentMethod | null
  onUpdate: () => void
}

export function ActionStatusButtons({
  actionId,
  currentStatus,
  currentPayment,
  onUpdate,
}: ActionStatusButtonsProps) {
  const [loading, setLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    status: ActionStatus
    payment_method?: PaymentMethod | null
    label: string
  } | null>(null)

  const updateStatus = async (
    status: ActionStatus,
    payment_method?: PaymentMethod | null
  ) => {
    setLoading(true)
    try {
      await fetch(`/api/raffle-actions/${actionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, payment_method }),
      })
      setConfirmDialog(null)
      onUpdate()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const actions = [
    { status: 'PAID' as ActionStatus, payment_method: 'SINPE' as PaymentMethod, label: 'SINPE', variant: 'default' as const, className: 'bg-blue-600 hover:bg-blue-700' },
    { status: 'PAID' as ActionStatus, payment_method: 'CASH' as PaymentMethod, label: 'EFECTIVO', variant: 'default' as const, className: 'bg-purple-600 hover:bg-purple-700' },
    { status: 'RETURNED' as ActionStatus, label: 'DEVUELTA', variant: 'destructive' as const },
    { status: 'PENDING' as ActionStatus, label: 'PENDIENTE', variant: 'outline' as const },
  ]

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const isActive =
            currentStatus === action.status &&
            (action.status !== 'PAID' || currentPayment === action.payment_method)
          return (
            <Button
              key={`${action.status}-${action.payment_method || ''}`}
              variant={isActive ? (action.variant === 'outline' ? 'secondary' : action.variant) : 'outline'}
              className={isActive && action.className ? action.className : undefined}
              size="sm"
              disabled={loading}
              onClick={() =>
                setConfirmDialog({
                  status: action.status,
                  payment_method: action.payment_method,
                  label: action.label,
                })
              }
            >
              {action.label}
            </Button>
          )
        })}
      </div>

      <Dialog open={!!confirmDialog} onOpenChange={(o) => { if (!o) setConfirmDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de marcar esta acción como <strong>{confirmDialog?.label}</strong>
              {confirmDialog?.status === 'PAID' && confirmDialog?.payment_method
                ? ` (${confirmDialog.payment_method})`
                : ''}
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setConfirmDialog(null)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={() =>
                updateStatus(confirmDialog!.status, confirmDialog!.payment_method)
              }
              loading={loading}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
