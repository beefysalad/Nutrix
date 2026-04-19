import { NextResponse } from 'next/server'

import { requireAppUser } from '@/lib/api/current-app-user'
import { pendingLinkService } from '@/lib/services/pending-link-service'
import { buildTelegramDeepLink } from '@/lib/telegram/linking'

export async function GET() {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const pendingLink = await pendingLinkService.createLinkToken(result.user.id, 'telegram')
  const deepLink = buildTelegramDeepLink(pendingLink.token)

  return NextResponse.redirect(deepLink)
}
