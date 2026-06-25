'use client'

import { useState, useEffect } from 'react'
import { StatsCards } from '@/features/dashboard/components/stats-cards'
import { MonetaryCards } from '@/features/dashboard/components/monetary-cards'
import { StatusChart } from '@/features/dashboard/components/status-chart'
import { PaymentChart } from '@/features/dashboard/components/payment-chart'
import { SectionRevenueChart } from '@/features/dashboard/components/section-revenue-chart'
import type { DashboardMetrics } from '@/types'

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((data) => {
        setMetrics(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <StatsCards
        total={metrics?.total_actions}
        paid={metrics?.paid_actions}
        pending={metrics?.pending_actions}
        returned={metrics?.returned_actions}
        loading={loading}
      />
      <MonetaryCards
        sinpe={metrics?.total_sinpe}
        cash={metrics?.total_cash}
        total={metrics?.total_collected}
        potential={metrics?.potential_pending}
        loading={loading}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <StatusChart
          paid={metrics?.paid_actions}
          pending={metrics?.pending_actions}
          returned={metrics?.returned_actions}
        />
        <PaymentChart
          sinpe={metrics?.total_sinpe}
          cash={metrics?.total_cash}
        />
      </div>
      <SectionRevenueChart data={metrics?.section_revenue ?? []} />
    </div>
  )
}
