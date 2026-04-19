'use client'

import { Loader2, Sparkles } from 'lucide-react'
import { useMemo } from 'react'

import { EmptyState, SectionCard } from '@/components/dashboard/ui'
import { useDashboardSummaryQuery, useMealsQuery } from '@/lib/hooks/use-dashboard-api'

export function InsightsSection() {
  const summaryQuery = useDashboardSummaryQuery()
  const start = new Date()
  start.setDate(start.getDate() - 6)
  start.setHours(0, 0, 0, 0)
  const mealsQuery = useMealsQuery({
    limit: 200,
    dateFrom: start.toISOString(),
    dateTo: new Date().toISOString(),
  })

  const insights = useMemo(() => {
    const meals = mealsQuery.data?.meals ?? []

    if (meals.length === 0) {
      return null
    }

    const mealTypeCounts = meals.reduce<Record<string, number>>((acc, meal) => {
      acc[meal.mealType] = (acc[meal.mealType] ?? 0) + 1
      return acc
    }, {})

    const mostCommonMealType = Object.entries(mealTypeCounts).sort((a, b) => b[1] - a[1])[0]
    const averageCalories =
      meals.reduce(
        (sum, meal) => sum + meal.items.reduce((itemSum, item) => itemSum + item.calories, 0),
        0,
      ) / meals.length

    return {
      mostCommonMealType,
      averageCalories: Math.round(averageCalories),
      remainingCalories: summaryQuery.data?.remainingCalories ?? null,
    }
  }, [mealsQuery.data?.meals, summaryQuery.data?.remainingCalories])

  if (mealsQuery.isLoading) {
    return (
      <SectionCard className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
      </SectionCard>
    )
  }

  if (!insights) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionCard>
          <EmptyState
            title="Insights need a bit of real nutrition history"
            description="Log meals across a few days and Nutrix will start surfacing patterns and guidance here."
          />
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionCard>
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-[#e4ff00]/10 p-3">
            <Sparkles className="h-5 w-5 text-[#e4ff00]" />
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg text-[#f5f5f5]">Nutrition insight</h3>
              <span className="rounded-full bg-[#e4ff00] px-2 py-0.5 text-xs font-medium text-[#0a0a0a]">
                LIVE
              </span>
            </div>
            <p className="leading-relaxed text-[#888]">
              Your most frequently logged meal over the last 7 days is{' '}
              <span className="text-[#f5f5f5] capitalize">{insights.mostCommonMealType?.[0]}</span>.
              Your average logged meal is about{' '}
              <span className="text-[#f5f5f5]">{insights.averageCalories} calories</span>.
              {insights.remainingCalories != null
                ? ` Today you are ${insights.remainingCalories >= 0 ? `${insights.remainingCalories} calories under` : `${Math.abs(insights.remainingCalories)} calories over`} your calorie goal.`
                : ' Set a calorie goal to unlock goal-based insights.'}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
