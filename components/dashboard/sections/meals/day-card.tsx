import { Bot, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { type MealResponse } from '@/lib/hooks/use-dashboard-api'

import { MealCard } from './meal-card'
import { StatCard } from './stat-card'
import { formatDayHeader, mealTotals } from './utils'

export function DayCard({
  date,
  meals,
  goalCalories,
  onDateChange,
  onDelete,
  onFeedback,
  deletePending,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}: {
  date: string
  meals: MealResponse[]
  goalCalories: number | null
  onDateChange?: (value: string) => void
  onDelete: (id: string) => void
  onFeedback: (mealId: string, fb: 'accurate' | 'inaccurate') => void
  deletePending: boolean
  onPrev?: () => void
  onNext?: () => void
  canGoPrev?: boolean
  canGoNext?: boolean
}) {
  const totals = mealTotals(meals)
  const remaining =
    goalCalories != null ? Math.max(0, goalCalories - totals.calories) : null
  const pct = goalCalories
    ? Math.min(100, Math.round((totals.calories / goalCalories) * 100))
    : null
  const hasTelegram = meals.some((m) => m.source === 'telegram')

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#101010] shadow-[0_30px_90px_rgba(0,0,0,0.36)]">
      <div className="flex flex-col gap-4 border-b border-white/[0.06] px-5 py-5 sm:px-6">
        {/* left: label + date + chevrons */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0">
              <div className="text-[9px] font-black tracking-[0.24em] text-[#555] uppercase">
                Nutrition timeline
              </div>
              <div className="relative mt-1 group">
                <div className="text-2xl font-semibold tracking-tight text-[#f4f4f4] transition-colors group-hover:text-[#e4ff00]">
                  {formatDayHeader(date)}
                </div>
                {onDateChange ? (
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => onDateChange(e.target.value)}
                    aria-label="Filter meals by date"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                ) : null}
              </div>
            </div>
            {(onPrev || onNext) && (
               <div className="flex flex-shrink-0 items-center gap-1">
                <Button
                  type="button"
                  onClick={onPrev}
                  disabled={!canGoPrev}
                  aria-label="Previous day"
                  className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/10 bg-[#0f0f0f] text-[#e4ff00] transition-colors hover:border-[#e4ff00]/50 hover:bg-[#171a0a] hover:text-[#e4ff00] disabled:cursor-not-allowed disabled:bg-transparent disabled:text-[#555] disabled:opacity-25"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  onClick={onNext}
                  disabled={!canGoNext}
                  aria-label="Next day"
                  className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/10 bg-[#0f0f0f] text-[#e4ff00] transition-colors hover:border-[#e4ff00]/50 hover:bg-[#171a0a] hover:text-[#e4ff00] disabled:cursor-not-allowed disabled:bg-transparent disabled:text-[#555] disabled:opacity-25"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
          <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] font-black tracking-widest text-[#777] uppercase">
            {meals.length} {meals.length === 1 ? 'meal' : 'meals'}
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Calories"
            value={totals.calories.toLocaleString()}
            accent
          />
          <StatCard label="Protein" value={`${Math.round(totals.protein)}g`} />
          <StatCard label="Fat" value={`${Math.round(totals.fat)}g`} />
        </div>

        {pct != null && (
          <div className="space-y-2">
            <div className="overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-2.5 rounded-full bg-[#e4ff00] transition-all duration-700"
                style={{
                  width: `${pct}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold tracking-wide text-[#555] uppercase">
              <span>{pct}% of daily goal</span>
              {remaining != null && (
                <span>{remaining.toLocaleString()} kcal left</span>
              )}
            </div>
          </div>
        )}

        <div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {meals.length > 0 ? (
              meals.map((meal) => (
                <div key={meal.id} className="w-full">
                  <MealCard
                    meal={meal}
                    deletePending={deletePending}
                    onDelete={() => onDelete(meal.id)}
                    onFeedback={(fb) => onFeedback(meal.id, fb)}
                  />
                </div>
              ))
            ) : (
              <div className="w-full rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
                <div className="text-sm font-semibold text-[#f0f0f0]">
                  No meals logged for this day
                </div>
                <div className="mt-2 text-sm text-[#666]">
                  Use the arrows or date picker to move around, or log a meal for this date.
                </div>
              </div>
            )}
          </div>
        </div>

        {hasTelegram && (
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#e4ff00]/10">
              <Bot className="h-3.5 w-3.5 text-[#e4ff00]" />
            </div>
            <span className="text-xs text-[#555]">
              Some meals captured via{' '}
              <span className="text-[#888]">@NutrrixBot</span> on Telegram
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
