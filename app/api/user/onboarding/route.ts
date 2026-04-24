import { requireAppUser } from '@/lib/api/current-app-user'
import { onboardingService } from '@/lib/services/onboarding-service'
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

    const response = await onboardingService.completeOnboarding(user.id, validated)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 400 }
    )
  }
}
