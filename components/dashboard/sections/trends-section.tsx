'use client'

import { useState } from 'react'

import { caloriesTrendData, macroStackData, mealDistribution, timeRanges } from '@/components/dashboard/data'
import { MiniLineChart, StackedBars } from '@/components/dashboard/charts'
import { SectionCard, cn } from '@/components/dashboard/ui'

export function TrendsSection() {
  const [selectedRange, setSelectedRange] = useState('7 Days')

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-2xl text-[#f5f5f5]">Nutrition Trends</h2>
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm transition-colors',
                selectedRange === range
                  ? 'border-[#4ade80] bg-[#4ade80] text-[#0a0a0a]'
                  : 'border-white/10 bg-[#141414] text-[#888] hover:border-[#4ade80]/50 hover:text-[#f5f5f5]',
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <SectionCard>
        <div className="mb-5 text-lg text-[#f5f5f5]">Daily Calorie Trend</div>
        <MiniLineChart data={caloriesTrendData} />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard>
          <div className="mb-5 text-lg text-[#f5f5f5]">Macro Distribution</div>
          <StackedBars data={macroStackData} />
        </SectionCard>
        <SectionCard>
          <div className="mb-5 text-lg text-[#f5f5f5]">Calories by Meal Type</div>
          <div className="space-y-5 pt-2">
            {mealDistribution.map((item) => {
              const max = Math.max(...mealDistribution.map((entry) => entry.calories))
              const percentage = (item.calories / max) * 100

              return (
                <div key={item.meal}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-[#888]">{item.meal}</span>
                    <span className="font-mono text-sm text-[#4ade80]">{item.calories}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-[#4ade80]" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
