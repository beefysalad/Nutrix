import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import LandingPageComponent from '@/components/landing/landing'

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    redirect('/dashboard')
  }

  return <LandingPageComponent />
}
