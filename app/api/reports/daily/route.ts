import { NextResponse } from 'next/server'

import { requireAppUser } from '@/lib/api/current-app-user'
import prisma from '@/lib/prisma'
import { dailyReportFormSchema } from '@/lib/validations/dashboard-forms'

function getDayRange(dateString: string) {
  const start = new Date(`${dateString}T00:00:00.000Z`)
  const end = new Date(`${dateString}T23:59:59.999Z`)

  return { start, end }
}

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

  const { start, end } = getDayRange(date)

  const [report, meals] = await Promise.all([
    prisma.dailyReport.findFirst({
      where: {
        userId: result.user.id,
        reportDate: {
          gte: start,
          lte: end,
        },
      },
    }),
    prisma.mealEntry.findMany({
      where: {
        userId: result.user.id,
        loggedAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: {
        loggedAt: 'asc',
      },
    }),
  ])

  const totals = meals.reduce(
    (acc, meal) => {
      for (const item of meal.items) {
        acc.calories += item.calories
        acc.proteinGrams += Number(item.proteinGrams ?? 0)
        acc.carbsGrams += Number(item.carbsGrams ?? 0)
        acc.fatGrams += Number(item.fatGrams ?? 0)
      }

      return acc
    },
    {
      calories: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
      mealCount: meals.length,
    },
  )

  return NextResponse.json({
    report: report
      ? {
          id: report.id,
          reportDate: report.reportDate.toISOString(),
          rating: report.rating,
          note: report.note,
        }
      : null,
    totals,
    meals,
  })
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

  const { start, end } = getDayRange(date)

  const existing = await prisma.dailyReport.findFirst({
    where: {
      userId: result.user.id,
      reportDate: {
        gte: start,
        lte: end,
      },
    },
  })

  const report = existing
    ? await prisma.dailyReport.update({
        where: { id: existing.id },
        data: {
          rating: parsed.data.rating,
          note: parsed.data.note || null,
        },
      })
    : await prisma.dailyReport.create({
        data: {
          userId: result.user.id,
          reportDate: start,
          rating: parsed.data.rating,
          note: parsed.data.note || null,
        },
      })

  return NextResponse.json({
    report: {
      id: report.id,
      reportDate: report.reportDate.toISOString(),
      rating: report.rating,
      note: report.note,
    },
  })
}
