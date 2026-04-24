import { Prisma } from '@/app/generated/prisma/client'
import prisma from '@/lib/prisma'

export const preferenceRepository = {
  async findProfile(userId: string, selectAiModel = true) {
    return prisma.userProfile.findUnique({
      where: { userId },
      select: selectAiModel
        ? {
            unitSystem: true,
            aiModel: true,
          }
        : {
            unitSystem: true,
          },
    })
  },

  async upsertProfile(
    userId: string,
    data: { unitSystem?: string; aiModel?: string },
    selectAiModel = true
  ) {
    return prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(data.unitSystem ? { unitSystem: data.unitSystem as any } : {}),
        ...(selectAiModel && data.aiModel ? { aiModel: data.aiModel } : {}),
      },
      create: {
        userId,
        unitSystem: (data.unitSystem ?? 'metric') as any,
        ...(selectAiModel ? { aiModel: data.aiModel ?? 'gemini-2.5-flash-lite' } : {}),
      },
      select: selectAiModel
        ? {
            unitSystem: true,
            aiModel: true,
          }
        : {
            unitSystem: true,
          },
    })
  },

  isMissingAiModelColumn(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2022' &&
      typeof error.meta?.column === 'string' &&
      error.meta.column.includes('aiModel')
    )
  },
}
