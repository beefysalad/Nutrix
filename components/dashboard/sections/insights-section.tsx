'use client'

import { Bot, Loader2 } from 'lucide-react'

import { SectionCard } from '@/components/dashboard/ui'
import { useDashboardInsightsQuery } from '@/hooks/dashboard'

export function InsightsSection() {
  const insightsQuery = useDashboardInsightsQuery()
  const insight = insightsQuery.data?.insight
  const topFoods = insight?.topFoods ?? []
  const primaryInsight =
    insight?.primaryInsight ??
    '0 meals analyzed in the last 7 days.'
  const averageProteinPerMeal = insight?.averageProteinPerMeal ?? 0
  const secondaryInsight =
    insight?.secondaryInsight ??
    'Logged days: 0. Meal count: 0. Average meal calories: 0.'
  const actionInsight =
    insight?.actionInsight ??
    'Start with one meal and this section will update with your actual food patterns.'

  if (insightsQuery.isLoading) {
    return (
      <SectionCard className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
      </SectionCard>
    )
  }

  if (insightsQuery.isError) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <SectionCard>
          <div className="text-sm text-[#888]">Insights could not be loaded.</div>
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SectionCard>
        <div className="space-y-6">
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
              <p className="leading-relaxed text-[#d0d0d0]">{primaryInsight}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InsightMetric label="Avg meal calories" value={`${insight?.averageCalories ?? 0}`} helper="per logged meal" />
            <InsightMetric label="Avg protein" value={`${averageProteinPerMeal}g`} helper="per logged meal" />
            <InsightMetric
              label="Goal status today"
              value={
                insight?.remainingCalories == null
                  ? '0'
                  : insight.remainingCalories >= 0
                    ? `${insight.remainingCalories} under`
                    : `${Math.abs(insight.remainingCalories)} over`
              }
              helper="vs calorie target"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-4">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#666]">What stands out</div>
              {secondaryInsight ? (
                <p className="mt-3 text-sm leading-relaxed text-[#9a9a9a]">{secondaryInsight}</p>
              ) : null}
              {actionInsight ? (
                <p className="mt-3 text-sm leading-relaxed text-[#c7c7c7]">{actionInsight}</p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-4">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#666]">Most logged foods</div>
              <div className="mt-3 space-y-3">
                {topFoods.length > 0 ? (
                  topFoods.map((food) => (
                    <div key={food.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111] px-4 py-3">
                      <div className="text-sm text-[#f5f5f5]">{food.name}</div>
                      <div className="text-xs uppercase tracking-wide text-[#888]">{food.count}x logged</div>
                    </div>
                  ))
                ) : (
                  <>
                    <FoodMetric name="Foods tracked" value="0" />
                    <FoodMetric name="Recurring foods" value="0" />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

function FoodMetric({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111] px-4 py-3">
      <div className="text-sm text-[#f5f5f5]">{name}</div>
      <div className="text-xs uppercase tracking-wide text-[#888]">{value}</div>
    </div>
  )
}

function InsightMetric({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-4">
      <div className="text-xs uppercase tracking-wide text-[#666]">{label}</div>
      <div className="mt-3 font-mono text-2xl text-[#f5f5f5]">{value}</div>
      <div className="mt-2 text-xs text-[#777]">{helper}</div>
    </div>
  )
}
