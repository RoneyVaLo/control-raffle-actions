import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: section, error: sectionError } = await supabase
    .from('sections')
    .select('*')
    .eq('id', id)
    .single()

  if (sectionError) return NextResponse.json({ error: 'Sección no encontrada' }, { status: 404 })

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name')
    .eq('section_id', id)
    .order('full_name')

  const studentIds = students?.map((s) => s.id) ?? []

  let totalActions = 0
  let paidActions = 0
  let pendingActions = 0
  let returnedActions = 0
  let totalCollected = 0

  if (studentIds.length > 0) {
    const { data: actions } = await supabase
      .from('raffle_actions')
      .select('status, payment_method')
      .in('student_id', studentIds)

    if (actions) {
      totalActions = actions.length
      paidActions = actions.filter((a) => a.status === 'PAID').length
      pendingActions = actions.filter((a) => a.status === 'PENDING').length
      returnedActions = actions.filter((a) => a.status === 'RETURNED').length
      totalCollected =
        actions.filter((a) => a.status === 'PAID' && a.payment_method === 'SINPE').length *
          2500 +
        actions.filter((a) => a.status === 'PAID' && a.payment_method === 'CASH').length * 2500
    }
  }

  return NextResponse.json({
    ...section,
    students: students ?? [],
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

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('sections')
    .update({ name: body.name.trim() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'El nombre ya existe' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('section_id', id)

  if (students && students.length > 0) {
    const studentIds = students.map((s) => s.id)
    await supabase.from('raffle_actions').delete().in('student_id', studentIds)
    await supabase.from('students').delete().in('id', studentIds)
  }

  const { error } = await supabase.from('sections').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
