import { NextResponse } from 'next/server'

import { IntegrationProvider, IntegrationStatus } from '@/app/generated/prisma/client'
import { requireAppUser } from '@/lib/api/current-app-user'
import prisma from '@/lib/prisma'
import { getTelegramWebhookInfo } from '@/lib/telegram/api'
import { getTelegramWebhookUrl } from '@/lib/telegram/linking'

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

  let webhookInfo: Awaited<ReturnType<typeof getTelegramWebhookInfo>> | null = null
  let expectedWebhookUrl: string | null = null
  let webhookError: string | null = null

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.NEXT_PUBLIC_APP_URL) {
    try {
      expectedWebhookUrl = getTelegramWebhookUrl()
      webhookInfo = await getTelegramWebhookInfo()
    } catch (error) {
      webhookError =
        error instanceof Error ? error.message : 'Unable to load Telegram webhook status'
    }
  }

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
      configured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.NEXT_PUBLIC_APP_URL),
      expectedUrl: expectedWebhookUrl,
      registeredUrl: webhookInfo?.result.url ?? null,
      registered:
        Boolean(expectedWebhookUrl) && webhookInfo?.result.url === expectedWebhookUrl,
      pendingUpdateCount: webhookInfo?.result.pending_update_count ?? null,
      lastErrorMessage: webhookInfo?.result.last_error_message ?? webhookError,
    },
  })
}
