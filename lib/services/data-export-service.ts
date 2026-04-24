import { userRepository } from '@/lib/repositories/user-repository'
import { mealRepository } from '@/lib/repositories/meal-repository'
import { goalRepository } from '@/lib/repositories/goal-repository'
import { reportRepository } from '@/lib/repositories/report-repository'
import { integrationRepository } from '@/lib/repositories/integration-repository'

export const dataExportService = {
  async getExportData(userId: string) {
    const [user, profile, goals, dailyReports, integrationConnections, meals] = await Promise.all([
      userRepository.findById(userId),
      userRepository.findProfileByUserId(userId),
      goalRepository.findAllByUser(userId),
      reportRepository.findAllByUser(userId),
      integrationRepository.findAllByUser(userId),
      mealRepository.findAllByUser(userId),
    ])

    return {
      user,
      profile,
      goals,
      dailyReports,
      integrationConnections,
      meals,
    }
  },
}
