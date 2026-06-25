import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const paymentMethod = searchParams.get('payment_method')
  const sectionId = searchParams.get('section_id')
  const studentId = searchParams.get('student_id')
  const query = searchParams.get('q')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = 25

  let countQuery = supabase.from('raffle_actions').select('*', { count: 'exact', head: true })
  let dataQuery = supabase
    .from('raffle_actions')
    .select('*, students!inner(full_name, section_id, sections!inner(name))')

  if (status) dataQuery = dataQuery.eq('status', status)
  if (paymentMethod) dataQuery = dataQuery.eq('payment_method', paymentMethod)
  if (studentId) dataQuery = dataQuery.eq('student_id', studentId)
  if (sectionId) dataQuery = dataQuery.eq('students.section_id', sectionId)
  if (query) {
    const numQuery = parseInt(query, 10)
    if (!isNaN(numQuery)) {
      dataQuery = dataQuery.eq('action_number', numQuery)
    } else {
      dataQuery = dataQuery.ilike('students.full_name', `%${query}%`)
    }
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await dataQuery
    .order('action_number', { ascending: true })
    .range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const mapped = data.map((a: any) => ({
    id: a.id,
    action_number: a.action_number,
    student_id: a.student_id,
    status: a.status,
    payment_method: a.payment_method,
    assigned_at: a.assigned_at,
    paid_at: a.paid_at,
    updated_at: a.updated_at,
    student_name: a.students?.full_name,
    section_name: a.students?.sections?.name,
    section_id: a.students?.section_id,
  }))

  return NextResponse.json({
    data: mapped,
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { student_id, action_numbers } = body

  if (!student_id || !action_numbers?.length) {
    return NextResponse.json(
      { error: 'Estudiante y números de acción son requeridos' },
      { status: 400 }
    )
  }

  const existing = await supabase
    .from('raffle_actions')
    .select('action_number')
    .in('action_number', action_numbers)

  if (existing.data && existing.data.length > 0) {
    const existingNumbers = existing.data.map((a) => a.action_number)
    return NextResponse.json(
      { error: `Acciones ya existentes: ${existingNumbers.join(', ')}` },
      { status: 409 }
    )
  }

  const records = action_numbers.map((num: number) => ({
    action_number: num,
    student_id,
    status: 'PENDING' as const,
  }))

  const { data, error } = await supabase
    .from('raffle_actions')
    .insert(records)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
