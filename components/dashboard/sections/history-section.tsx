'use client'

import { useState } from 'react'

import { CalendarSection } from '@/components/dashboard/sections/calendar-section'
import { MealsSection } from '@/components/dashboard/sections/meals-section'
import { WeeklySummarySection } from '@/components/dashboard/sections/weekly-summary-section'
import type { HistorySubview } from '@/components/dashboard/types'
import { cn } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'

const tabs: Array<{ key: HistorySubview; label: string; isBeta?: boolean }> = [
  { key: 'meals', label: 'Meals' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'weekly-summary', label: 'Weekly Summary' },
]

export function HistorySection({
  initialView = 'meals',
}: {
  initialView?: HistorySubview
}) {
  const [activeView, setActiveView] = useState<HistorySubview>(initialView)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl text-[#f5f5f5]">History</h2>
          <p className="mt-1 text-sm text-[#777]">
            Monitor your caloric trajectory and daily nutrition reports.
          </p>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2">
            {tabs.map((tab) => {
              const isActive = activeView === tab.key
              return (
                <Button
                  key={tab.key}
                  onClick={() => setActiveView(tab.key)}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a]'
                      : 'border-white/10 bg-[#141414] text-[#888] hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]'
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.isBeta ? (
                    <span
                      className={cn(
                        'ml-1 rounded-full border px-1.5 py-0.5 text-[9px] font-black tracking-[0.18em] uppercase',
                        isActive
                          ? 'border-black/10 bg-black/10 text-[#0a0a0a]'
                          : 'border-[#e4ff00]/20 bg-[#e4ff00]/10 text-[#e4ff00]'
                      )}
                    >
                      Beta
                    </span>
                  ) : null}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {activeView === 'meals' ? <MealsSection /> : null}
      {activeView === 'calendar' ? <CalendarSection /> : null}
      {activeView === 'weekly-summary' ? <WeeklySummarySection /> : null}
    </div>
  )
}
