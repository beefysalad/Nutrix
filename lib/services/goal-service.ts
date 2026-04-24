import { type GoalMode } from '@/app/generated/prisma/client'
import { goalRepository } from '@/lib/repositories/goal-repository'
import { userRepository } from '@/lib/repositories/user-repository'

export const goalService = {
  async getActiveGoalAndProfile(userId: string) {
    const [goal, profile] = await Promise.all([
      goalRepository.findActiveGoal(userId),
      goalRepository.findUserProfile(userId),
    ])

    return {
      goal,
      profile: profile
        ? {
            gender:
              profile.gender === 'male' || profile.gender === 'female'
                ? profile.gender
                : null,
            age: profile.age,
            weightKg:
              profile.weightKg != null ? Number(profile.weightKg) : null,
            heightCm: profile.heightCm,
            activityLevel:
              profile.activityLevel === 'sedentary' ||
              profile.activityLevel === 'lightly-active' ||
              profile.activityLevel === 'moderately-active' ||
              profile.activityLevel === 'very-active'
                ? profile.activityLevel
                : null,
          }
        : null,
    }
  },

  async upsertActiveGoal(userId: string, data: {
    mode: string
    dailyCalories?: number | null
    proteinGrams?: number | null
    carbsGrams?: number | null
    fatGrams?: number | null
    startsAt?: string | null
    endsAt?: string | null
  }) {
    const activeGoal = await goalRepository.findActiveGoal(userId)

    const goalData = {
      mode: data.mode as GoalMode,
      dailyCalories: data.dailyCalories ?? null,
      proteinGrams: data.proteinGrams ?? null,
      carbsGrams: data.carbsGrams ?? null,
      fatGrams: data.fatGrams ?? null,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      isActive: true,
    }

    if (activeGoal) {
      return goalRepository.updateGoal(activeGoal.id, goalData)
    }

    return goalRepository.createGoal(userId, goalData)
  },
}
