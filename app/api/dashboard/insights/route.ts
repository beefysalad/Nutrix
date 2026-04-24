import { requireAppUser } from '@/lib/api/current-app-user'
import { dashboardService } from '@/lib/services/dashboard-service'
import { NextResponse } from 'next/server'

export async function GET() {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const insights = await dashboardService.getInsights(result.user.id)

  return NextResponse.json(insights)
}
