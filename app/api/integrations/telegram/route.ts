import { NextResponse } from 'next/server'

import { IntegrationProvider, IntegrationStatus } from '@/app/generated/prisma/client'
import { requireAppUser } from '@/lib/api/current-app-user'
import prisma from '@/lib/prisma'

export async function GET() {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const connection = await prisma.integrationConnection.findUnique({
    where: {
      userId_provider: {
        userId: result.user.id,
        provider: IntegrationProvider.telegram,
      },
    },
  })

  const isTelegramConfigured = Boolean(
    process.env.TELEGRAM_BOT_TOKEN &&
      process.env.TELEGRAM_BOT_USERNAME &&
      process.env.NEXT_PUBLIC_APP_URL,
  )

  return NextResponse.json({
    connection: connection
      ? {
          status: connection.status,
          username: connection.username,
          externalUserId: connection.externalUserId,
          connectedAt: connection.connectedAt,
          chatId:
            typeof connection.metadata === 'object' &&
            connection.metadata &&
            'chatId' in connection.metadata
              ? connection.metadata.chatId
              : null,
        }
      : {
          status: IntegrationStatus.disconnected,
          username: null,
          externalUserId: null,
          connectedAt: null,
          chatId: null,
        },
    webhook: {
      configured: isTelegramConfigured,
      expectedUrl: null,
      registeredUrl: null,
      registered: false,
      pendingUpdateCount: null,
      lastErrorMessage: null,
    },
  })
}
