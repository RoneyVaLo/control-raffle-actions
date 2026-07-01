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

  const { data, error } = await dbQuery.order('full_name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const mapped = data.map((s: any) => ({
    id: s.id,
    full_name: s.full_name,
    section_id: s.section_id,
    section_name: s.sections?.name,
    created_at: s.created_at,
  }))

  return NextResponse.json(mapped)
}
