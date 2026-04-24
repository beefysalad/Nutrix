import { mealRepository } from '@/lib/repositories/meal-repository'
import { goalRepository } from '@/lib/repositories/goal-repository'

export const dashboardService = {
  async getSummary(userId: string, onBoarded: boolean) {
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    const [activeGoal, todayMeals, totalMealHistoryCount, recentMeals] = await Promise.all([
      goalRepository.findActiveGoal(userId),
      mealRepository.findMany(userId, 100, startOfDay, endOfDay),
      mealRepository.count(userId),
      mealRepository.findMany(userId, 5),
    ])

    const totals = todayMeals.reduce(
      (acc, meal) => {
        for (const item of meal.items) {
          acc.calories += item.calories
          acc.proteinGrams += Number(item.proteinGrams ?? 0)
          acc.carbsGrams += Number(item.carbsGrams ?? 0)
          acc.fatGrams += Number(item.fatGrams ?? 0)
        }

        return acc
      },
      {
        calories: 0,
        proteinGrams: 0,
        carbsGrams: 0,
        fatGrams: 0,
        mealCount: todayMeals.length,
      },
    )

    return {
      onBoarded,
      date: startOfDay.toISOString(),
      hasAnyMealHistory: totalMealHistoryCount > 0,
      goal: activeGoal,
      totals,
      remainingCalories:
        activeGoal?.dailyCalories != null
          ? activeGoal.dailyCalories - totals.calories
          : null,
      meals: todayMeals,
      recentMeals,
    }
  },

  async getTrends(userId: string, days: number) {
    const start = new Date()
    start.setDate(start.getDate() - (days - 1))
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    const [goal, meals] = await Promise.all([
      goalRepository.findActiveGoal(userId),
      mealRepository.findMany(userId, 200, start, end),
    ])

    interface TrendPoint {
      date: string
      label: string
      calories: number
      protein: number
      carbs: number
      fat: number
    }

    const byDay = new Map<string, TrendPoint>()

    for (let offset = 0; offset < days; offset += 1) {
      const date = new Date(start)
      date.setDate(start.getDate() + offset)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const key = `${year}-${month}-${day}`

      byDay.set(key, {
        date: key,
        label: new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
        }).format(date),
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      })
    }

    for (const meal of meals) {
      const date = meal.loggedAt
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const key = `${year}-${month}-${day}`

      const bucket = byDay.get(key)
      if (bucket) {
        for (const item of meal.items) {
          bucket.calories += item.calories
          bucket.protein += Number(item.proteinGrams ?? 0)
          bucket.carbs += Number(item.carbsGrams ?? 0)
          bucket.fat += Number(item.fatGrams ?? 0)
        }
      }
    }

    return {
      days,
      goalCalories: goal?.dailyCalories ?? null,
      points: Array.from(byDay.values()),
    }
  },

  async getInsights(userId: string) {
    const start = new Date()
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)

    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    const [meals, activeGoal, todayMeals] = await Promise.all([
      mealRepository.findMany(userId, 200, start),
      goalRepository.findActiveGoal(userId),
      mealRepository.findMany(userId, 100, startOfDay, endOfDay),
    ])

    if (meals.length === 0) {
      return {
        hasData: false,
        insight: null,
      }
    }

    const mealTypeCounts = meals.reduce<Record<string, number>>((accumulator, meal) => {
      accumulator[meal.mealType] = (accumulator[meal.mealType] ?? 0) + 1
      return accumulator
    }, {})

    const foodCounts = new Map<string, { count: number; calories: number }>()
    const daysLogged = new Set(meals.map((meal) => meal.loggedAt.toISOString().slice(0, 10))).size
    const totalCalories = meals.reduce(
      (sum, meal) => sum + meal.items.reduce((itemSum, item) => itemSum + item.calories, 0),
      0,
    )
    const totalProtein = meals.reduce(
      (sum, meal) =>
        sum + meal.items.reduce((itemSum, item) => itemSum + Number(item.proteinGrams ?? 0), 0),
      0,
    )
    const totalCarbs = meals.reduce(
      (sum, meal) =>
        sum + meal.items.reduce((itemSum, item) => itemSum + Number(item.carbsGrams ?? 0), 0),
      0,
    )
    const totalFat = meals.reduce(
      (sum, meal) =>
        sum + meal.items.reduce((itemSum, item) => itemSum + Number(item.fatGrams ?? 0), 0),
      0,
    )
    const mostCommonMealType = Object.entries(mealTypeCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? null
    const averageCalories = Math.round(totalCalories / meals.length)
    const todayCalories = todayMeals.reduce(
      (sum, meal) => sum + meal.items.reduce((itemSum, item) => itemSum + item.calories, 0),
      0,
    )
    const averageProteinPerMeal = totalProtein / meals.length
    const averageCarbsPerMeal = totalCarbs / meals.length
    const averageFatPerMeal = totalFat / meals.length
    const proteinCalories = totalProtein * 4
    const carbsCalories = totalCarbs * 4
    const fatCalories = totalFat * 9
    const macroCalories = proteinCalories + carbsCalories + fatCalories

    for (const meal of meals) {
      for (const item of meal.items) {
        const key = item.foodNameSnapshot.trim().toLowerCase()
        const existing = foodCounts.get(key) ?? { count: 0, calories: 0 }
        existing.count += 1
        existing.calories += item.calories
        foodCounts.set(key, existing)
      }
    }

    const topFoods = Array.from(foodCounts.entries())
      .sort((left, right) => right[1].count - left[1].count || right[1].calories - left[1].calories)
      .slice(0, 3)
      .map(([food, stats]) => ({
        name: food
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        count: stats.count,
      }))

    const insightCards: string[] = []

    if (averageProteinPerMeal < 25) {
      insightCards.push(
        `Your meals are averaging only ${Math.round(averageProteinPerMeal)}g of protein, so adding a clearer protein anchor could improve fullness and recovery.`,
      )
    } else {
      insightCards.push(
        `Your meal logging shows a solid protein baseline at about ${Math.round(averageProteinPerMeal)}g per meal.`,
      )
    }

    if (macroCalories > 0) {
      const carbShare = Math.round((carbsCalories / macroCalories) * 100)
      const fatShare = Math.round((fatCalories / macroCalories) * 100)

      if (carbShare >= 45) {
        insightCards.push(
          `A large share of your logged energy is coming from carbs at about ${carbShare}%, so pairing carb-heavy meals with more protein or fiber could smooth your intake.`,
        )
      } else if (fatShare >= 40) {
        insightCards.push(
          `Fat is making up around ${fatShare}% of your logged calories, which may be worth watching if you're trying to stay tighter to a calorie target.`,
        )
      } else {
        insightCards.push(
          `Your logged macro split looks fairly balanced right now, without one macro dominating the week.`,
        )
      }
    }

    if (activeGoal?.dailyCalories != null) {
      const averageDailyCalories = Math.round(totalCalories / daysLogged)
      const goalGap = activeGoal.dailyCalories - averageDailyCalories

      if (Math.abs(goalGap) <= 150) {
        insightCards.push(
          `Across your logged days, your average intake is sitting close to your calorie goal, which suggests your current routine is reasonably aligned.`,
        )
      } else if (goalGap > 0) {
        insightCards.push(
          `Across your logged days, you are averaging about ${goalGap} calories below goal, which may mean your intake is lighter than intended.`,
        )
      } else {
        insightCards.push(
          `Across your logged days, you are averaging about ${Math.abs(goalGap)} calories above goal, so your usual meals may be overshooting your target.`,
        )
      }
    } else {
      insightCards.push('Set a calorie goal to unlock tighter calorie-based insights from your actual intake patterns.')
    }

    const primaryInsight = insightCards[0] ?? 'Keep logging meals to unlock more precise nutrition guidance.'
    const secondaryInsight = insightCards[1] ?? null
    const actionInsight = insightCards[2] ?? null

    return {
      hasData: true,
      insight: {
        daysLogged,
        mealCount: meals.length,
        mostCommonMealType,
        averageCalories,
        remainingCalories:
          activeGoal?.dailyCalories != null
            ? activeGoal.dailyCalories - todayCalories
            : null,
        averageProteinPerMeal: Math.round(averageProteinPerMeal),
        averageCarbsPerMeal: Math.round(averageCarbsPerMeal),
        averageFatPerMeal: Math.round(averageFatPerMeal),
        topFoods,
        primaryInsight,
        secondaryInsight,
        actionInsight,
      },
    }
  },
}
