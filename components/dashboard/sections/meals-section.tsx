'use client'

import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { SectionCard } from '@/components/dashboard/ui'
import {
  useDeleteMealMutation,
  useGoalsQuery,
  getApiErrorMessage,
  useMealsQuery,
  useUpdateMealAiFeedbackMutation,
} from '@/lib/hooks/use-dashboard-api'

import { DayCard } from './meals/day-card'
import { shiftIsoDate, toLocalIsoDate } from './meals/utils'

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
