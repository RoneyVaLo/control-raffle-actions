import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: action, error: fetchError } = await supabase
    .from('raffle_actions')
    .select('id, status')
    .eq('id', id)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: 'Acción no encontrada' }, { status: 404 })
  }

  if (action.status !== 'PENDING') {
    return NextResponse.json(
      { error: 'Solo se pueden eliminar acciones pendientes' },
      { status: 400 }
    )
  }

  const { error } = await supabase.from('raffle_actions').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
