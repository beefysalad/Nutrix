import { NextRequest, NextResponse } from 'next/server'

import { requireAppUser } from '@/lib/api/current-app-user'
import { setTelegramWebhook } from '@/lib/telegram/api'
import { getTelegramWebhookUrl } from '@/lib/telegram/linking'

export async function GET(request: NextRequest) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  try {
    const webhookUrl = getTelegramWebhookUrl()
    await setTelegramWebhook(webhookUrl, process.env.TELEGRAM_WEBHOOK_SECRET)

    return NextResponse.redirect(new URL('/dashboard/settings?telegramWebhook=registered', request.url))
  } catch (error) {
    const reason = encodeURIComponent(
      error instanceof Error ? error.message : 'Unable to register Telegram webhook',
    )

    return NextResponse.redirect(
      new URL(`/dashboard/settings?telegramWebhook=error&reason=${reason}`, request.url),
    )
  }
}
