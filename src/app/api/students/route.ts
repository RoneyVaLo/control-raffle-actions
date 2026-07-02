import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sectionId = searchParams.get('section_id')
  const query = searchParams.get('q')

  let dbQuery = supabase
    .from('students')
    .select('*, sections(name)')

  if (sectionId) {
    dbQuery = dbQuery.eq('section_id', sectionId)
  }

  if (query) {
    dbQuery = dbQuery.ilike('full_name', `%${query}%`)
  }

  const [studentsRes, actionsRes] = await Promise.all([
    dbQuery.order('full_name'),
    supabase.from('raffle_actions').select('student_id'),
  ])

  if (studentsRes.error) return NextResponse.json({ error: studentsRes.error.message }, { status: 500 })
  if (actionsRes.error) return NextResponse.json({ error: actionsRes.error.message }, { status: 500 })

  const actionCounts: Record<string, number> = {}
  for (const a of (actionsRes.data ?? [])) {
    actionCounts[a.student_id] = (actionCounts[a.student_id] || 0) + 1
  }

  const mapped = (studentsRes.data ?? []).map((s: any) => ({
    id: s.id,
    full_name: s.full_name,
    section_id: s.section_id,
    section_name: s.sections?.name,
    created_at: s.created_at,
    action_count: actionCounts[s.id] || 0,
  }))

  return NextResponse.json(mapped)
}
