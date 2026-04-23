import { NextRequest, NextResponse } from 'next/server'

import { isAdminRequest } from '@/lib/api/admin-auth'
import { getTelegramWebhookInfo, setTelegramWebhook } from '@/lib/telegram/api'
import { getTelegramWebhookUrl } from '@/lib/telegram/linking'

async function getTelegramAdminStatus() {
  const configured = Boolean(
    process.env.TELEGRAM_BOT_TOKEN &&
      process.env.TELEGRAM_BOT_USERNAME &&
      process.env.NEXT_PUBLIC_APP_URL,
  )
  const expectedUrl = process.env.NEXT_PUBLIC_APP_URL
    ? getTelegramWebhookUrl()
    : null

  let webhookInfo: Awaited<ReturnType<typeof getTelegramWebhookInfo>> | null =
    null
  let lastErrorMessage: string | null = null

  if (configured) {
    try {
      webhookInfo = await getTelegramWebhookInfo()
    } catch (error) {
      lastErrorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to load Telegram webhook status'
    }
  }

  return {
    configured,
    expectedUrl,
    registeredUrl: webhookInfo?.result.url ?? null,
    registered:
      Boolean(expectedUrl) && webhookInfo?.result.url === expectedUrl,
    pendingUpdateCount: webhookInfo?.result.pending_update_count ?? null,
    lastErrorMessage:
      webhookInfo?.result.last_error_message ?? lastErrorMessage,
  }
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ telegram: await getTelegramAdminStatus() })
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action } = (await request.json().catch(() => ({}))) as {
    action?: string
  }

  if (action !== 'register-webhook') {
    return NextResponse.json({ error: 'Unsupported admin action' }, { status: 400 })
  }

  const webhookUrl = getTelegramWebhookUrl()
  await setTelegramWebhook(webhookUrl, process.env.TELEGRAM_WEBHOOK_SECRET)

  return NextResponse.json({ telegram: await getTelegramAdminStatus() })
}
