import { NextResponse } from 'next/server'

import { requireAppUser } from '@/lib/api/current-app-user'
import prisma from '@/lib/prisma'

const TREND_RANGE_DAYS = 7

function toLocalIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getRangeStart(days: number) {
  const start = new Date()
  start.setDate(start.getDate() - (days - 1))
  start.setHours(0, 0, 0, 0)
  return start
}

export async function GET(request: Request) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const searchParams = new URL(request.url).searchParams
  const days = Number(searchParams.get('days') ?? '7')

  if (days !== TREND_RANGE_DAYS) {
    return NextResponse.json({ error: 'days must be 7' }, { status: 400 })
  }

  const start = getRangeStart(days)
  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const [goal, meals] = await Promise.all([
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
          gte: start,
          lte: end,
        },
      },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: {
        loggedAt: 'asc',
      },
    }),
  ])

  const byDay = new Map<
    string,
    {
      date: string
      label: string
      calories: number
      protein: number
      carbs: number
      fat: number
    }
  >()

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(start)
    date.setDate(start.getDate() + offset)
    const key = toLocalIsoDate(date)
    byDay.set(key, {
      date: key,
      label: new Intl.DateTimeFormat('en-US', {
        month: days <= 14 ? undefined : 'short',
        day: days <= 14 ? undefined : 'numeric',
        weekday: days <= 14 ? 'short' : undefined,
      }).format(date),
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    })
  }

  for (const meal of meals) {
    const key = toLocalIsoDate(meal.loggedAt)
    const bucket = byDay.get(key)

    if (!bucket) {
      continue
    }

    for (const item of meal.items) {
      bucket.calories += item.calories
      bucket.protein += Number(item.proteinGrams ?? 0)
      bucket.carbs += Number(item.carbsGrams ?? 0)
      bucket.fat += Number(item.fatGrams ?? 0)
    }
  }

  return NextResponse.json({
    days,
    goalCalories: goal?.dailyCalories ?? null,
    points: Array.from(byDay.values()),
  })
}
