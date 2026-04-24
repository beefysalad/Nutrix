import prisma from '@/lib/prisma'
import { IntegrationProvider } from '@/app/generated/prisma/client'

export const integrationRepository = {
  async findConnection(userId: string, provider: IntegrationProvider) {
    return prisma.integrationConnection.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    })
  },

  async findAllByUser(userId: string) {
    return prisma.integrationConnection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },
}
