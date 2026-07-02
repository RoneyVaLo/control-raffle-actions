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

  const { data: action, error: actionError } = await supabase
    .from('raffle_actions')
    .select('*')
    .eq('action_number', num)
    .single()

  if (actionError) return NextResponse.json({ error: 'Acción no encontrada' }, { status: 404 })

  let studentName: string | undefined
  let sectionName: string | undefined
  let sectionId: string | undefined

  if (action.student_id) {
    const { data: student } = await supabase
      .from('students')
      .select('full_name, section_id')
      .eq('id', action.student_id)
      .single()

    if (student) {
      studentName = student.full_name
      sectionId = student.section_id

      if (student.section_id) {
        const { data: section } = await supabase
          .from('sections')
          .select('name')
          .eq('id', student.section_id)
          .single()

        if (section) {
          sectionName = section.name
        }
      }
    }
  }

  return NextResponse.json({
    id: action.id,
    action_number: action.action_number,
    student_id: action.student_id,
    status: action.status,
    payment_method: action.payment_method,
    assigned_at: action.assigned_at,
    paid_at: action.paid_at,
    updated_at: action.updated_at,
    student_name: studentName,
    section_name: sectionName,
    section_id: sectionId,
  })
}
