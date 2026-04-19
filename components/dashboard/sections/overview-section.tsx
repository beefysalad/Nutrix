'use client'

import { Loader2, Sparkles, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { MiniDonut } from '@/components/dashboard/charts'
import { EmptyState, SectionCard } from '@/components/dashboard/ui'
import { useDashboardSummaryQuery } from '@/lib/hooks/use-dashboard-api'

export function OverviewSection() {
  const summaryQuery = useDashboardSummaryQuery()

  if (summaryQuery.isLoading) {
    return (
      <SectionCard className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
      </SectionCard>
    )
  }

  const data = summaryQuery.data

  if (!data || data.totals.mealCount === 0) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionCard>
          <EmptyState
            title="Your dashboard will populate once meals are logged"
            description="Start with Log Meal or Telegram, then Nutrix will compute today’s calories, macros, and goal progress here."
          />
        </SectionCard>
      </div>
    )
  }

  const summaryCards = [
    { label: 'Calories', value: `${data.totals.calories}`, helper: 'today' },
    { label: 'Protein', value: `${data.totals.proteinGrams.toFixed(1)}g`, helper: 'today' },
    { label: 'Meals', value: `${data.totals.mealCount}`, helper: 'logged today' },
    {
      label: 'Remaining',
      value: data.remainingCalories != null ? `${data.remainingCalories}` : 'No goal',
      helper: data.goal ? 'vs goal' : 'set a calorie goal',
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <SectionCard key={card.label}>
            <div className="text-sm text-[#777]">{card.label}</div>
            <div className="mt-3 font-mono text-3xl text-[#f5f5f5]">{card.value}</div>
            <div className="mt-2 text-xs uppercase tracking-wide text-[#666]">{card.helper}</div>
          </SectionCard>
        ))}
      </div>

      <Link 
        href="/dashboard/suggestions"
        className="group relative z-10 block overflow-hidden rounded-[2rem] border border-[#e4ff00]/20 bg-[#e4ff00]/5 p-6 transition-all hover:border-[#e4ff00]/40 hover:bg-[#e4ff00]/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e4ff00] text-black shadow-[0_0_20px_rgba(228,255,0,0.3)]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black uppercase tracking-widest text-[#e4ff00]">AI Nutrix</span>
                <span className="rounded-full bg-[#e4ff00] px-1.5 py-0.5 text-[9px] font-bold uppercase text-black">New</span>
              </div>
              <h4 className="text-lg font-bold text-[#f5f5f5]">Get personalized meal suggestions</h4>
              <p className="text-xs text-[#777]">Based on your current macros and goals.</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-[#444] transition-transform group-hover:translate-x-1 group-hover:text-[#e4ff00]" />
        </div>
      </Link>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg text-[#f5f5f5]">Today’s meals</h3>
              <p className="mt-1 text-sm text-[#777]">What you’ve logged so far today.</p>
            </div>
          </div>
          <div className="space-y-3">
            {data.meals.map((meal) => {
              const calories = meal.items.reduce((sum, item) => sum + item.calories, 0)

              return (
                <div
                  key={meal.id}
                  className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium capitalize text-[#f5f5f5]">
                        {meal.mealType}
                      </div>
                      <div className="mt-1 text-xs text-[#777]">
                        {meal.items.map((item) => item.foodNameSnapshot).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-[#f5f5f5]">{calories} cal</div>
                      <div className="mt-1 text-xs uppercase tracking-wide text-[#666]">
                        {new Intl.DateTimeFormat('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        }).format(new Date(meal.loggedAt))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="mb-5">
            <h3 className="text-lg text-[#f5f5f5]">Macro split</h3>
            <p className="mt-1 text-sm text-[#777]">A quick look at today’s macro balance.</p>
          </div>
          <MiniDonut
            totalLabel={`${data.totals.calories}`}
            data={[
              {
                name: 'Protein',
                value: Math.max(0, data.totals.proteinGrams),
                color: '#e4ff00',
              },
              {
                name: 'Carbs',
                value: Math.max(0, data.totals.carbsGrams),
                color: '#b5cc00',
              },
              {
                name: 'Fat',
                value: Math.max(0, data.totals.fatGrams),
                color: '#7c7c7c',
              },
            ]}
          />
        </SectionCard>
      </div>
    </div>
  )
}
