import { counterService } from '@/lib/services/counter-service'
import { withApiAuth } from '@/lib/api/with-auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

const counterSchema = z.object({
  value: z.number().int().min(0),
})

export const GET = withApiAuth(async () => {
  try {
    const counter = await counterService.GetGlobalCounter()
    return NextResponse.json(counter)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch counter' }, { status: 500 })
  }
})

export const POST = withApiAuth(async () => {
  try {
    const counter = await counterService.incrementGlobalCounter()
    return NextResponse.json(counter)
  } catch {
    return NextResponse.json(
      { error: 'Failed to increment counter' },
      { status: 500 }
    )
  } 
})

export const PATCH = withApiAuth(async (req: Request) => {
  try {
    const body = await req.json()
    const result = counterSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: fromZodError(result.error).message },
        { status: 400 }
      )
    }

    const counter = await counterService.setGlobalCounter(result.data.value)
    return NextResponse.json(counter)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update counter' },
      { status: 500 }
    )
  }
})
