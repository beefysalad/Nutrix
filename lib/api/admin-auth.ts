import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

import { env } from '@/lib/env'

export const ADMIN_COOKIE_NAME = 'nutrix_admin_session'

function getAdminPassword() {
  return env.NUTRIX_ADMIN_PASSWORD
}

function getAdminSecret() {
  return env.NUTRIX_ADMIN_SESSION_SECRET ?? getAdminPassword()
}

export function isAdminPasswordConfigured() {
  return Boolean(getAdminPassword())
}

export function getAdminSessionToken() {
  const password = getAdminPassword()
  const secret = getAdminSecret()

  if (!password || !secret) {
    return null
  }

  return createHmac('sha256', secret).update(password).digest('hex')
}

export function isValidAdminPassword(password: string) {
  const configuredPassword = getAdminPassword()

  if (!configuredPassword) {
    return false
  }

  return safeEqual(password, configuredPassword)
}

export function isAdminRequest(request: NextRequest) {
  const expectedToken = getAdminSessionToken()
  const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value

  if (!expectedToken || !sessionToken) {
    return false
  }

  return safeEqual(sessionToken, expectedToken)
}

function safeEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value)
  const expectedBuffer = Buffer.from(expected)

  if (valueBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(valueBuffer, expectedBuffer)
}
