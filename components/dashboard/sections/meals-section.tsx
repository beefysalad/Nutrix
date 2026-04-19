'use client'

import { Filter, Loader2, Search, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { EmptyState, SectionCard } from '@/components/dashboard/ui'
import {
  getApiErrorMessage,
  useMealsQuery,
  useUpdateMealAiFeedbackMutation,
} from '@/lib/hooks/use-dashboard-api'

export function MealsSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const mealsQuery = useMealsQuery({
    limit: 100,
  })
  const updateFeedbackMutation = useUpdateMealAiFeedbackMutation()

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
        <div className="flex gap-3">
          <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 text-[#888] lg:flex-none">
            <Filter className="h-4 w-4" />
            Showing {filteredMeals.length}
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="flex-1 w-full rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 font-mono text-[#888] outline-none focus:border-[#e4ff00] lg:flex-none lg:w-auto"
          />
        </div>
      </div>

      <SectionCard className="overflow-hidden p-0">
        <div className="p-6">
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
                    className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full border border-[#e4ff00]/30 bg-[#e4ff00]/10 px-3 py-1 text-xs uppercase tracking-wide text-[#e4ff00]">
                            {meal.mealType}
                          </div>
                          {(meal.source === 'ai' || meal.source === 'telegram') ? (
                            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#141414] px-3 py-1 text-[11px] uppercase tracking-wide text-[#cfcfcf]">
                              <Sparkles className="h-3.5 w-3.5 text-[#e4ff00]" />
                              AI Generated
                            </div>
                          ) : null}
                          <div className="text-xs uppercase tracking-wide text-[#666]">
                            {new Intl.DateTimeFormat('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            }).format(new Date(meal.loggedAt))}
                          </div>
                        </div>
                        <div className="text-sm text-[#f5f5f5]">
                          {meal.items.map((item) => item.foodNameSnapshot).join(', ')}
                        </div>
                        {meal.notes ? (
                          <div className="text-sm text-[#777]">{meal.notes}</div>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <MetricPill label="Calories" value={`${calories}`} />
                        <MetricPill label="Protein" value={`${protein.toFixed(1)}g`} />
                        <MetricPill label="Carbs" value={`${carbs.toFixed(1)}g`} />
                        <MetricPill label="Fat" value={`${fat.toFixed(1)}g`} />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                      {meal.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 text-sm"
                        >
                          <div className="text-[#888]">
                            {item.foodNameSnapshot}
                            {item.quantity ? ` • ${item.quantity}` : ''}
                            {item.unit ? ` ${item.unit}` : ''}
                          </div>
                          <div className="font-mono text-[#f5f5f5]">{item.calories} cal</div>
                        </div>
                      ))}
                    </div>

                    {(meal.source === 'ai' || meal.source === 'telegram') && !meal.aiFeedback ? (
                      <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-[#777]">
                          Help me improve AI meal estimates for calories and macros.
                        </div>
                        <div className="flex gap-2">
                          <FeedbackButton
                            label="Accurate"
                            active={meal.aiFeedback === 'accurate'}
                            tone="positive"
                            disabled={updateFeedbackMutation.isPending}
                            onClick={async () => {
                              try {
                                await updateFeedbackMutation.mutateAsync({
                                  mealId: meal.id,
                                  aiFeedback: meal.aiFeedback === 'accurate' ? null : 'accurate',
                                })
                                toast.success('Feedback saved')
                              } catch (error) {
                                toast.error(getApiErrorMessage(error, 'Could not save feedback'))
                              }
                            }}
                          />
                          <FeedbackButton
                            label="Needs work"
                            active={meal.aiFeedback === 'inaccurate'}
                            tone="negative"
                            disabled={updateFeedbackMutation.isPending}
                            onClick={async () => {
                              try {
                                await updateFeedbackMutation.mutateAsync({
                                  mealId: meal.id,
                                  aiFeedback:
                                    meal.aiFeedback === 'inaccurate' ? null : 'inaccurate',
                                })
                                toast.success('Feedback saved')
                              } catch (error) {
                                toast.error(getApiErrorMessage(error, 'Could not save feedback'))
                              }
                            }}
                          />
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

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] px-3 py-2 text-center">
      <div className="text-[11px] uppercase tracking-wide text-[#666]">{label}</div>
      <div className="mt-1 font-mono text-sm text-[#f5f5f5]">{value}</div>
    </div>
  )
}

function FeedbackButton({
  label,
  active,
  tone,
  disabled,
  onClick,
}: {
  label: string
  active: boolean
  tone: 'positive' | 'negative'
  disabled: boolean
  onClick: () => void | Promise<void>
}) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={disabled}
      className={[
        'rounded-full border px-3 py-2 text-xs uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        active
          ? tone === 'positive'
            ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a]'
            : 'border-red-400 bg-red-500/10 text-red-200'
          : tone === 'positive'
            ? 'border-white/10 bg-[#141414] text-[#888] hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]'
            : 'border-white/10 bg-[#141414] text-[#888] hover:border-red-400/50 hover:text-red-200',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
