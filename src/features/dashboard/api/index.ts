import { supabase } from '@/lib/supabase/client'
import { RAFFLE_ACTION_PRICE, type DashboardMetrics } from '@/types'

function getEmptyMetrics(): DashboardMetrics {
  return {
    total_actions: 0, paid_actions: 0, pending_actions: 0, returned_actions: 0,
    total_sinpe: 0, total_cash: 0, total_collected: 0, potential_pending: 0,
    section_revenue: [],
  }
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const { data: actions, error } = await supabase
    .from('raffle_actions')
    .select('status, payment_method, student_id')

  if (error) throw new Error(error.message)
  if (!actions) return getEmptyMetrics()

  const total_actions = actions.length
  const paid_actions = actions.filter((a) => a.status === 'PAID').length
  const pending_actions = actions.filter((a) => a.status === 'PENDING').length
  const returned_actions = actions.filter((a) => a.status === 'RETURNED').length

  const sinpe_count = actions.filter((a) => a.payment_method === 'SINPE').length
  const cash_count = actions.filter((a) => a.payment_method === 'CASH').length
  const total_sinpe = sinpe_count * RAFFLE_ACTION_PRICE
  const total_cash = cash_count * RAFFLE_ACTION_PRICE
  const total_collected = total_sinpe + total_cash
  const potential_pending = pending_actions * RAFFLE_ACTION_PRICE

  const { data: students } = await supabase.from('students').select('id, section_id')
  const studentSectionMap = new Map(students?.map((s) => [s.id, s.section_id]) ?? [])

  const { data: sections } = await supabase.from('sections').select('id, name')
  const sectionNameMap = new Map(sections?.map((s) => [s.id, s.name]) ?? [])

  const sectionRevenueMap = new Map<string, number>()
  for (const action of actions) {
    if (action.status === 'PAID' && action.payment_method) {
      const sectionId = studentSectionMap.get(action.student_id)
      if (sectionId) {
        const sectionName = sectionNameMap.get(sectionId) || 'Sin sección'
        sectionRevenueMap.set(
          sectionName,
          (sectionRevenueMap.get(sectionName) || 0) + RAFFLE_ACTION_PRICE
        )
      }
    }
  }

  const section_revenue = Array.from(sectionRevenueMap.entries())
    .map(([section_name, total]) => ({ section_name, total }))
    .sort((a, b) => b.total - a.total)

  return {
    total_actions,
    paid_actions,
    pending_actions,
    returned_actions,
    total_sinpe,
    total_cash,
    total_collected,
    potential_pending,
    section_revenue,
  }
}
