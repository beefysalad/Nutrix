'use client'

import { Bot, Loader2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { MiniDonut } from '@/components/dashboard/charts'
import { SectionCard } from '@/components/dashboard/ui'
import { useDashboardSummaryQuery } from '@/lib/hooks/use-dashboard-api'

// Neon accent palette — one color per stat / macro
const NEON = {
  yellow: {
    text: 'text-[#e4ff00]',
    borderTop: 'border-t-[#e4ff00]',
    glow: 'shadow-[0_-2px_12px_rgba(228,255,0,0.15)]',
    hex: '#e4ff00',
  },
  green: {
    text: 'text-[#00ff88]',
    borderTop: 'border-t-[#00ff88]',
    glow: 'shadow-[0_-2px_12px_rgba(0,255,136,0.15)]',
    hex: '#00ff88',
  },
  blue: {
    text: 'text-[#38bdf8]',
    borderTop: 'border-t-[#38bdf8]',
    glow: 'shadow-[0_-2px_12px_rgba(56,189,248,0.15)]',
    hex: '#38bdf8',
  },
  orange: {
    text: 'text-[#ff6b35]',
    borderTop: 'border-t-[#ff6b35]',
    glow: 'shadow-[0_-2px_12px_rgba(255,107,53,0.15)]',
    hex: '#ff6b35',
  },
  purple: {
    text: 'text-[#bf5af2]',
    borderTop: 'border-t-[#bf5af2]',
    glow: 'shadow-[0_-2px_12px_rgba(191,90,242,0.15)]',
    hex: '#bf5af2',
  },
}

const MEAL_TYPE_COLORS: Record<string, { badge: string; calText: string }> = {
  breakfast: {
    badge: 'bg-[#ff6b35]/15 border border-[#ff6b35]/40 text-[#ff6b35]',
    calText: 'text-[#ff6b35]',
  },
  lunch: {
    badge: 'bg-[#00ff88]/12 border border-[#00ff88]/40 text-[#00ff88]',
    calText: 'text-[#00ff88]',
  },
  dinner: {
    badge: 'bg-[#38bdf8]/12 border border-[#38bdf8]/40 text-[#38bdf8]',
    calText: 'text-[#38bdf8]',
  },
  snack: {
    badge: 'bg-[#bf5af2]/12 border border-[#bf5af2]/40 text-[#bf5af2]',
    calText: 'text-[#bf5af2]',
  },
  other: {
    badge: 'bg-[#e4ff00]/10 border border-[#e4ff00]/30 text-[#e4ff00]',
    calText: 'text-[#e4ff00]',
  },
}

function getMealColor(type: string) {
  return MEAL_TYPE_COLORS[type.toLowerCase()] ?? MEAL_TYPE_COLORS.other
}

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

  const totals = data?.totals ?? {
    calories: 0,
    proteinGrams: 0,
    carbsGrams: 0,
    fatGrams: 0,
    mealCount: 0,
  }
  const displayMeals =
    totals.mealCount > 0 ? (data?.meals ?? []) : (data?.recentMeals ?? [])
  const hasAnyMealHistory = Boolean(data?.hasAnyMealHistory)
  const isShowingRecentMeals = totals.mealCount === 0 && displayMeals.length > 0
  const mealsHeading = totals.mealCount > 0 ? "Today's meals" : 'Recent meals'
  const mealsDescription =
    totals.mealCount > 0
      ? "What you've logged so far today."
      : hasAnyMealHistory
        ? 'Your latest logged meals while today is still empty.'
        : '0 meals logged yet.'
  const macroDescription =
    totals.mealCount > 0
      ? "A quick look at today's macro balance."
      : 'Current macro split for today.'

  const summaryCards = [
    {
      label: 'Calories',
      value: `${totals.calories}`,
      helper: 'today',
      accent: NEON.yellow,
    },
    {
      label: 'Protein',
      value: `${totals.proteinGrams.toFixed(1)}g`,
      helper: 'today',
      accent: NEON.green,
    },
    {
      label: 'Meals',
      value: `${totals.mealCount}`,
      helper: 'logged today',
      accent: NEON.blue,
    },
    {
      label: 'Remaining',
      value:
        data?.remainingCalories != null ? `${data.remainingCalories}` : '0',
      helper: data?.goal ? 'vs goal' : 'set a calorie goal',
      accent: NEON.orange,
    },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border border-t-2 border-white/10 ${card.accent.borderTop} ${card.accent.glow} bg-[#141414] px-4 py-4`}
          >
            <div className="text-xs text-[#777] sm:text-sm">{card.label}</div>
            <div
              className={`mt-2 font-mono text-2xl font-black sm:text-3xl ${card.accent.text}`}
            >
              {card.value}
            </div>
            <div className="mt-1.5 text-xs tracking-wide text-[#666] uppercase">
              {card.helper}
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/suggestions"
        className="group relative z-10 block overflow-hidden rounded-[2rem] border border-[#e4ff00]/20 bg-[#e4ff00]/5 p-5 transition-all hover:border-[#e4ff00]/40 hover:bg-[#e4ff00]/10 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e4ff00] text-black shadow-[0_0_20px_rgba(228,255,0,0.3)] sm:h-12 sm:w-12">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-widest text-[#e4ff00] uppercase">
                  AI Nutrix
                </span>
                <span className="rounded-full bg-[#e4ff00] px-1.5 py-0.5 text-[9px] font-bold text-black uppercase">
                  Beta
                </span>
              </div>
              <h4 className="truncate text-base font-bold text-[#f5f5f5] sm:text-lg">
                Get personalized meal suggestions
              </h4>
              <p className="text-xs text-[#777]">
                Based on your current macros and goals.
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-[#444] transition-transform group-hover:translate-x-1 group-hover:text-[#e4ff00]" />
        </div>
      </Link>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg text-[#f5f5f5]">{mealsHeading}</h3>
              <p className="mt-1 text-sm text-[#777]">{mealsDescription}</p>
            </div>
          </div>
          <div className="space-y-3">
            {displayMeals.length > 0 ? (
              displayMeals.map((meal) => {
                const calories = meal.items.reduce(
                  (sum, item) => sum + item.calories,
                  0
                )
                const color = getMealColor(meal.mealType)
                const loggedAt = new Date(meal.loggedAt)
                const loggedAtLabel = isShowingRecentMeals
                  ? new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    }).format(loggedAt)
                  : new Intl.DateTimeFormat('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    }).format(loggedAt)

                return (
                  <div
                    key={meal.id}
                    className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span
                          className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-black tracking-tighter uppercase ${color.badge}`}
                        >
                          {meal.mealType}
                        </span>
                        <div className="mt-1.5 text-xs text-[#777]">
                          {meal.items
                            .map((item) => item.foodNameSnapshot)
                            .join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-mono text-sm font-black ${color.calText}`}
                        >
                          {calories} cal
                        </div>
                        <div className="mt-1 text-xs tracking-wide text-[#666] uppercase">
                          {loggedAtLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-black tracking-tighter text-[#777] uppercase">
                      0 meals
                    </span>
                    <div className="mt-1.5 text-xs text-[#777]">
                      No food logged yet
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-black text-[#e4ff00]">
                      0 cal
                    </div>
                    <div className="mt-1 text-xs tracking-wide text-[#666] uppercase">
                      today
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard className="sm:min-h-[200px]">
          <div className="mb-5">
            <h3 className="text-lg text-[#f5f5f5]">Macro split</h3>
            <p className="mt-1 text-sm text-[#777]">{macroDescription}</p>
          </div>
          <MiniDonut
            totalLabel={`${totals.calories}`}
            data={[
              {
                name: 'Protein',
                value: Math.max(0, totals.proteinGrams),
                color: NEON.green.hex,
              },
              {
                name: 'Carbs',
                value: Math.max(0, totals.carbsGrams),
                color: NEON.blue.hex,
              },
              {
                name: 'Fat',
                value: Math.max(0, totals.fatGrams),
                color: NEON.orange.hex,
              },
            ]}
          />
        </SectionCard>
      </div>
    </div>
  )
}
