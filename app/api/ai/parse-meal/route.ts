import { NextResponse } from 'next/server'

import { requireAppUser } from '@/lib/api/current-app-user'
import { mealAiService } from '@/lib/services/meal-ai-service'
import { parseMealSchema } from '@/lib/validations/nutrition'

export async function POST(request: Request) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const json = await request.json()
  const parsed = parseMealSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const response = await mealAiService.parseMealForUser({
      userId: result.user.id,
      text: parsed.data.text,
      mealType: parsed.data.mealType,
    })

    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gemini request failed'
    const status = message.includes('not configured') ? 503 : 502

    return NextResponse.json({ error: 'Gemini request failed', details: message }, { status })
  }
}
