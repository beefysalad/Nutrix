import { GoalMode } from '@/app/generated/prisma/client'
import { requireAppUser } from '@/lib/api/current-app-user'
import prisma from '@/lib/prisma'
import { upsertGoalSchema } from '@/lib/validations/nutrition'
import { NextResponse } from 'next/server'

export async function GET() {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const goal = await prisma.goal.findFirst({
    where: {
      userId: result.user.id,
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json({ goal })
}

export async function PUT(request: Request) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const json = await request.json()
  const parsed = upsertGoalSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { user } = result
  const activeGoal = await prisma.goal.findFirst({
    where: {
      userId: user.id,
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const goal = activeGoal
    ? await prisma.goal.update({
        where: { id: activeGoal.id },
        data: {
          mode: parsed.data.mode as GoalMode,
          dailyCalories: parsed.data.dailyCalories ?? null,
          proteinGrams: parsed.data.proteinGrams ?? null,
          carbsGrams: parsed.data.carbsGrams ?? null,
          fatGrams: parsed.data.fatGrams ?? null,
          startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
          endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
          isActive: true,
        },
      })
    : await prisma.goal.create({
        data: {
          userId: user.id,
          mode: parsed.data.mode as GoalMode,
          dailyCalories: parsed.data.dailyCalories ?? null,
          proteinGrams: parsed.data.proteinGrams ?? null,
          carbsGrams: parsed.data.carbsGrams ?? null,
          fatGrams: parsed.data.fatGrams ?? null,
          startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
          endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
          isActive: true,
        },
      })

  return NextResponse.json({ goal })
}
