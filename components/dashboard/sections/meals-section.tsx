'use client'

import { Bot, ChevronLeft, ChevronRight, Loader2, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { SectionCard } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'
import {
  useDeleteMealMutation,
  useGoalsQuery,
  getApiErrorMessage,
  useMealsQuery,
  useUpdateMealAiFeedbackMutation,
  type MealResponse,
} from '@/lib/hooks/use-dashboard-api'

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDayHeader(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${iso}T00:00:00`))
}

function toLocalIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function shiftIsoDate(iso: string, dayDelta: number) {
  const date = new Date(`${iso}T00:00:00`)
  date.setDate(date.getDate() + dayDelta)
  return toLocalIsoDate(date)
}

function formatTime(loggedAt: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(loggedAt))
}

function mealTotals(meals: MealResponse[]) {
  return meals.reduce(
    (acc, meal) => {
      meal.items.forEach((item) => {
        acc.calories += item.calories
        acc.protein += Number(item.proteinGrams ?? 0)
        acc.carbs += Number(item.carbsGrams ?? 0)
        acc.fat += Number(item.fatGrams ?? 0)
      })
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

function mealCalories(meal: MealResponse) {
  return meal.items.reduce((s, i) => s + i.calories, 0)
}

function mealMacroTotals(meal: MealResponse) {
  return meal.items.reduce(
    (totals, item) => {
      totals.protein += Number(item.proteinGrams ?? 0)
      totals.carbs += Number(item.carbsGrams ?? 0)
      totals.fat += Number(item.fatGrams ?? 0)
      return totals
    },
    { protein: 0, carbs: 0, fat: 0 },
  )
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div
      className={
        accent
          ? 'rounded-2xl border border-[#e4ff00]/25 bg-[#e4ff00]/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(228,255,0,0.14)]'
          : 'rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
      }
    >
      <div className="text-[9px] font-black tracking-[0.24em] text-[#5f5f5f] uppercase">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-xl font-black sm:text-2xl ${accent ? 'text-[#e4ff00]' : 'text-[#f0f0f0]'}`}
      >
        {value}
      </div>
    </div>
  )
}

