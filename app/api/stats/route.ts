import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const revalidate = 3600 // cache for 1 hour

export async function GET() {
  const [mealCount, userCount, itemCount] = await Promise.all([
    prisma.mealEntry.count(),
    prisma.user.count(),
    prisma.mealItem.count(),
  ])

  return NextResponse.json({ mealCount, userCount, itemCount })
}
