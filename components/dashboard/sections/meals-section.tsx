'use client'

import { Bot, Filter, Loader2, Search, Trash2, Clock } from 'lucide-react'
import { useMemo, useState } from 'react'
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

export function MealsSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
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

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search meals..."
            className="w-full rounded-2xl border border-white/10 bg-[#141414] py-3 pl-11 pr-4 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
          />
        </div>
        <div className="flex justify-end">
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#141414] px-3 py-3 text-right font-mono text-sm text-[#888] outline-none focus:border-[#e4ff00] sm:max-w-[152px] sm:px-4 sm:text-base"
          />
        </div>
      </div>

      <SectionCard className="overflow-hidden p-0">
        <div className="p-4 sm:p-6">
          {mealsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
            </div>
          ) : filteredMeals.length === 0 ? (
            <EmptyState
              title="No meal entries for this filter yet"
              description="Try another date, or log a meal and it will show up here with its foods and macros."
            />
          ) : (
            <div className="space-y-4">
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
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#141414] transition-all hover:border-white/20"
                  >
                    <div className="border-b border-white/[0.05] bg-[#1a1a1a]/50 px-4 py-4 sm:px-5">
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

                    <div className="space-y-3 px-4 py-4 sm:px-5">
                      {meal.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-4 text-sm"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="block break-words font-medium leading-snug text-[#f5f5f5]">
                              {item.foodNameSnapshot}
                            </span>
                            <span className="mt-1 block break-words text-[11px] leading-snug text-[#555]">
                              {item.quantity ? `${item.quantity} ` : ''}
                              {item.unit ? `${item.unit}` : ''}
                            </span>
                          </div>
                          <div className="shrink-0 font-mono text-xs font-bold text-[#888]">
                            {item.calories}
                          </div>
                        </div>
                      ))}
                      {meal.notes ? (
                        <div className="mt-2 rounded-xl border border-dashed border-white/5 bg-white/[0.02] p-3 text-xs italic text-[#666]">
                          {meal.notes}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-3 border-t border-white/[0.05] bg-[#1a1a1a]/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
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
                          className="text-[#333] transition-colors hover:text-red-500/80"
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
      </SectionCard>
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
