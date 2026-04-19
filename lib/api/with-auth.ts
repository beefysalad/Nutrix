import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

type RouteContext = Record<string, unknown>

type AuthContext = {
  userId: string
}

type AuthenticatedRouteHandler<TContext extends RouteContext = RouteContext> = (
  request: Request,
  auth: AuthContext,
  context: TContext
) => Promise<Response>

export function withApiAuth<TContext extends RouteContext = RouteContext>(
  handler: AuthenticatedRouteHandler<TContext>
) {
  return async (request: Request, context: TContext) => {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return handler(request, { userId }, context)
  }
}
