import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAppUser } from '@/lib/api/current-app-user'
import { mealAiService } from '@/lib/services/meal-ai-service'

const suggestionStyleSchema = z.enum(['quick', 'lutong-bahay', 'budget', 'high-protein']).optional()

export async function GET(request: Request) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  try {
    const url = new URL(request.url)
    const suggestionStyle = suggestionStyleSchema.parse(
      url.searchParams.get('style') ?? undefined,
    )

    const response = await mealAiService.getMealSuggestionsForUser({
      userId: result.user.id,
      suggestionStyle,
    })

    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load suggestion state'
    const status = 500

    return NextResponse.json(
      { error: 'Unable to load suggestion state', details: message },
      { status },
    )
  }
}

export async function POST(request: Request) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  try {
    const json = (await request.json().catch(() => ({}))) as { style?: string }
    const suggestionStyle = suggestionStyleSchema.parse(json.style)

    const response = await mealAiService.generateMealSuggestionsForUser({
      userId: result.user.id,
      suggestionStyle,
    })

    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate suggestions'
    const status =
      message === 'Daily smart suggestion limit reached'
        ? 429
        : 500

    return NextResponse.json(
      { error: 'Unable to generate suggestions', details: message },
      { status },
    )
  }
}
