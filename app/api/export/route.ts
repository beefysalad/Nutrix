import { NextResponse } from 'next/server'
import { requireAppUser } from '@/lib/api/current-app-user'
import { dataExportService } from '@/lib/services/data-export-service'

type ExportFormat = 'csv' | 'json'

function normalizeFormat(value: string | null): ExportFormat | null {
  if (value === 'csv' || value === 'json') {
    return value
  }
  return null
}

function formatDateStamp(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatReadableDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function toNumber(value: unknown) {
  if (value == null) {
    return null
  }
  return Number(value)
}

function csvCell(value: unknown) {
  const stringValue = value == null ? '' : String(value)
  const escaped = stringValue.replace(/"/g, '""')
  return `"${escaped}"`
}

function buildMealsCsv(input: {
  meals: Array<{
    loggedAt: Date
    mealType: string
    items: Array<{
      foodNameSnapshot: string
      quantity: unknown
      unit: string | null
      calories: number
      proteinGrams: unknown
      carbsGrams: unknown
      fatGrams: unknown
    }>
  }>
}) {
  const header = [
    'Logged at',
    'Meal type',
    'Food name',
    'Quantity',
    'Unit',
    'Calories',
    'Protein (g)',
    'Carbs (g)',
    'Fat (g)',
  ]

  const rows = input.meals.flatMap((meal) =>
    meal.items.map((item) =>
      [
        formatReadableDate(meal.loggedAt),
        meal.mealType,
        item.foodNameSnapshot,
        toNumber(item.quantity) ?? '',
        item.unit ?? '',
        item.calories,
        toNumber(item.proteinGrams) ?? '',
        toNumber(item.carbsGrams) ?? '',
        toNumber(item.fatGrams) ?? '',
      ]
        .map(csvCell)
        .join(','),
    ),
  )

  return [header.map(csvCell).join(','), ...rows].join('\n')
}

export async function GET(request: Request) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const format = normalizeFormat(new URL(request.url).searchParams.get('format'))

  if (!format) {
    return NextResponse.json({ error: 'format must be csv or json' }, { status: 400 })
  }

  const {
    user,
    profile,
    goals,
    dailyReports,
    integrationConnections,
    meals,
  } = await dataExportService.getExportData(result.user.id)

  const stamp = formatDateStamp(new Date())

  if (format === 'csv') {
    const csv = buildMealsCsv({ meals })

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="nutrix-meals-${stamp}.csv"`,
      },
    })
  }

  const archive = {
    exportedAt: new Date().toISOString(),
    user: user
      ? {
          id: user.id,
          clerkId: user.clerkId,
          name: user.name,
          email: user.email,
          image: user.image,
          onBoarded: user.onBoarded,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        }
      : null,
    profile: profile
      ? {
          ...profile,
          weightKg: toNumber(profile.weightKg),
          createdAt: profile.createdAt.toISOString(),
          updatedAt: profile.updatedAt.toISOString(),
        }
      : null,
    goals: goals.map((goal) => ({
      ...goal,
      startsAt: goal.startsAt?.toISOString() ?? null,
      endsAt: goal.endsAt?.toISOString() ?? null,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    })),
    dailyReports: dailyReports.map((report) => ({
      ...report,
      reportDate: report.reportDate.toISOString(),
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    })),
    integrationConnections: integrationConnections.map((connection) => ({
      ...connection,
      connectedAt: connection.connectedAt?.toISOString() ?? null,
      createdAt: connection.createdAt.toISOString(),
      updatedAt: connection.updatedAt.toISOString(),
    })),
    meals: meals.map((meal) => ({
      ...meal,
      loggedAt: meal.loggedAt.toISOString(),
      createdAt: meal.createdAt.toISOString(),
      updatedAt: meal.updatedAt.toISOString(),
      items: meal.items.map((item) => ({
        ...item,
        quantity: toNumber(item.quantity),
        proteinGrams: toNumber(item.proteinGrams),
        carbsGrams: toNumber(item.carbsGrams),
        fatGrams: toNumber(item.fatGrams),
        createdAt: item.createdAt.toISOString(),
      })),
    })),
  }

  return new Response(JSON.stringify(archive, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="nutrix-export-${stamp}.json"`,
    },
  })
}
