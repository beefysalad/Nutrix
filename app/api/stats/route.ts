import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const [mealCount, userCount, itemCount] = await Promise.all([
    prisma.mealEntry.count(),
    prisma.user.count(),
    prisma.mealItem.count(),
  ])

  return NextResponse.json({ mealCount, userCount, itemCount })
}
