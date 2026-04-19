import { requireAppUser } from '@/lib/api/current-app-user'
import prisma from '@/lib/prisma'
import { onboardingSchema } from '@/lib/validations/dashboard-forms'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const result = await requireAppUser()

  if ('response' in result) {
    return result.response
  }

  const { user } = result

  try {
    const body = await request.json()
    const validated = onboardingSchema.parse(body)

    // 1. Calculate TDEE (Mifflin-St Jeor)
    const weight = validated.weightKg
    const height = validated.heightCm
    const age = validated.age
    const isMale = validated.gender === 'male'
    
    // BMR calculation
    const bmr = 10 * weight + 6.25 * height - 5 * age + (isMale ? 5 : -161)
    
    // Activity Multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      'lightly-active': 1.375,
      'moderately-active': 1.55,
      'very-active': 1.725,
      'extra-active': 1.9,
    }
    
    const tdee = bmr * activityMultipliers[validated.activityLevel]
    
    // 2. Determine initial goal calories and macros
    let targetCalories = Math.round(tdee)
    let mode: 'cutting' | 'maintenance' | 'bulking' = 'maintenance'
    
    if (validated.goal === 'lose-weight') {
      targetCalories -= 500
      mode = 'cutting'
    } else if (validated.goal === 'gain-weight') {
      targetCalories += 300
      mode = 'bulking'
    }
    
    // Default macros (e.g. 30% Protein, 40% Carbs, 30% Fat)
    const proteinGrams = Math.round((targetCalories * 0.3) / 4)
    const carbsGrams = Math.round((targetCalories * 0.4) / 4)
    const fatGrams = Math.round((targetCalories * 0.3) / 9)

    // 3. Update User and Profile in a transaction
    await prisma.$transaction([
      prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {
          gender: validated.gender,
          age: validated.age,
          weightKg: validated.weightKg,
          heightCm: validated.heightCm,
          activityLevel: validated.activityLevel,
        },
        create: {
          userId: user.id,
          gender: validated.gender,
          age: validated.age,
          weightKg: validated.weightKg,
          heightCm: validated.heightCm,
          activityLevel: validated.activityLevel,
        },
      }),
      prisma.goal.create({
        data: {
          userId: user.id,
          mode,
          dailyCalories: targetCalories,
          proteinGrams,
          carbsGrams,
          fatGrams,
          isActive: true,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { onBoarded: true },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 400 }
    )
  }
}
