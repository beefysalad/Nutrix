import { NextRequest, NextResponse } from 'next/server'

import {
  ADMIN_COOKIE_NAME,
  getAdminSessionToken,
  isAdminPasswordConfigured,
  isValidAdminPassword,
} from '@/lib/api/admin-auth'

export async function POST(request: NextRequest) {
  const { password } = (await request.json().catch(() => ({}))) as {
    password?: string
  }

  if (!isAdminPasswordConfigured()) {
    return NextResponse.json(
      { error: 'Admin password is not configured' },
      { status: 503 },
    )
  }

  if (!password || !isValidAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 })
  }

  const token = getAdminSessionToken()

  if (!token) {
    return NextResponse.json(
      { error: 'Admin session could not be created' },
      { status: 503 },
    )
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  })

  return response
}
