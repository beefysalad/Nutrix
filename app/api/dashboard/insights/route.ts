import { NextResponse } from 'next/server'

import { requireAppUser } from '@/lib/api/current-app-user'
import prisma from '@/lib/prisma'

export async function GET() {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const start = new Date()
  start.setDate(start.getDate() - 6)
  start.setHours(0, 0, 0, 0)

  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  const [meals, activeGoal, todayMeals] = await Promise.all([
    prisma.mealEntry.findMany({
      where: {
        userId: result.user.id,
        loggedAt: {
          gte: start,
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        loggedAt: 'desc',
      },
    }),
    prisma.goal.findFirst({
      where: {
        userId: result.user.id,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        dailyCalories: true,
      },
    }),
    prisma.mealEntry.findMany({
      where: {
        userId: result.user.id,
        loggedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        items: true,
      },
    }),
  ])

  if (meals.length === 0) {
    return NextResponse.json({
      hasData: false,
      insight: null,
    })
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

  return NextResponse.json({
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
  })
}
