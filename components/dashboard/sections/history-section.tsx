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
  { key: 'calendar', label: 'Calendar', isBeta: true },
  { key: 'weekly-summary', label: 'Weekly Summary', isBeta: true },
]

export function HistorySection({
  initialView = 'meals',
}: {
  initialView?: HistorySubview
}) {
  const [activeView, setActiveView] = useState<HistorySubview>(initialView)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.25)] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="px-1 md:px-0">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#666]">
              Nutrition timeline
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#f5f5f5]">History</h2>
            <p className="mt-1 text-sm text-[#777]">
            Monitor your caloric trajectory and daily nutrition reports.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 md:flex md:rounded-[1.35rem] md:border md:border-white/5 md:bg-[#0b0b0b] md:p-1">
            {tabs.map((tab) => {
              const isActive = activeView === tab.key
              return (
                <Button
                  key={tab.key}
                  onClick={() => setActiveView(tab.key)}
                  className={cn(
                    'flex min-h-11 items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-sm font-bold transition-all md:shrink-0 md:rounded-[1rem] md:px-5',
                    isActive
                      ? 'bg-[#e4ff00] text-[#0a0a0a] shadow-[0_10px_30px_rgba(228,255,0,0.2)]'
                      : 'border border-white/5 bg-[#151515] text-[#666] hover:border-white/10 hover:text-[#aaa] md:border-transparent md:bg-transparent',
                  )}
                >
                  <span className="truncate">{tab.label}</span>
                  {tab.isBeta ? (
                    <span
                      className={cn(
                        'hidden rounded-full border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] sm:inline',
                        isActive
                          ? 'border-black/10 bg-black/10 text-[#0a0a0a]'
                          : 'border-[#e4ff00]/20 bg-[#e4ff00]/10 text-[#e4ff00]',
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
