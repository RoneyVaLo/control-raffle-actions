import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import type { ActionStatus, PaymentMethod } from '@/types'

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { student_id, action_ids, status, payment_method } = body as {
    student_id?: string
    action_ids?: string[]
    status: ActionStatus
    payment_method?: PaymentMethod | null
  }

  if (!['PENDING', 'PAID', 'RETURNED'].includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  if (status === 'PAID' && !payment_method) {
    return NextResponse.json(
      { error: 'Método de pago requerido para estado PAID' },
      { status: 400 }
    )
  }

  const updateData: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'PAID') {
    updateData.payment_method = payment_method
    updateData.paid_at = new Date().toISOString()
  } else {
    updateData.payment_method = null
    updateData.paid_at = null
  }

  let query = supabase.from('raffle_actions').update(updateData)

  if (action_ids && action_ids.length > 0) {
    query = query.in('id', action_ids)
  } else if (student_id) {
    query = query.eq('student_id', student_id)
  } else {
    return NextResponse.json(
      { error: 'student_id o action_ids requerido' },
      { status: 400 }
    )
  }

  const { data, error } = await query.select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
