import { NextResponse } from 'next/server'

import { requireAppUser } from '@/lib/api/current-app-user'
import { preferenceService } from '@/lib/services/preference-service'
import { updatePreferencesSchema } from '@/lib/validations/nutrition'

export async function GET() {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const preferences = await preferenceService.getPreferences(result.user.id)

  return NextResponse.json({ preferences })
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

  const preferences = await preferenceService.updatePreferences(result.user.id, parsed.data)

  return NextResponse.json({ preferences })
}
