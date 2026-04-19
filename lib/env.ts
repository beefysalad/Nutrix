import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: z.string().min(1),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.flatten().fieldErrors)

  // Only throw if we are NOT explicitly skipping validation (e.g. during build/CI)
  if (process.env.SKIP_ENV_VALIDATION !== 'true') {
    throw new Error('Invalid environment variables')
  }
}

export const env = parsedEnv.success ? parsedEnv.data : (process.env as unknown as z.infer<typeof envSchema>)
