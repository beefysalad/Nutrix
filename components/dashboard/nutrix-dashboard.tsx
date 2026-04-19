'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import {
  Calendar as CalendarIcon,
  Clock,
  FileText,
  Home,
  Lightbulb,
  PlusCircle,
  Settings as SettingsIcon,
  Target,
  TrendingUp,
  Utensils,
} from 'lucide-react'

import { navItems } from '@/components/dashboard/data'
import { CalendarSection } from '@/components/dashboard/sections/calendar-section'
import { DailyReportSection } from '@/components/dashboard/sections/daily-report-section'
import { GoalsSection } from '@/components/dashboard/sections/goals-section'
import { InsightsSection } from '@/components/dashboard/sections/insights-section'
import { LogMealSection } from '@/components/dashboard/sections/log-meal-section'
import { MealsSection } from '@/components/dashboard/sections/meals-section'
import { OverviewSection } from '@/components/dashboard/sections/overview-section'
import { SettingsSection } from '@/components/dashboard/sections/settings-section'
import { TrendsSection } from '@/components/dashboard/sections/trends-section'
import { WeeklySummarySection } from '@/components/dashboard/sections/weekly-summary-section'
import type { DashboardSectionKey } from '@/components/dashboard/types'
import { cn } from '@/components/dashboard/ui'

const iconMap = {
  overview: Home,
  log: PlusCircle,
  meals: Utensils,
  calendar: CalendarIcon,
  trends: TrendingUp,
  insights: Lightbulb,
  'daily-report': FileText,
  'weekly-summary': Clock,
  goals: Target,
  settings: SettingsIcon,
} satisfies Record<DashboardSectionKey, React.ComponentType<{ className?: string }>>

function renderSection(section: DashboardSectionKey) {
  switch (section) {
    case 'log':
      return <LogMealSection />
    case 'meals':
      return <MealsSection />
    case 'calendar':
      return <CalendarSection />
    case 'trends':
      return <TrendsSection />
    case 'insights':
      return <InsightsSection />
    case 'daily-report':
      return <DailyReportSection />
    case 'weekly-summary':
      return <WeeklySummarySection />
    case 'goals':
      return <GoalsSection />
    case 'settings':
      return <SettingsSection />
    case 'overview':
    default:
      return <OverviewSection />
  }
}

export function NutrixDashboard({ section = 'overview' }: { section?: DashboardSectionKey }) {
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date('2026-04-19T09:00:00'))

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-[#111111] lg:w-64 lg:border-b-0 lg:border-r">
          <div className="border-b border-white/10 px-6 py-6">
            <h1 className="font-mono text-2xl text-[#f5f5f5]">
              Nut<span className="text-[#4ade80]">rix</span>
            </h1>
            <p className="mt-2 text-sm text-[#666]">Nutrition cockpit</p>
          </div>
          <nav className="grid gap-1 p-4">
            {navItems.map((item) => {
              const Icon = iconMap[item.key]
              const isActive = item.key === section

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors',
                    isActive ? 'bg-white/5 text-[#f5f5f5]' : 'text-[#888] hover:bg-white/[0.03] hover:text-[#f5f5f5]',
                  )}
                >
                  {isActive ? <span className="absolute bottom-2 left-0 top-2 w-1 rounded-full bg-[#4ade80]" /> : null}
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-white/10 bg-[#0a0a0a]/90 px-6 py-4 backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <span className="text-sm text-[#777]">{today}</span>
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard/log"
                  className="rounded-full bg-[#4ade80] px-5 py-2.5 text-sm font-medium text-[#0a0a0a] transition-colors hover:bg-[#38c56c]"
                >
                  + Log Meal
                </Link>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#141414]">
                  <UserButton
                    afterSignOutUrl="/login"
                    appearance={{
                      elements: {
                        userButtonAvatarBox: 'h-10 w-10',
                        userButtonTrigger:
                          'h-10 w-10 rounded-full border-0 shadow-none focus:shadow-none focus:ring-0',
                        userButtonPopoverCard:
                          'border border-white/10 bg-[#141414] text-white shadow-2xl',
                        userButtonPopoverActionButton:
                          'text-white hover:bg-white/5',
                        userButtonPopoverActionButtonText: 'text-white',
                        userButtonPopoverFooter: 'hidden',
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-6">{renderSection(section)}</main>
        </div>
      </div>
    </div>
  )
}
