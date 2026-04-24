import { NextResponse } from 'next/server'

import { requireAppUser } from '@/lib/api/current-app-user'
import { mealService } from '@/lib/services/meal-service'
import { updateMealAiFeedbackSchema } from '@/lib/validations/nutrition'

type MealRouteContext = {
  params: Promise<{
    mealId: string
  }>
}

export async function PATCH(request: Request, context: MealRouteContext) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const { mealId } = await context.params
  const json = await request.json()
  const parsed = updateMealAiFeedbackSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    await mealService.updateMealFeedback(
      mealId,
      result.user.id,
      parsed.data.aiFeedback
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Meal not found') {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
