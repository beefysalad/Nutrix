'use client'

import Link from 'next/link'

import { cn } from '@/components/dashboard/ui'

export function DashboardMobileNavItem({
  href,
  label,
  active,
  icon: Icon,
}: {
  href: string
  label: string
  active: boolean
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] transition-all active:scale-95',
        active ? 'text-[#e4ff00]' : 'text-[#777]',
      )}
    >
      <Icon
        className={cn(
          'h-5 w-5 transition-transform',
          active ? 'text-[#e4ff00]' : 'text-[#999]',
        )}
      />
      <span>{label}</span>
    </Link>
  )
}
