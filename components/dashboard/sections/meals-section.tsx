'use client'

import { Bot, CalendarDays, Loader2, Search, Trash2, Clock } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { EmptyState, SectionCard } from '@/components/dashboard/ui'
import {
  useDeleteMealMutation,
  getApiErrorMessage,
  useMealsQuery,
  useUpdateMealAiFeedbackMutation,
} from '@/lib/hooks/use-dashboard-api'

const MEAL_TYPE_COLORS: Record<string, { badge: string; cal: string }> = {
  breakfast: { badge: 'bg-[#ff6b35]/15 border border-[#ff6b35]/40 text-[#ff6b35]', cal: 'text-[#ff6b35]' },
  lunch:     { badge: 'bg-[#00ff88]/12 border border-[#00ff88]/40 text-[#00ff88]', cal: 'text-[#00ff88]' },
  dinner:    { badge: 'bg-[#38bdf8]/12 border border-[#38bdf8]/40 text-[#38bdf8]', cal: 'text-[#38bdf8]' },
  snack:     { badge: 'bg-[#bf5af2]/12 border border-[#bf5af2]/40 text-[#bf5af2]', cal: 'text-[#bf5af2]' },
  other:     { badge: 'bg-[#e4ff00]/10 border border-[#e4ff00]/30 text-[#e4ff00]', cal: 'text-[#e4ff00]' },
}
function getMealColor(type: string) {
  return MEAL_TYPE_COLORS[type.toLowerCase()] ?? MEAL_TYPE_COLORS.other
}

function formatDateLabel(date: string) {
  if (!date) {
    return 'Pick date'
  }

  const parsedDate = new Date(`${date}T00:00:00`)

  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(parsedDate)
}

