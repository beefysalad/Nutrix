import { userRepository } from '@/lib/repositories/user-repository'
import { preferenceRepository } from '@/lib/repositories/preference-repository'
import { goalRepository } from '@/lib/repositories/goal-repository'
import prisma from '@/lib/prisma'
import { type OnboardingFormValues } from '@/lib/validations/dashboard-forms'

export const onboardingService = {
  async completeOnboarding(userId: string, validated: OnboardingFormValues) {
    // 1. Calculate TDEE (Mifflin-St Jeor)
    const weight = validated.weightKg
    const height = validated.heightCm
    const age = validated.age
    const isMale = validated.gender === 'male'
    
    // BMR calculation
    const bmr = 10 * weight + 6.25 * height - 5 * age + (isMale ? 5 : -161)
    
    // Activity Multiplier
    const activityMultipliers: Record<string, number> = {
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
    // We'll keep the transaction here but use the underlying prisma instance or repositories if they support it
    await prisma.$transaction([
      prisma.userProfile.upsert({
        where: { userId },
        update: {
          gender: validated.gender,
          age: validated.age,
          weightKg: validated.weightKg,
          heightCm: validated.heightCm,
          activityLevel: validated.activityLevel,
        },
        create: {
          userId,
          gender: validated.gender,
          age: validated.age,
          weightKg: validated.weightKg,
          heightCm: validated.heightCm,
          activityLevel: validated.activityLevel,
        },
      }),
      prisma.goal.create({
        data: {
          userId,
          mode,
          dailyCalories: targetCalories,
          proteinGrams,
          carbsGrams,
          fatGrams,
          isActive: true,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { onBoarded: true },
      }),
    ])

    return { success: true }
  },
}
