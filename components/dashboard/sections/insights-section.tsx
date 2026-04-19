'use client'

import { Bot, Loader2 } from 'lucide-react'

import { EmptyState, SectionCard } from '@/components/dashboard/ui'
import { useDashboardInsightsQuery } from '@/lib/hooks/use-dashboard-api'

export function InsightsSection() {
  const insightsQuery = useDashboardInsightsQuery()
  const insight = insightsQuery.data?.insight

  if (insightsQuery.isLoading) {
    return (
      <SectionCard className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
      </SectionCard>
    )
  }

  if (insightsQuery.isError) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionCard>
          <EmptyState
            title="Insights could not be loaded"
            description="Nutrix hit an issue while generating your current nutrition insights. Try again in a moment."
          />
        </SectionCard>
      </div>
    )
  }

  if (!insight || !insightsQuery.data?.hasData) {
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
            <Bot className="h-5 w-5 text-[#e4ff00]" />
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg text-[#f5f5f5]">Nutrition insight</h3>
              <span className="rounded-full bg-[#e4ff00] px-2 py-0.5 text-xs font-medium text-[#0a0a0a]">
                Beta
              </span>
            </div>
            <p className="leading-relaxed text-[#888]">
              Your most frequently logged meal over the last 7 days is{' '}
              <span className="text-[#f5f5f5] capitalize">{insight.mostCommonMealType}</span>.
              {' '}You logged <span className="text-[#f5f5f5]">{insight.mealCount} meals</span> across{' '}
              <span className="text-[#f5f5f5]">{insight.daysLogged} days</span>.
              {' '}Your average logged meal is about{' '}
              <span className="text-[#f5f5f5]">{insight.averageCalories} calories</span>.
              {insight.remainingCalories != null
                ? ` Today you are ${insight.remainingCalories >= 0 ? `${insight.remainingCalories} calories under` : `${Math.abs(insight.remainingCalories)} calories over`} your calorie goal.`
                : ' Set a calorie goal to unlock goal-based insights.'}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
