'use client'

import { useState } from 'react'

import { CalendarSection } from '@/components/dashboard/sections/calendar-section'
import { DailyReportSection } from '@/components/dashboard/sections/daily-report-section'
import { MealsSection } from '@/components/dashboard/sections/meals-section'
import { WeeklySummarySection } from '@/components/dashboard/sections/weekly-summary-section'
import type { HistorySubview } from '@/components/dashboard/types'
import { cn } from '@/components/dashboard/ui'

const tabs: Array<{ key: HistorySubview; label: string; isBeta?: boolean }> = [
  { key: 'meals', label: 'Meals' },
  { key: 'calendar', label: 'Calendar', isBeta: true },
  { key: 'daily-report', label: 'Daily Report', isBeta: true },
  { key: 'weekly-summary', label: 'Weekly Summary', isBeta: true },
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
        <div className="px-1 md:px-0">
          <h2 className="text-2xl font-bold tracking-tight text-[#f5f5f5]">History</h2>
          <p className="mt-1 text-sm text-[#777]">
            Monitor your caloric trajectory and daily nutrition reports.
          </p>
        </div>
        <div className="-mx-1 flex w-[calc(100%+0.5rem)] overflow-x-auto pb-2 scrollbar-hide md:mx-0 md:w-auto md:pb-0">
          <div className="flex min-w-max gap-2 rounded-2xl bg-[#141414] p-1">
            {tabs.map((tab) => {
              const isActive = activeView === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveView(tab.key)}
                  className={cn(
                    'shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition-all md:px-6',
                    isActive
                      ? 'bg-[#e4ff00] text-[#0a0a0a] shadow-[0_2px_10px_rgba(228,255,0,0.2)]'
                      : 'text-[#666] hover:text-[#aaa]',
                  )}
                >
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <span>{tab.label}</span>
                    {tab.isBeta ? (
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em]',
                          isActive
                            ? 'border-black/10 bg-black/10 text-[#0a0a0a]'
                            : 'border-[#e4ff00]/20 bg-[#e4ff00]/10 text-[#e4ff00]',
                        )}
                      >
                        Beta
                      </span>
                    ) : null}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {activeView === 'meals' ? <MealsSection /> : null}
      {activeView === 'calendar' ? <CalendarSection /> : null}
      {activeView === 'daily-report' ? <DailyReportSection /> : null}
      {activeView === 'weekly-summary' ? <WeeklySummarySection /> : null}
    </div>
  )
}
