import { NextRequest, NextResponse } from 'next/server'

import { env } from '@/lib/env'
import { mealAiService } from '@/lib/services/meal-ai-service'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-nutrix-cron-secret')

  if (!env.NUTRIX_CRON_SECRET || secret !== env.NUTRIX_CRON_SECRET) {
    return NextResponse.json({ error: 'Invalid cron secret' }, { status: 401 })
  }

  try {
    const result = await mealAiService.resetDailySuggestionUsage()
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to reset suggestion usage'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