function MealCard({
  meal,
  onDelete,
  onFeedback,
  deletePending,
}: {
  meal: MealResponse
  onDelete: () => void
  onFeedback: (fb: 'accurate' | 'inaccurate') => void
  deletePending: boolean
}) {
  const cal = mealCalories(meal)
  const mealLabel =
    meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)
  const isAi = meal.source === 'ai' || meal.source === 'telegram'
  const macros = mealMacroTotals(meal)

  const title = meal.items.map((i) => i.foodNameSnapshot).join(', ')

  return (
    <div className="group flex h-full min-h-[220px] flex-col rounded-[1.35rem] border border-white/[0.08] bg-[#101010] p-4 transition-colors duration-200 hover:border-[#e4ff00]/25 hover:bg-[#131313]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[9px] font-black tracking-[0.18em] text-[#888] uppercase">
            {mealLabel}
          </span>
          <span className="text-[10px] font-bold tracking-wider text-[#555] uppercase">
            {formatTime(meal.loggedAt)}
          </span>
          {isAi && (
            <span className="flex items-center gap-0.5 rounded-full border border-white/5 bg-white/5 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#666] uppercase">
              <Bot className="h-2.5 w-2.5 text-[#e4ff00]/50" />
              AI
            </span>
          )}
        </div>
        <Button
          type="button"
          disabled={deletePending}
          onClick={onDelete}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.06] bg-black/20 text-[#444] transition-colors hover:border-red-500/30 hover:text-red-400 md:opacity-0 md:group-hover:opacity-100"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="mt-3 min-h-[64px]">
        <div className="line-clamp-2 text-sm leading-snug font-semibold text-[#f1f1f1]">
          {title}
        </div>
        <div className="mt-1 text-[11px] text-[#666]">
          {meal.items.length} {meal.items.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/[0.06] bg-black/20 p-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[9px] font-black tracking-[0.22em] text-[#555] uppercase">
              Calories
            </div>
            <div className="mt-1 font-mono text-xl font-black text-[#e4ff00]">
              {cal}
              <span className="ml-1 text-[10px] tracking-wider text-[#6f7c00]">
                kcal
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-right">
            <MacroPill label="P" value={`${Math.round(macros.protein)}g`} />
            <MacroPill label="C" value={`${Math.round(macros.carbs)}g`} />
            <MacroPill label="F" value={`${Math.round(macros.fat)}g`} />
          </div>
        </div>
      </div>

      {isAi && !meal.aiFeedback ? (
        <div className="mt-3 flex min-h-[22px] items-center gap-3 border-t border-white/[0.05] pt-2 text-[10px]">
          <span className="font-bold tracking-widest text-[#444] uppercase">
            Accurate?
          </span>
          <Button
            onClick={() => onFeedback('accurate')}
            className="font-black tracking-tighter text-[#555] uppercase transition-colors hover:text-[#e4ff00]"
          >
            Yes
          </Button>
          <Button
            onClick={() => onFeedback('inaccurate')}
            className="font-black tracking-tighter text-[#555] uppercase transition-colors hover:text-red-400/70"
          >
            No
          </Button>
        </div>
      ) : (
        <div className="mt-3 min-h-[22px]" />
      )}
    </div>
  )
}

function MacroPill({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[8px] font-black tracking-widest text-[#555] uppercase">
        {label}
      </div>
      <div className="mt-1 font-mono text-xs font-bold text-[#d7d7d7]">
        {value}
      </div>
    </div>
  )
}

function DayCard({
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
              <div className="mt-1 text-2xl font-semibold tracking-tight text-[#f4f4f4]">
                {formatDayHeader(date)}
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

        {onDateChange ? (
          <div className="flex justify-end">
            <label className="relative block h-11 w-full sm:w-[220px]">
              <input
                type="date"
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                aria-label="Filter meals by date"
                className="h-11 w-full cursor-pointer rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 font-mono text-sm text-[#cfcfcf] [color-scheme:dark] outline-none hover:border-white/20 focus:border-[#e4ff00] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70"
              />
            </label>
          </div>
        ) : null}
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

export function MealsSection() {
  const [selectedDate, setSelectedDate] = useState(() => toLocalIsoDate(new Date()))

  const mealsQuery = useMealsQuery({ limit: 100 })
  const goalsQuery = useGoalsQuery()
  const updateFeedbackMut = useUpdateMealAiFeedbackMutation()
  const deleteMealMut = useDeleteMealMutation()

  const goalCalories = goalsQuery.data?.goal?.dailyCalories ?? null
  const todayIso = toLocalIsoDate(new Date())

  const filteredMeals = useMemo(() => {
    const meals = mealsQuery.data?.meals ?? []

    return meals.filter((meal) => {
      const mealDate = meal.loggedAt.slice(0, 10)
      return selectedDate ? mealDate === selectedDate : true
    })
  }, [mealsQuery.data?.meals, selectedDate])

  async function handleDelete(mealId: string) {
    if (!window.confirm('Delete this meal entry?')) return
    try {
      await deleteMealMut.mutateAsync(mealId)
      toast.success('Meal deleted')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not delete meal'))
    }
  }

  function handleFeedback(mealId: string, fb: 'accurate' | 'inaccurate') {
    updateFeedbackMut.mutate({ mealId, aiFeedback: fb })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {mealsQuery.isLoading ? (
        <SectionCard className="flex items-center justify-center py-14">
          <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
        </SectionCard>
      ) : (
        <DayCard
          date={selectedDate}
          meals={filteredMeals}
          goalCalories={goalCalories}
          onDateChange={setSelectedDate}
          onDelete={handleDelete}
          onFeedback={handleFeedback}
          deletePending={deleteMealMut.isPending}
          onPrev={() => setSelectedDate((value) => shiftIsoDate(value, -1))}
          onNext={() => setSelectedDate((value) => shiftIsoDate(value, 1))}
          canGoPrev
          canGoNext={selectedDate < todayIso}
        />
      )}
    </div>
  )
}
