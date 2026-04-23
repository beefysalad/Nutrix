'use client'

import { Bot, Loader2, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { EmptyState, SectionCard } from '@/components/dashboard/ui'
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
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${iso}T00:00:00`))
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
    <div className="group flex min-h-[190px] flex-col justify-between rounded-[1.35rem] border border-white/[0.08] bg-[#101010] p-4 transition-colors duration-200 hover:border-[#e4ff00]/25 hover:bg-[#131313]">
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
        <button
          type="button"
          disabled={deletePending}
          onClick={onDelete}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.06] bg-black/20 text-[#444] transition-colors hover:border-red-500/30 hover:text-red-400 md:opacity-0 md:group-hover:opacity-100"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      <div className="mt-3">
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

      {isAi && !meal.aiFeedback && (
        <div className="mt-3 flex items-center gap-3 border-t border-white/[0.05] pt-2 text-[10px]">
          <span className="font-bold tracking-widest text-[#444] uppercase">
            Accurate?
          </span>
          <button
            onClick={() => onFeedback('accurate')}
            className="font-black tracking-tighter text-[#555] uppercase transition-colors hover:text-[#e4ff00]"
          >
            Yes
          </button>
          <button
            onClick={() => onFeedback('inaccurate')}
            className="font-black tracking-tighter text-[#555] uppercase transition-colors hover:text-red-400/70"
          >
            No
          </button>
        </div>
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
  onDelete,
  onFeedback,
  deletePending,
}: {
  date: string
  meals: MealResponse[]
  goalCalories: number | null
  onDelete: (id: string) => void
  onFeedback: (mealId: string, fb: 'accurate' | 'inaccurate') => void
  deletePending: boolean
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
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-5 sm:px-6">
        <div>
          <div className="text-[9px] font-black tracking-[0.24em] text-[#555] uppercase">
            Nutrition timeline
          </div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-[#f4f4f4]">
            {formatDayHeader(date)}
          </div>
        </div>
        <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] font-black tracking-widest text-[#777] uppercase">
          {meals.length} {meals.length === 1 ? 'meal' : 'meals'}
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

        <div className="-mx-5 px-5">
          <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2 sm:gap-4">
            {meals.map((meal) => (
              <div key={meal.id} className="w-[300px] flex-shrink-0 sm:w-[340px]">
                <MealCard
                  meal={meal}
                  deletePending={deletePending}
                  onDelete={() => onDelete(meal.id)}
                  onFeedback={(fb) => onFeedback(meal.id, fb)}
                />
              </div>
            ))}
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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  )

  const mealsQuery = useMealsQuery({ limit: 100 })
  const goalsQuery = useGoalsQuery()
  const updateFeedbackMut = useUpdateMealAiFeedbackMutation()
  const deleteMealMut = useDeleteMealMutation()

  const goalCalories = goalsQuery.data?.goal?.dailyCalories ?? null

  const groupedDays = useMemo(() => {
    const meals = mealsQuery.data?.meals ?? []
    const q = searchQuery.trim().toLowerCase()

    const filtered = meals.filter((meal) => {
      const mealDate = meal.loggedAt.slice(0, 10)
      const matchesDate = selectedDate ? mealDate === selectedDate : true
      const haystack = [
        meal.mealType,
        meal.notes ?? '',
        ...meal.items.map((i) => i.foodNameSnapshot),
      ]
        .join(' ')
        .toLowerCase()
      const matchesQ = q ? haystack.includes(q) : true
      return matchesDate && matchesQ
    })

    // group by date
    const map = new Map<string, MealResponse[]>()
    for (const meal of filtered) {
      const d = meal.loggedAt.slice(0, 10)
      if (!map.has(d)) map.set(d, [])
      map.get(d)!.push(meal)
    }

    return [...map.entries()].sort(([a], [b]) => b.localeCompare(a))
  }, [mealsQuery.data?.meals, searchQuery, selectedDate])

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
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="rounded-[1.75rem] border border-white/10 bg-[#111111] p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#666]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meals, notes, or ingredients..."
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#0c0c0c] pr-4 pl-11 text-sm text-[#f5f5f5] outline-none placeholder:text-[#555] focus:border-[#e4ff00]"
            />
          </label>
          <label className="relative block h-12 lg:w-[190px]">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Filter meals by date"
              className="h-12 w-full cursor-pointer rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 font-mono text-sm text-[#cfcfcf] [color-scheme:dark] outline-none hover:border-white/20 focus:border-[#e4ff00] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70"
            />
          </label>
        </div>
      </div>

      {mealsQuery.isLoading ? (
        <SectionCard className="flex items-center justify-center py-14">
          <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
        </SectionCard>
      ) : groupedDays.length === 0 ? (
        <SectionCard>
          <EmptyState
            title="No meal entries for this filter yet"
            description="Try another date, or log a meal and it will show up here with its foods and macros."
          />
        </SectionCard>
      ) : (
        <>
          <div className="-mx-4 px-4 md:hidden">
            <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
              {groupedDays.map(([date, meals]) => (
                <div
                  key={date}
                  className="w-[calc(100vw-2.5rem)] flex-shrink-0 snap-start"
                >
                  <DayCard
                    date={date}
                    meals={meals}
                    goalCalories={goalCalories}
                    onDelete={handleDelete}
                    onFeedback={handleFeedback}
                    deletePending={deleteMealMut.isPending}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="hidden space-y-5 md:block">
            {groupedDays.map(([date, meals]) => (
              <DayCard
                key={date}
                date={date}
                meals={meals}
                goalCalories={goalCalories}
                onDelete={handleDelete}
                onFeedback={handleFeedback}
                deletePending={deleteMealMut.isPending}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
