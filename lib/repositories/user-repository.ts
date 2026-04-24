import prisma from '@/lib/prisma'

import type { User } from '@/app/generated/prisma/client'

export const userRepository = {
  findByClerkId(clerkId: string) {
    return prisma.user.findUnique({
      where: { clerkId },
    })
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    })
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    })
  },

  upsertByClerkId(input: {
    clerkId: string
    email: string
    name: string | null
    image: string | null
    emailVerified: Date | null
  }) {
    return prisma.user.upsert({
      where: { clerkId: input.clerkId },
      update: {
        email: input.email,
        name: input.name,
        image: input.image,
        emailVerified: input.emailVerified,
      },
      create: {
        clerkId: input.clerkId,
        email: input.email,
        name: input.name,
        image: input.image,
        emailVerified: input.emailVerified,
        hashedPassword: null,
      },
    })
  },

  linkClerkIdentityByEmail(input: {
    userId: string
    clerkId: string
    name: string | null
    image: string | null
    emailVerified: Date | null
    currentName: string | null
    currentEmailVerified: Date | null
  }) {
    return prisma.user.update({
      where: { id: input.userId },
      data: {
        clerkId: input.clerkId,
        name: input.name ?? input.currentName,
        image: input.image,
        emailVerified: input.emailVerified ?? input.currentEmailVerified,
      },
    })
  },

  deleteById(id: string) {
    return prisma.user.delete({
      where: { id },
    })
  },

  async findProfileByUserId(userId: string) {
    return prisma.userProfile.findUnique({
      where: { userId },
    })
  },

  async getFoodSuggestionLimit(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { foodSuggestionLimit: true },
    })
    return user?.foodSuggestionLimit ?? 0
  },

  async incrementFoodSuggestionLimit(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        foodSuggestionLimit: {
          increment: 1,
        },
      },
    })
  },

  async resetFoodSuggestionLimit(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        foodSuggestionLimit: 0,
      },
    })
  },

  async updateOnboardingStatus(userId: string, onBoarded: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { onBoarded },
    })
  },

  async countAll() {
    return prisma.user.count()
  },
}
