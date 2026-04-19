'use client'

import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { MiniLineChart, StackedBars } from '@/components/dashboard/charts'
import { EmptyState, SectionCard, cn } from '@/components/dashboard/ui'
import { useDashboardSummaryQuery, useMealsQuery } from '@/lib/hooks/use-dashboard-api'

export function TrendsSection() {
  const [selectedRange, setSelectedRange] = useState<'7 Days' | '30 Days' | '90 Days'>('7 Days')
  const summaryQuery = useDashboardSummaryQuery()
  const rangeDays = selectedRange === '7 Days' ? 7 : selectedRange === '30 Days' ? 30 : 90
  const start = useMemo(() => {
    const next = new Date()
    next.setDate(next.getDate() - (rangeDays - 1))
    next.setHours(0, 0, 0, 0)
    return next
  }, [rangeDays])
  const mealsQuery = useMealsQuery({
    limit: 1000,
    dateFrom: start.toISOString(),
    dateTo: new Date().toISOString(),
  })

  const trendData = useMemo(() => {
    const goalCalories = summaryQuery.data?.goal?.dailyCalories ?? 0
    const daily = new Map<string, { label: string; calories: number; protein: number; carbs: number; fat: number }>()

    for (let offset = 0; offset < rangeDays; offset += 1) {
      const date = new Date(start)
      date.setDate(start.getDate() + offset)
      const key = date.toISOString().slice(0, 10)
      daily.set(key, {
        label: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      })
    }

    for (const meal of mealsQuery.data?.meals ?? []) {
      const key = meal.loggedAt.slice(0, 10)
      const day = daily.get(key)

      if (!day) {
        continue
      }

      for (const item of meal.items) {
        day.calories += item.calories
        day.protein += Number(item.proteinGrams ?? 0)
        day.carbs += Number(item.carbsGrams ?? 0)
        day.fat += Number(item.fatGrams ?? 0)
      }
    }

    const values = Array.from(daily.values())
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
  }, [mealsQuery.data?.meals, rangeDays, start, summaryQuery.data?.goal?.dailyCalories])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-2xl text-[#f5f5f5]">Nutrition Trends</h2>
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

      {mealsQuery.isLoading ? (
        <SectionCard className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
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
