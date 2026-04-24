import { mealRepository } from '@/lib/repositories/meal-repository'
import { userRepository } from '@/lib/repositories/user-repository'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const [mealCount, userCount, itemCount] = await Promise.all([
    mealRepository.countAll(),
    userRepository.countAll(),
    mealRepository.countAllItems(),
  ])

  return NextResponse.json({ mealCount, userCount, itemCount })
}
