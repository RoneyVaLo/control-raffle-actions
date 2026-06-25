import { NextResponse } from 'next/server'
import { fetchDashboardMetrics } from '@/features/dashboard/api'

export async function GET() {
  try {
    const metrics = await fetchDashboardMetrics()
    return NextResponse.json(metrics)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener métricas' },
      { status: 500 }
    )
  }
}
