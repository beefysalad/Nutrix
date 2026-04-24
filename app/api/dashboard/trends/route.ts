import { requireAppUser } from '@/lib/api/current-app-user'
import { dashboardService } from '@/lib/services/dashboard-service'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const searchParams = new URL(request.url).searchParams
  const days = Number(searchParams.get('days') ?? '7')

  if (days !== 7) {
    return NextResponse.json({ error: 'days must be 7' }, { status: 400 })
  }

  const trends = await dashboardService.getTrends(result.user.id, days)

  return NextResponse.json(trends)
}