export function MealsSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const dateInputRef = useRef<HTMLInputElement>(null)
  const mealsQuery = useMealsQuery({
    limit: 100,
  })
  const updateFeedbackMutation = useUpdateMealAiFeedbackMutation()
  const deleteMealMutation = useDeleteMealMutation()

  const filteredMeals = useMemo(() => {
    const meals = mealsQuery.data?.meals ?? []
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return meals.filter((meal) => {
      const mealDate = meal.loggedAt.slice(0, 10)
      const matchesDate = selectedDate ? mealDate === selectedDate : true
      const haystack = [
        meal.mealType,
        meal.notes ?? '',
        ...meal.items.map((item) => item.foodNameSnapshot),
      ]
        .join(' ')
        .toLowerCase()

      const matchesQuery = normalizedQuery ? haystack.includes(normalizedQuery) : true

      return matchesDate && matchesQuery
    })
  }, [mealsQuery.data?.meals, searchQuery, selectedDate])

  const dayTotals = useMemo(() => {
    return filteredMeals.reduce(
      (totals, meal) => {
        meal.items.forEach((item) => {
          totals.calories += item.calories
          totals.protein += Number(item.proteinGrams ?? 0)
          totals.carbs += Number(item.carbsGrams ?? 0)
          totals.fat += Number(item.fatGrams ?? 0)
        })

        return totals
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
  }, [filteredMeals])

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="rounded-[1.75rem] border border-white/10 bg-[#111111] p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search meals, notes, or ingredients..."
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#0c0c0c] pl-11 pr-4 text-sm text-[#f5f5f5] outline-none placeholder:text-[#555] focus:border-[#e4ff00]"
            />
          </label>
          <div className="relative lg:w-[190px]">
            <button
              type="button"
              onClick={() => {
                const dateInput = dateInputRef.current
                if (!dateInput) return

                if (typeof dateInput.showPicker === 'function') {
                  dateInput.showPicker()
                  return
                }

                dateInput.click()
                dateInput.focus()
              }}
              className="group flex h-12 w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 text-left transition-colors hover:border-white/20 focus:border-[#e4ff00] focus:outline-none"
            >
              <CalendarDays className="h-4 w-4 text-[#777] transition-colors group-hover:text-[#e4ff00]" />
            <span className="font-mono text-sm text-[#cfcfcf]">
              {formatDateLabel(selectedDate)}
            </span>
            </button>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              aria-label="Filter meals by date"
              className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <HistoryStat label="Showing" value={`${filteredMeals.length}`} helper="meals" />
          <HistoryStat label="Calories" value={`${dayTotals.calories}`} helper="kcal" />
          <HistoryStat label="Protein" value={`${dayTotals.protein.toFixed(1)}g`} helper="logged" />
          <HistoryStat label="Carbs / Fat" value={`${dayTotals.carbs.toFixed(0)}g / ${dayTotals.fat.toFixed(0)}g`} helper="split" />
        </div>
      </div>

      {mealsQuery.isLoading ? (
        <SectionCard className="flex items-center justify-center py-14">
          <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
        </SectionCard>
      ) : filteredMeals.length === 0 ? (
        <SectionCard>
          <EmptyState
            title="No meal entries for this filter yet"
            description="Try another date, or log a meal and it will show up here with its foods and macros."
          />
        </SectionCard>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredMeals.map((meal) => {
                const calories = meal.items.reduce((sum, item) => sum + item.calories, 0)
                const protein = meal.items.reduce(
                  (sum, item) => sum + Number(item.proteinGrams ?? 0),
                  0,
                )
                const carbs = meal.items.reduce(
                  (sum, item) => sum + Number(item.carbsGrams ?? 0),
                  0,
                )
                const fat = meal.items.reduce((sum, item) => sum + Number(item.fatGrams ?? 0), 0)

                return (
                  <div
                    key={meal.id}
                    className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#121212] transition-all hover:border-white/20"
                  >
                    <div className="border-b border-white/[0.06] bg-[#181818] px-4 py-3.5 sm:px-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-tighter ${getMealColor(meal.mealType).badge}`}>
                            {meal.mealType}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#555]">
                            <Clock className="h-3 w-3" />
                            {new Intl.DateTimeFormat('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            }).format(new Date(meal.loggedAt))}
                          </div>
                          {meal.source === 'ai' || meal.source === 'telegram' ? (
                            <div className="flex items-center gap-1 rounded-full border border-white/5 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#777]">
                              <Bot className="h-2.5 w-2.5 text-[#e4ff00]/50" />
                              AI
                            </div>
                          ) : null}
                        </div>

                        <div className="flex items-baseline gap-1 self-start sm:self-auto">
                          <span className={`font-mono text-xl font-black tracking-tighter ${getMealColor(meal.mealType).cal}`}>
                            {calories}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#444]">
                            kcal
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 px-4 py-3 sm:px-5">
                      <div className="divide-y divide-white/[0.05]">
                        {meal.items.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3 first:pt-0 last:pb-0"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="block break-words text-sm font-semibold leading-snug text-[#f5f5f5]">
                                {item.foodNameSnapshot}
                              </span>
                              {item.quantity || item.unit ? (
                                <span className="mt-1 block break-words text-[11px] leading-snug text-[#666]">
                                  {[item.quantity, item.unit].filter(Boolean).join(' ')}
                                </span>
                              ) : null}
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="font-mono text-sm font-black text-[#9a9a9a]">
                                {item.calories}
                              </div>
                              <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-[#444]">
                                kcal
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-white/[0.06] bg-[#181818]/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                      <MacroStrip protein={protein} carbs={carbs} fat={fat} />
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          disabled={deleteMealMutation.isPending}
                          onClick={async () => {
                            if (!window.confirm('Delete this meal entry?')) return
                            try {
                              await deleteMealMutation.mutateAsync(meal.id)
                              toast.success('Meal deleted')
                            } catch (error) {
                              toast.error(getApiErrorMessage(error, 'Could not delete meal'))
                            }
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/5 bg-black/20 text-[#444] transition-colors hover:border-red-500/30 hover:text-red-500/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {(meal.source === 'ai' || meal.source === 'telegram') && !meal.aiFeedback ? (
                      <div className="flex flex-col gap-3 bg-[#e4ff00]/[0.02] px-4 py-3 text-[10px] sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <span className="font-bold uppercase tracking-widest text-[#444]">
                          Accuracy Feedback?
                        </span>
                        <div className="flex gap-4">
                          <button
                            onClick={() =>
                              updateFeedbackMutation.mutateAsync({
                                mealId: meal.id,
                                aiFeedback: 'accurate',
                              })
                            }
                            className="font-black uppercase tracking-tighter text-[#666] transition-colors hover:text-[#e4ff00]"
                          >
                            Correct
                          </button>
                          <button
                            onClick={() =>
                              updateFeedbackMutation.mutateAsync({
                                mealId: meal.id,
                                aiFeedback: 'inaccurate',
                              })
                            }
                            className="font-black uppercase tracking-tighter text-[#666] transition-colors hover:text-red-500/50"
                          >
                            Wrong
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })}
        </div>
      )}
    </div>
  )
}

function HistoryStat({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#0b0b0b] px-4 py-3">
      <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#555]">{label}</div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-mono text-lg font-black text-[#f5f5f5]">{value}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#555]">{helper}</span>
      </div>
    </div>
  )
}

function MacroStrip({
  protein,
  carbs,
  fat,
}: {
  protein: number
  carbs: number
  fat: number
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#444]">Protein</span>
        <span className="text-xs font-bold text-[#00ff88]">{protein.toFixed(1)}<span className="ml-0.5 text-[10px] text-[#00ff88]/50">g</span></span>
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#444]">Carbs</span>
        <span className="text-xs font-bold text-[#38bdf8]">{carbs.toFixed(1)}<span className="ml-0.5 text-[10px] text-[#38bdf8]/50">g</span></span>
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#444]">Fat</span>
        <span className="text-xs font-bold text-[#ff6b35]">{fat.toFixed(1)}<span className="ml-0.5 text-[10px] text-[#ff6b35]/50">g</span></span>
      </div>
    </div>
  )
}
