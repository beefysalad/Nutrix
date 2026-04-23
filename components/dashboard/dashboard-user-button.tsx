'use client'

import { UserButton } from '@clerk/nextjs'

export function DashboardUserButton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: 'h-10 w-10 rounded-full',
            userButtonTrigger:
              'h-10 w-10 rounded-full border-0 shadow-none focus:shadow-none focus:ring-0',
            userButtonPopoverCard:
              'border border-white/10 bg-[#141414] rounded-2xl text-white shadow-2xl',
            userButtonPopoverActionButton: 'text-white hover:bg-white/5 rounded-xl',
            userButtonPopoverActionButtonText: 'text-white',
            userButtonPopoverFooter: 'hidden',
          },
        }}
      />
    </div>
  )
}
