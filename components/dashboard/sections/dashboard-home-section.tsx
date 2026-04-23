'use client'

import { useState } from 'react'

import { InsightsSection } from '@/components/dashboard/sections/insights-section'
import { OverviewSection } from '@/components/dashboard/sections/overview-section'
import { TrendsSection } from '@/components/dashboard/sections/trends-section'
import type { DashboardSubview } from '@/components/dashboard/types'
import { cn } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'

const tabs: Array<{ key: DashboardSubview; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'trends', label: 'Trends' },
  { key: 'insights', label: 'Insights' },
]

export function DashboardHomeSection({
  initialView = 'overview',
}: {
  initialView?: DashboardSubview
}) {
  const [activeView, setActiveView] = useState<DashboardSubview>(initialView)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl text-[#f5f5f5]">Dashboard</h2>
          <p className="mt-1 text-sm text-[#777]">
            Your overview, trends, and insights in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              onClick={() => setActiveView(tab.key)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm transition-colors',
                activeView === tab.key
                  ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a]'
                  : 'border-white/10 bg-[#141414] text-[#888] hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]',
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {activeView === 'overview' ? <OverviewSection /> : null}
      {activeView === 'trends' ? <TrendsSection /> : null}
      {activeView === 'insights' ? <InsightsSection /> : null}
    </div>
  )
}
