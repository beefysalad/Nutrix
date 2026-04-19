'use client'

import { useState } from 'react'
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
  Menu,
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date('2026-04-19T09:00:00'))

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Sidebar */}
        <aside
          className={cn(
            'bg-[#111111] lg:relative lg:block lg:w-64 lg:border-r lg:border-white/10 flex-shrink-0',
            isMobileMenuOpen ? 'fixed inset-0 z-50 flex flex-col' : 'hidden md:hidden lg:flex lg:flex-col'
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
            <div>
              <h1 className="font-mono text-2xl text-[#f5f5f5] uppercase font-black tracking-tighter">
                NUTR<span className="text-[#e4ff00]">IX</span>
              </h1>
              <p className="mt-2 text-xs uppercase tracking-widest text-[#666]">Nutrition cockpit</p>
            </div>
            {isMobileMenuOpen && (
              <button
                className="lg:hidden p-2 text-white/50 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
          <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 grid gap-1 content-start">
            {navItems.map((item) => {
              const Icon = iconMap[item.key]
              const isActive = item.key === section

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'relative flex items-center gap-3 rounded-none px-4 py-3 text-sm transition-colors border border-transparent',
                    isActive
                      ? 'bg-white/5 text-[#f5f5f5] border-white/10'
                      : 'text-[#888] hover:bg-white/[0.03] hover:text-[#f5f5f5] hover:border-white/5'
                  )}
                >
                  {isActive ? (
                    <span className="absolute bottom-2 left-0 top-2 w-[2px] bg-[#e4ff00] shadow-[0_0_8px_#e4ff00]" />
                  ) : null}
                  <Icon className={cn('h-4 w-4', isActive ? 'text-[#e4ff00]' : '')} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content Pane */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/90 px-4 py-4 backdrop-blur md:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden p-2 -ml-2 text-white/70 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
                <span className="hidden sm:inline text-sm text-[#777]">{today}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard/log"
                  className="flex items-center justify-center rounded-full bg-[#e4ff00] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-black transition-all hover:bg-[#e4ff00]/90"
                >
                  <span className="mr-2">+</span> Log Meal
                </Link>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#141414]">
                  <UserButton
                
                    appearance={{
                      elements: {
                        userButtonAvatarBox: 'h-10 w-10 rounded-full',
                        userButtonTrigger:
                          'h-10 w-10 rounded-full border-0 shadow-none focus:shadow-none focus:ring-0',
                        userButtonPopoverCard:
                          'border border-white/10 bg-[#141414] rounded-2xl text-white shadow-2xl',
                        userButtonPopoverActionButton:
                          'text-white hover:bg-white/5 rounded-xl',
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
