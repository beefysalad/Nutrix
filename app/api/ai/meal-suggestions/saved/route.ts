import { NextResponse } from 'next/server'

import { requireAppUser } from '@/lib/api/current-app-user'
import { mealAiService } from '@/lib/services/meal-ai-service'

export async function GET() {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  try {
    const response = await mealAiService.getSavedMealSuggestionsForUser({
      userId: result.user.id,
    })

    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load saved suggestions'

    return NextResponse.json(
      { error: 'Unable to load saved suggestions', details: message },
      { status: 500 },
    )
  }
}
