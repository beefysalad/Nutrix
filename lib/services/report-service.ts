import { reportRepository } from '@/lib/repositories/report-repository'
import { mealRepository } from '@/lib/repositories/meal-repository'

function getDayRange(dateString: string) {
  const start = new Date(`${dateString}T00:00:00.000Z`)
  const end = new Date(`${dateString}T23:59:59.999Z`)
  return { start, end }
}

export const reportService = {
  async getDailyReport(userId: string, date: string) {
    const { start, end } = getDayRange(date)

    const [report, meals] = await Promise.all([
      reportRepository.findDailyReport(userId, start, end),
      mealRepository.findMany(userId, 100, start, end),
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

    return {
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
    }
  },

  async upsertDailyReport(userId: string, date: string, data: { rating: number; note?: string | null }) {
    const { start, end } = getDayRange(date)
    const existing = await reportRepository.findDailyReport(userId, start, end)

    const reportData = {
      rating: data.rating,
      note: data.note || null,
    }

    const report = existing
      ? await reportRepository.updateDailyReport(existing.id, reportData)
      : await reportRepository.createDailyReport(userId, start, reportData)

    return {
      id: report.id,
      reportDate: report.reportDate.toISOString(),
      rating: report.rating,
      note: report.note,
    }
  },
}
