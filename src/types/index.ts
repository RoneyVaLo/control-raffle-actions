export type ActionStatus = 'PENDING' | 'PAID' | 'RETURNED'
export type PaymentMethod = 'SINPE' | 'CASH'

export interface Section {
  id: string
  name: string
  created_at: string
}

export interface Student {
  id: string
  full_name: string
  section_id: string
  created_at: string
}

export interface RaffleAction {
  id: string
  action_number: number
  student_id: string
  status: ActionStatus
  payment_method: PaymentMethod | null
  assigned_at: string
  paid_at: string | null
  updated_at: string
}

export interface StudentWithSection extends Student {
  section_name?: string
}

export interface RaffleActionWithRelations extends RaffleAction {
  student_name?: string
  section_name?: string
  section_id?: string
}

export interface DashboardMetrics {
  total_actions: number
  paid_actions: number
  pending_actions: number
  returned_actions: number
  total_sinpe: number
  total_cash: number
  total_collected: number
  potential_pending: number
  section_revenue: { section_name: string; total: number }[]
}

export const RAFFLE_ACTION_PRICE = 2500
