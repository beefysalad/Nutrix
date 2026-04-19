'use client'

import { useState } from 'react'

import { CalendarSection } from '@/components/dashboard/sections/calendar-section'
import { DailyReportSection } from '@/components/dashboard/sections/daily-report-section'
import { MealsSection } from '@/components/dashboard/sections/meals-section'
import { WeeklySummarySection } from '@/components/dashboard/sections/weekly-summary-section'
import type { HistorySubview } from '@/components/dashboard/types'
import { cn } from '@/components/dashboard/ui'

const tabs: Array<{ key: HistorySubview; label: string }> = [
  { key: 'meals', label: 'Meals' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'daily-report', label: 'Daily Report' },
  { key: 'weekly-summary', label: 'Weekly Summary' },
]

export function HistorySection({
  initialView = 'meals',
}: {
  initialView?: HistorySubview
}) {
  const [activeView, setActiveView] = useState<HistorySubview>(initialView)

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl text-[#f5f5f5]">History</h2>
          <p className="mt-1 text-sm text-[#777]">
            Meals, calendar, and report views now live under one roof.
          </p>
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide md:mx-0 md:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key)}
              className={cn(
                'whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors',
                activeView === tab.key
                  ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a]'
                  : 'border-white/10 bg-[#141414] text-[#888] hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'meals' ? <MealsSection /> : null}
      {activeView === 'calendar' ? <CalendarSection /> : null}
      {activeView === 'daily-report' ? <DailyReportSection /> : null}
      {activeView === 'weekly-summary' ? <WeeklySummarySection /> : null}
    </div>
  )
}
