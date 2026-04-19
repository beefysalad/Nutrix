import { NextResponse } from 'next/server'

import { requireAppUser } from '@/lib/api/current-app-user'
import prisma from '@/lib/prisma'

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

  const meal = await prisma.mealEntry.findFirst({
    where: {
      id: mealId,
      userId: result.user.id,
    },
    select: {
      id: true,
    },
  })

  if (!meal) {
    return NextResponse.json({ error: 'Meal not found' }, { status: 404 })
  }

  await prisma.mealEntry.delete({
    where: {
      id: meal.id,
    },
  })

  return NextResponse.json({ success: true })
}
