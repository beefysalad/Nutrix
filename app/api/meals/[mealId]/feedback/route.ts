import { NextResponse } from 'next/server'

import { AiMealFeedback, Prisma } from '@/app/generated/prisma/client'
import { requireAppUser } from '@/lib/api/current-app-user'
import prisma from '@/lib/prisma'
import { updateMealAiFeedbackSchema } from '@/lib/validations/nutrition'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ mealId: string }> },
) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const { mealId } = await params
  const json = await request.json()
  const parsed = updateMealAiFeedbackSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const meal = await prisma.mealEntry.findFirst({
    where: {
      id: mealId,
      userId: result.user.id,
    },
  })

  if (!meal) {
    return NextResponse.json({ error: 'Meal not found' }, { status: 404 })
  }

  if (meal.source !== 'ai' && meal.source !== 'telegram') {
    return NextResponse.json(
      { error: 'Feedback is only available for AI-generated meals' },
      { status: 400 },
    )
  }

  const updateData: Prisma.MealEntryUncheckedUpdateInput = {
    aiFeedback: (parsed.data.aiFeedback as AiMealFeedback | null) ?? null,
  }

  const updatedMeal = await prisma.mealEntry.update({
    where: { id: mealId },
    data: updateData,
  })

  return NextResponse.json({ meal: updatedMeal })
}
