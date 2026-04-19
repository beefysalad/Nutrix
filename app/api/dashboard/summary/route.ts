import { requireAppUser } from '@/lib/api/current-app-user'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const { user } = result
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  const [activeGoal, todayMeals] = await Promise.all([
    prisma.goal.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.mealEntry.findMany({
      where: {
        userId: user.id,
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

  return NextResponse.json({
    date: startOfDay.toISOString(),
    goal: activeGoal,
    totals,
    remainingCalories:
      activeGoal?.dailyCalories != null
        ? activeGoal.dailyCalories - totals.calories
        : null,
    meals: todayMeals,
  })
}
