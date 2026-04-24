'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import { User } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function AccountSettings() {
  const clerk = useClerk()
  const { isLoaded, user } = useUser()

  const primaryEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    null
  const fullNameFromParts =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || null
  const displayName =
    user?.fullName ?? fullNameFromParts ?? user?.username ?? 'Unnamed user'
  const memberSince = user?.createdAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(user.createdAt)
    : null

  return (
    <div>
      <h3 className="mb-4 text-lg text-[#f5f5f5]">Account</h3>
      <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#141414]">
              {isLoaded && user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-[#888]" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-lg text-[#f5f5f5]">
                {isLoaded ? displayName : 'Loading account...'}
              </div>
              <div className="text-sm text-[#777]">
                {isLoaded
                  ? (primaryEmail ?? 'No primary email found')
                  : 'Fetching your Clerk profile'}
              </div>
              {isLoaded && memberSince ? (
                <div className="mt-2 text-[11px] tracking-widest text-[#666] uppercase">
                  Member since {memberSince}
                </div>
              ) : null}
            </div>
          </div>
          <Button
            onClick={() => clerk.openUserProfile()}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm font-medium text-[#f5f5f5] transition-colors hover:border-[#e4ff00]/50 hover:bg-[#1a1a1a] hover:text-[#e4ff00] md:mt-0 md:w-auto"
          >
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  )
}
