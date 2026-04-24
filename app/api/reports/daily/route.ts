import { NextResponse } from 'next/server'
import { requireAppUser } from '@/lib/api/current-app-user'
import { reportService } from '@/lib/services/report-service'
import { dailyReportFormSchema } from '@/lib/validations/dashboard-forms'

export async function GET(request: Request) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'date is required' }, { status: 400 })
  }

  const data = await reportService.getDailyReport(result.user.id, date)

  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'date is required' }, { status: 400 })
  }

  const json = await request.json()
  const parsed = dailyReportFormSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const report = await reportService.upsertDailyReport(result.user.id, date, parsed.data)

  return NextResponse.json({ report })
}
