import prisma from '@/lib/prisma'
import { Prisma } from '@/app/generated/prisma/client'

export const suggestionRepository = {
  async findLatestGenerationId(userId: string, style: string, mealType?: string) {
    const suggestion = await prisma.foodSuggestion.findFirst({
      where: {
        userId,
        style,
        ...(mealType ? { generatedForMealType: mealType } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        generationId: true,
      },
    })
    return suggestion?.generationId ?? null
  },

  async findById(id: string, userId: string) {
    return prisma.foodSuggestion.findFirst({
      where: {
        id,
        userId,
      },
    })
  },

  async findSuggestionsByGenerationId(userId: string, generationId: string) {
    return prisma.foodSuggestion.findMany({
      where: {
        userId,
        generationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  },

  async saveGeneratedSuggestions(userId: string, suggestions: Prisma.FoodSuggestionCreateManyInput[]) {
    return prisma.foodSuggestion.createMany({
      data: suggestions.map((s) => ({
        ...s,
        userId,
      })),
    })
  },

  async findSavedSuggestions(userId: string) {
    return prisma.foodSuggestion.findMany({
      where: {
        userId,
        isSaved: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
  },

  async updateSaveStatus(userId: string, suggestionId: string, isSaved: boolean) {
    return prisma.foodSuggestion.updateMany({
      where: {
        id: suggestionId,
        userId,
      },
      data: {
        isSaved,
      },
    })
  },
}
