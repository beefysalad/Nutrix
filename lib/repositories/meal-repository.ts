import { type AiMealFeedback, type EntrySource, type MealType, type Prisma } from '@/app/generated/prisma/client'
import prisma from '@/lib/prisma'

export const mealRepository = {
  async findMany(userId: string, limit: number, dateFrom?: Date, dateTo?: Date) {
    return prisma.mealEntry.findMany({
      where: {
        userId,
        loggedAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      orderBy: {
        loggedAt: 'desc',
      },
      take: limit,
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  },

  async count(userId: string) {
    return prisma.mealEntry.count({
      where: { userId },
    })
  },

  async countAll() {
    return prisma.mealEntry.count()
  },

  async countAllItems() {
    return prisma.mealItem.count()
  },

  async findByIdAndUserId(id: string, userId: string) {
    return prisma.mealEntry.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  },

  async findAllByUser(userId: string) {
    return prisma.mealEntry.findMany({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { loggedAt: 'desc' },
    })
  },

  async create(userId: string, data: {
    loggedAt: Date
    mealType: MealType
    source: EntrySource
    aiFeedback: AiMealFeedback | null
    notes?: string | null
    items: Array<{
      foodId?: string
      foodName: string
      quantity?: number | null
      unit?: string | null
      calories: number
      proteinGrams?: number | null
      carbsGrams?: number | null
      fatGrams?: number | null
    }>
  }) {
    return prisma.mealEntry.create({
      data: {
        userId,
        loggedAt: data.loggedAt,
        mealType: data.mealType,
        source: data.source,
        aiFeedback: data.aiFeedback,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            foodId: item.foodId,
            foodNameSnapshot: item.foodName,
            quantity: item.quantity,
            unit: item.unit,
            calories: item.calories,
            proteinGrams: item.proteinGrams,
            carbsGrams: item.carbsGrams,
            fatGrams: item.fatGrams,
          })),
        },
      },
      include: {
        items: true,
      },
    })
  },

  async updateFeedback(id: string, aiFeedback: AiMealFeedback | null) {
    return prisma.mealEntry.update({
      where: { id },
      data: { aiFeedback },
    })
  },

  async delete(id: string) {
    return prisma.mealEntry.delete({
      where: { id },
    })
  },
}
