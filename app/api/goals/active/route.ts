import { NextResponse } from 'next/server'

import { requireAppUser } from '@/lib/api/current-app-user'
import { goalService } from '@/lib/services/goal-service'
import { upsertGoalSchema } from '@/lib/validations/nutrition'

export async function GET() {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const data = await goalService.getActiveGoalAndProfile(result.user.id)

  return NextResponse.json(data)
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

  const goal = await goalService.upsertActiveGoal(result.user.id, parsed.data)

  return NextResponse.json({ goal })
}
