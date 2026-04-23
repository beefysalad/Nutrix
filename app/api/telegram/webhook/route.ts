import { NextRequest, NextResponse } from 'next/server'

import { telegramService } from '@/lib/services/telegram-service'

const processedTelegramUpdates = new Map<number, number>()
const TELEGRAM_UPDATE_TTL_MS = 5 * 60 * 1000

type TelegramUpdate = {
  update_id?: number
  message?: {
    chat?: {
      id?: number
      type?: string
    }
    from?: {
      id?: number
      username?: string
      first_name?: string
      last_name?: string
    }
    text?: string
  }
}

function markTelegramUpdate(updateId?: number) {
  if (typeof updateId !== 'number') {
    return true
  }

  const now = Date.now()

  for (const [id, seenAt] of processedTelegramUpdates.entries()) {
    if (now - seenAt > TELEGRAM_UPDATE_TTL_MS) {
      processedTelegramUpdates.delete(id)
    }
  }

  if (processedTelegramUpdates.has(updateId)) {
    return false
  }

  processedTelegramUpdates.set(updateId, now)
  return true
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-telegram-bot-api-secret-token')
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET

  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 })
  }

  const payload = (await request.json()) as TelegramUpdate

  if (!payload.message) {
    return NextResponse.json({ ok: true, ignored: true })
  }

  if (!markTelegramUpdate(payload.update_id)) {
    return NextResponse.json({ ok: true, duplicate: true })
  }

  void telegramService.handleIncomingMessage(payload.message).catch((error) => {
    console.error(
      'Unable to process Telegram update:',
      error instanceof Error ? error.message : error,
    )
  })

  return NextResponse.json({ ok: true })
}
