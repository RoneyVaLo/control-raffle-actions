import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ actionNumber: string }> }
) {
  const { actionNumber } = await params
  const num = parseInt(actionNumber, 10)

  if (isNaN(num)) {
    return NextResponse.json({ error: 'Número de acción inválido' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('raffle_actions')
    .select('*, students!inner(full_name, section_id, sections!inner(name))')
    .eq('action_number', num)
    .single()

  if (error) return NextResponse.json({ error: 'Acción no encontrada' }, { status: 404 })

  return NextResponse.json({
    id: data.id,
    action_number: data.action_number,
    student_id: data.student_id,
    status: data.status,
    payment_method: data.payment_method,
    assigned_at: data.assigned_at,
    paid_at: data.paid_at,
    updated_at: data.updated_at,
    student_name: (data as any).students?.full_name,
    section_name: (data as any).students?.sections?.name,
    section_id: (data as any).students?.section_id,
  })
}
