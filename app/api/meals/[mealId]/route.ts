import { NextResponse } from 'next/server'

import { requireAppUser } from '@/lib/api/current-app-user'
import { mealService } from '@/lib/services/meal-service'

type MealRouteContext = {
  params: Promise<{
    mealId: string
  }>
}

export async function DELETE(_request: Request, context: MealRouteContext) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const { mealId } = await context.params

  try {
    await mealService.deleteMeal(mealId, result.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Meal not found') {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
