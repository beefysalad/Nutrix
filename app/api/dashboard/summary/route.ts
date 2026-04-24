import { requireAppUser } from '@/lib/api/current-app-user'
import { dashboardService } from '@/lib/services/dashboard-service'
import { NextResponse } from 'next/server'

export async function GET() {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const { user } = result
  const summary = await dashboardService.getSummary(user.id, user.onBoarded)

  return NextResponse.json(summary)
}
