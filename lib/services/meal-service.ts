import { type AiMealFeedback, type EntrySource, type MealType } from '@/app/generated/prisma/client'
import { mealRepository } from '@/lib/repositories/meal-repository'

export const mealService = {
  async getMealsForUser(userId: string, limit: number, dateFrom?: string | null, dateTo?: string | null) {
    const parsedDateFrom = dateFrom ? new Date(dateFrom) : undefined
    const parsedDateTo = dateTo ? new Date(dateTo) : undefined

    return mealRepository.findMany(userId, limit, parsedDateFrom, parsedDateTo)
  },

  async createMeal(userId: string, data: {
    loggedAt?: string
    mealType: string
    source: string
    aiFeedback?: string | null
    notes?: string | null
    items: Array<{
      foodId?: string
      foodName: string
      quantity?: number | null
      unit?: string | null
      calories: number
      proteinGrams?: number | null
      carbsGrams?: number | null
      fatGrams?: number | null
    }>
  }) {
    return mealRepository.create(userId, {
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
      mealType: data.mealType as MealType,
      source: data.source as EntrySource,
      aiFeedback: (data.aiFeedback as AiMealFeedback) ?? null,
      notes: data.notes,
      items: data.items,
    })
  },

  async deleteMeal(mealId: string, userId: string) {
    const meal = await mealRepository.findByIdAndUserId(mealId, userId)

    if (!meal) {
      throw new Error('Meal not found')
    }

    return mealRepository.delete(meal.id)
  },

  async updateMealFeedback(mealId: string, userId: string, aiFeedback: string | null) {
    const meal = await mealRepository.findByIdAndUserId(mealId, userId)

    if (!meal) {
      throw new Error('Meal not found')
    }

    return mealRepository.updateFeedback(meal.id, aiFeedback as AiMealFeedback | null)
  },
}
