import { NextResponse } from 'next/server'

import { requireAppUser } from '@/lib/api/current-app-user'
import { mealService } from '@/lib/services/meal-service'
import { createMealSchema } from '@/lib/validations/nutrition'

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

  const meals = await mealService.getMealsForUser(
    user.id,
    Number.isNaN(limit) ? 50 : limit,
    dateFrom,
    dateTo
  )

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

  const meal = await mealService.createMeal(user.id, parsed.data)

  return NextResponse.json({ meal }, { status: 201 })
}
