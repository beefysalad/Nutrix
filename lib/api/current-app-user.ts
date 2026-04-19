import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import type { User } from '@/app/generated/prisma/client'
import prisma from '@/lib/prisma'
import { userService } from '@/lib/services/user-service'

export async function requireAppUser():
  Promise<{ user: User } | { response: NextResponse }> {
  const { userId } = await auth()

  if (!userId) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  await userService.syncCurrentUserToDatabase()

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    return {
      response: NextResponse.json(
        { error: 'Unable to resolve current user' },
        { status: 500 },
      ),
    }
  }

  return { user }
}
