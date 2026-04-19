'use client'

import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { MiniLineChart, StackedBars } from '@/components/dashboard/charts'
import { EmptyState, SectionCard, cn } from '@/components/dashboard/ui'
import { useDashboardTrendsQuery } from '@/lib/hooks/use-dashboard-api'

export function TrendsSection() {
  const [selectedRange, setSelectedRange] = useState<'7 Days' | '30 Days' | '90 Days'>('7 Days')
  const rangeDays = useMemo(
    () => (selectedRange === '7 Days' ? 7 : selectedRange === '30 Days' ? 30 : 90),
    [selectedRange],
  )
  const trendsQuery = useDashboardTrendsQuery(rangeDays)

  const trendData = useMemo(() => {
    const goalCalories = trendsQuery.data?.goalCalories ?? 0
    const values = trendsQuery.data?.points ?? []
    const sampled =
      values.length <= 14
        ? values
        : values.filter((_, index) => index % Math.ceil(values.length / 14) === 0)

    return {
      line: sampled.map((day) => ({
        label: day.label,
        calories: day.calories,
        goal: goalCalories,
      })),
        bars: sampled.map((day) => ({
          label: day.label,
          protein: day.protein,
          carbs: day.carbs,
          fat: day.fat,
        })),
    }
  }, [trendsQuery.data?.goalCalories, trendsQuery.data?.points])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl text-[#f5f5f5]">Nutrition Trends</h2>
          <span className="rounded-full bg-[#e4ff00] px-2 py-0.5 text-xs font-medium text-[#0a0a0a]">
            Beta
          </span>
        </div>
        <div className="flex gap-2">
          {(['7 Days', '30 Days', '90 Days'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm transition-colors',
                selectedRange === range
                  ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a]'
                  : 'border-white/10 bg-[#141414] text-[#888] hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]',
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {trendsQuery.isLoading ? (
        <SectionCard className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
        </SectionCard>
      ) : trendsQuery.isError ? (
        <SectionCard>
          <EmptyState
            title="Trends could not be loaded"
            description="Nutrix hit an issue while loading your nutrition trend data. Try again in a moment."
          />
        </SectionCard>
      ) : trendData.line.every((item) => item.calories === 0) ? (
        <SectionCard>
          <EmptyState
            title="Trends will appear after meals are logged"
            description="Once you log meals over multiple days, Nutrix will chart calories and macro patterns here."
          />
        </SectionCard>
      ) : (
        <>
          <SectionCard>
            <div className="mb-5">
              <h3 className="text-lg text-[#f5f5f5]">Calories vs goal</h3>
              <p className="mt-1 text-sm text-[#777]">Your rolling calorie trend across the selected range.</p>
            </div>
            <MiniLineChart data={trendData.line} />
          </SectionCard>

          <SectionCard>
            <div className="mb-5">
              <h3 className="text-lg text-[#f5f5f5]">Macro distribution</h3>
              <p className="mt-1 text-sm text-[#777]">Protein, carbs, and fat over time.</p>
            </div>
            <StackedBars data={trendData.bars} />
          </SectionCard>
        </>
      )}
    </div>
  )
}
