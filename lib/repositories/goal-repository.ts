import { type GoalMode } from '@/app/generated/prisma/client'
import prisma from '@/lib/prisma'

export const goalRepository = {
  async findActiveGoal(userId: string) {
    return prisma.goal.findFirst({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  async findUserProfile(userId: string) {
    return prisma.userProfile.findUnique({
      where: {
        userId,
      },
      select: {
        gender: true,
        age: true,
        weightKg: true,
        heightCm: true,
        activityLevel: true,
      },
    })
  },

  async findAllByUser(userId: string) {
    return prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  async updateGoal(id: string, data: {
    mode: GoalMode
    dailyCalories: number | null
    proteinGrams: number | null
    carbsGrams: number | null
    fatGrams: number | null
    startsAt: Date | null
    endsAt: Date | null
    isActive: boolean
  }) {
    return prisma.goal.update({
      where: { id },
      data,
    })
  },

  async createGoal(userId: string, data: {
    mode: GoalMode
    dailyCalories: number | null
    proteinGrams: number | null
    carbsGrams: number | null
    fatGrams: number | null
    startsAt: Date | null
    endsAt: Date | null
    isActive: boolean
  }) {
    return prisma.goal.create({
      data: {
        userId,
        ...data,
      },
    })
  },
}
