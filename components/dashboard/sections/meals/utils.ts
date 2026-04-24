import { type MealResponse } from '@/lib/hooks/use-dashboard-api'

export function formatDayHeader(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${iso}T00:00:00`))
}

export function toLocalIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function shiftIsoDate(iso: string, dayDelta: number) {
  const date = new Date(`${iso}T00:00:00`)
  date.setDate(date.getDate() + dayDelta)
  return toLocalIsoDate(date)
}

export function formatTime(loggedAt: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(loggedAt))
}

export function mealTotals(meals: MealResponse[]) {
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

export function mealCalories(meal: MealResponse) {
  return meal.items.reduce((s, i) => s + i.calories, 0)
}

export function mealMacroTotals(meal: MealResponse) {
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
