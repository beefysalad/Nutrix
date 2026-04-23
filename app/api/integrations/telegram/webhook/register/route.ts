import { NextRequest, NextResponse } from 'next/server'

import { isAdminRequest } from '@/lib/api/admin-auth'
import { requireAppUser } from '@/lib/api/current-app-user'
import { setTelegramWebhook } from '@/lib/telegram/api'
import { getTelegramWebhookUrl } from '@/lib/telegram/linking'

export async function GET(request: NextRequest) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  if (!isAdminRequest(request)) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  try {
    const webhookUrl = getTelegramWebhookUrl()
    await setTelegramWebhook(webhookUrl, process.env.TELEGRAM_WEBHOOK_SECRET)

    return NextResponse.redirect(new URL('/admin?telegramWebhook=registered', request.url))
  } catch (error) {
    const reason = encodeURIComponent(
      error instanceof Error ? error.message : 'Unable to register Telegram webhook',
    )

    return NextResponse.redirect(
      new URL(`/admin?telegramWebhook=error&reason=${reason}`, request.url),
    )
  }
}
