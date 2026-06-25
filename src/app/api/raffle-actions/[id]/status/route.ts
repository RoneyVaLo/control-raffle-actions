import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import type { ActionStatus, PaymentMethod } from '@/types'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { status, payment_method } = body as {
    status: ActionStatus
    payment_method?: PaymentMethod | null
  }

  if (!['PENDING', 'PAID', 'RETURNED'].includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const updateData: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'PAID') {
    if (!payment_method) {
      return NextResponse.json(
        { error: 'Método de pago requerido para estado PAID' },
        { status: 400 }
      )
    }
    updateData.payment_method = payment_method
    updateData.paid_at = new Date().toISOString()
  } else {
    updateData.payment_method = null
    updateData.paid_at = null
  }

  const { data, error } = await supabase
    .from('raffle_actions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
