import { NextResponse } from 'next/server'

import { requireAppUser } from '@/lib/api/current-app-user'
import { mealAiService } from '@/lib/services/meal-ai-service'

type SaveSuggestionRouteProps = {
  params: Promise<{
    suggestionId: string
  }>
}

export async function POST(request: Request, { params }: SaveSuggestionRouteProps) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  try {
    const { suggestionId } = await params
    const json = (await request.json().catch(() => ({}))) as {
      isSaved?: boolean
    }

    const response = await mealAiService.saveMealSuggestionForUser({
      userId: result.user.id,
      suggestionId,
      isSaved: json.isSaved,
    })

    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save suggestion'
    const status = message === 'Suggestion not found' ? 404 : 500

    return NextResponse.json(
      { error: 'Unable to save suggestion', details: message },
      { status },
    )
  }
}
