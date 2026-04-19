import { randomBytes } from 'crypto'

import { IntegrationProvider } from '@/app/generated/prisma/client'
import prisma from '@/lib/prisma'

function generateToken() {
  return randomBytes(24).toString('base64url')
}

export const pendingLinkService = {
  async createLinkToken(userId: string, provider: IntegrationProvider) {
    await prisma.pendingLink.deleteMany({
      where: {
        userId,
        provider,
      },
    })

    const pendingLink = await prisma.pendingLink.create({
      data: {
        userId,
        provider,
        token: generateToken(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 20),
      },
    })

    return pendingLink
  },

  async consumeLinkToken(token: string, provider: IntegrationProvider) {
    const now = new Date()

    const pendingLink = await prisma.pendingLink.findFirst({
      where: {
        token,
        provider,
        consumedAt: null,
        expiresAt: {
          gt: now,
        },
      },
    })

    if (!pendingLink) {
      return null
    }

    return prisma.pendingLink.update({
      where: { id: pendingLink.id },
      data: {
        consumedAt: now,
      },
    })
  },
}
