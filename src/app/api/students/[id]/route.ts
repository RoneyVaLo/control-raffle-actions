import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: student, error } = await supabase
    .from('students')
    .select('*, sections(name)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 })

  const { data: actions } = await supabase
    .from('raffle_actions')
    .select('*')
    .eq('student_id', id)
    .order('action_number')

  const totalActions = actions?.length ?? 0
  const paidActions = actions?.filter((a) => a.status === 'PAID').length ?? 0
  const pendingActions = actions?.filter((a) => a.status === 'PENDING').length ?? 0
  const returnedActions = actions?.filter((a) => a.status === 'RETURNED').length ?? 0
  const sinpeCount = actions?.filter((a) => a.payment_method === 'SINPE').length ?? 0
  const cashCount = actions?.filter((a) => a.payment_method === 'CASH').length ?? 0
  const totalCollected = (sinpeCount + cashCount) * 2500

  return NextResponse.json({
    id: student.id,
    full_name: student.full_name,
    section_id: student.section_id,
    section_name: (student as any).sections?.name,
    created_at: student.created_at,
    raffle_actions: actions ?? [],
    total_actions: totalActions,
    paid_actions: paidActions,
    pending_actions: pendingActions,
    returned_actions: returnedActions,
    total_collected: totalCollected,
  })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  if (!body.full_name?.trim()) {
    return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('students')
    .update({
      full_name: body.full_name.trim(),
      ...(body.section_id ? { section_id: body.section_id } : {}),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await supabase.from('raffle_actions').delete().eq('student_id', id)
  const { error } = await supabase.from('students').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
