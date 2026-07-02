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

  let studentActionCounts: Record<string, number> = {}

  if (studentIds.length > 0) {
    const { data: actions } = await supabase
      .from('raffle_actions')
      .select('student_id, status, payment_method')
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

      actions.forEach((a) => {
        studentActionCounts[a.student_id] = (studentActionCounts[a.student_id] || 0) + 1
      })
    }
  }

  const studentsWithCounts = (students ?? []).map((s) => ({
    ...s,
    action_count: studentActionCounts[s.id] || 0,
  }))

  return NextResponse.json({
    ...section,
    students: studentsWithCounts,
    total_actions: totalActions,
    paid_actions: paidActions,
    pending_actions: pendingActions,
    returned_actions: returnedActions,
    total_collected: totalCollected,
  })
}
