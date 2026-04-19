import { AiMealFeedback, EntrySource, MealType, Prisma } from '@/app/generated/prisma/client'
import { requireAppUser } from '@/lib/api/current-app-user'
import prisma from '@/lib/prisma'
import { createMealSchema } from '@/lib/validations/nutrition'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const { user } = result
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 100)
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  const meals = await prisma.mealEntry.findMany({
    where: {
      userId: user.id,
      loggedAt: {
        gte: dateFrom ? new Date(dateFrom) : undefined,
        lte: dateTo ? new Date(dateTo) : undefined,
      },
    },
    orderBy: {
      loggedAt: 'desc',
    },
    take: Number.isNaN(limit) ? 50 : limit,
    include: {
      items: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  return NextResponse.json({ meals })
}

export async function POST(request: Request) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const { user } = result
  const json = await request.json()
  const parsed = createMealSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const mealData: Prisma.MealEntryUncheckedCreateInput = {
    userId: user.id,
    loggedAt: parsed.data.loggedAt ? new Date(parsed.data.loggedAt) : new Date(),
    mealType: parsed.data.mealType as MealType,
    source: parsed.data.source as EntrySource,
    aiFeedback: (parsed.data.aiFeedback as AiMealFeedback | undefined) ?? null,
    notes: parsed.data.notes,
  }

  const meal = await prisma.mealEntry.create({
    data: {
      ...mealData,
      items: {
        create: parsed.data.items.map((item) => ({
          foodId: item.foodId,
          foodNameSnapshot: item.foodName,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          proteinGrams: item.proteinGrams,
          carbsGrams: item.carbsGrams,
          fatGrams: item.fatGrams,
        })),
      },
    },
    include: {
      items: true,
    },
  })

  return NextResponse.json({ meal }, { status: 201 })
}
