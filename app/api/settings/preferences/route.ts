import { Prisma } from '@/app/generated/prisma/client'
import { NextResponse } from 'next/server'

import { requireAppUser } from '@/lib/api/current-app-user'
import prisma from '@/lib/prisma'
import { updatePreferencesSchema } from '@/lib/validations/nutrition'

function isMissingAiModelColumn(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2022' &&
    typeof error.meta?.column === 'string' &&
    error.meta.column.includes('aiModel')
  )
}

export async function GET() {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: result.user.id },
      select: {
        unitSystem: true,
        aiModel: true,
      },
    })

    return NextResponse.json({
      preferences: {
        unitSystem: profile?.unitSystem ?? 'metric',
        aiModel: profile?.aiModel ?? 'gemini-2.5-flash-lite',
      },
    })
  } catch (error) {
    if (!isMissingAiModelColumn(error)) {
      throw error
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: result.user.id },
      select: {
        unitSystem: true,
      },
    })

    return NextResponse.json({
      preferences: {
        unitSystem: profile?.unitSystem ?? 'metric',
        aiModel: 'gemini-2.5-flash-lite',
        aiModelPersistencePendingMigration: true,
      },
    })
  }
}

export async function PUT(request: Request) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const json = await request.json()
  const parsed = updatePreferencesSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const profile = await prisma.userProfile.upsert({
      where: { userId: result.user.id },
      update: {
        ...(parsed.data.unitSystem ? { unitSystem: parsed.data.unitSystem } : {}),
        ...(parsed.data.aiModel ? { aiModel: parsed.data.aiModel } : {}),
      },
      create: {
        userId: result.user.id,
        unitSystem: parsed.data.unitSystem ?? 'metric',
        aiModel: parsed.data.aiModel ?? 'gemini-2.5-flash-lite',
      },
      select: {
        unitSystem: true,
        aiModel: true,
      },
    })

    return NextResponse.json({ preferences: profile })
  } catch (error) {
    if (!isMissingAiModelColumn(error)) {
      throw error
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId: result.user.id },
      update: {
        ...(parsed.data.unitSystem ? { unitSystem: parsed.data.unitSystem } : {}),
      },
      create: {
        userId: result.user.id,
        unitSystem: parsed.data.unitSystem ?? 'metric',
      },
      select: {
        unitSystem: true,
      },
    })

    return NextResponse.json({
      preferences: {
        unitSystem: profile.unitSystem,
        aiModel: parsed.data.aiModel ?? 'gemini-2.5-flash-lite',
        aiModelPersistencePendingMigration: true,
      },
    })
  }
}
