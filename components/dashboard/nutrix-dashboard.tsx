'use client'
import { useState, useEffect } from 'react'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import {
  History,
  Home,
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  PlusCircle,
  Settings as SettingsIcon,
  Target,
} from 'lucide-react'

import { navItems } from '@/components/dashboard/data'
import { DashboardHomeSection } from '@/components/dashboard/sections/dashboard-home-section'
import { GoalsSection } from '@/components/dashboard/sections/goals-section'
import { HistorySection } from '@/components/dashboard/sections/history-section'
import { LogMealSection } from '@/components/dashboard/sections/log-meal-section'
import { SettingsSection } from '@/components/dashboard/sections/settings-section'
import { SuggestionsSection } from './sections/suggestions-section'
import { OnboardingWizard } from '@/components/dashboard/onboarding/onboarding-wizard'
import {
  DashboardSectionKey,
  DashboardSubview,
  HistorySubview,
  SuggestionsSubview,
} from '@/components/dashboard/types'
import { cn } from '@/components/dashboard/ui'
import { useDashboardSummaryQuery } from '@/lib/hooks/use-dashboard-api'

const iconMap = {
  dashboard: Home,
  log: PlusCircle,
  history: History,
  goals: Target,
  suggestions: Bot,
  settings: SettingsIcon,
} satisfies Record<DashboardSectionKey, React.ComponentType<{ className?: string }>>

function renderSection(
  section: DashboardSectionKey,
  options?: {
    dashboardView?: DashboardSubview
    historyView?: HistorySubview
    suggestionsView?: SuggestionsSubview
  },
) {
  switch (section) {
    case 'dashboard':
      return <DashboardHomeSection initialView={options?.dashboardView} />
    case 'log':
      return <LogMealSection />
    case 'history':
      return <HistorySection initialView={options?.historyView} />
    case 'goals':
      return <GoalsSection />
    case 'suggestions':
      return <SuggestionsSection initialView={options?.suggestionsView} />
    case 'settings':
      return <SettingsSection />
    default:
      return <DashboardHomeSection />
  }
}

export function NutrixDashboard({
  section = 'dashboard',
  dashboardView,
  historyView,
  suggestionsView,
}: {
  section?: DashboardSectionKey
  dashboardView?: DashboardSubview
  historyView?: HistorySubview
  suggestionsView?: SuggestionsSubview
}) {
  const summaryQuery = useDashboardSummaryQuery()
  const onboarded = summaryQuery.data?.onBoarded ?? true

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [isLogMealSheetOpen, setIsLogMealSheetOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        // If visual viewport is notably smaller than innerHeight, keyboard is likely active
        const isVisible = window.visualViewport.height < window.innerHeight * 0.85
        setIsKeyboardVisible(isVisible)
      }
    }

    const viewport = window.visualViewport
    if (viewport) {
      viewport.addEventListener('resize', handleResize)
      return () => viewport.removeEventListener('resize', handleResize)
    }
  }, [])

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside
          className={cn(
            'hidden flex-shrink-0 bg-[#111111] transition-[width] duration-200 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:border-white/10',
            isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
            !onboarded && 'lg:hidden',
          )}
        >
          <div
            className={cn(
              'flex h-20 items-center border-b border-white/10 px-4',
              isSidebarCollapsed ? 'justify-center' : 'justify-start',
            )}
          >
            {isSidebarCollapsed ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#0a0a0a] font-mono text-[11px] font-black tracking-tighter text-[#e4ff00]">
                NX
              </div>
            ) : (
              <h1 className="font-mono text-2xl font-black uppercase tracking-tighter text-[#f5f5f5]">
                NUTR<span className="text-[#e4ff00]">IX</span>
              </h1>
            )}
          </div>
          <nav
            className={cn(
              'grid flex-1 content-start gap-1 overflow-x-hidden overflow-y-auto p-4',
              isSidebarCollapsed && 'px-3',
            )}
          >
            {navItems.map((item) => {
              const Icon = iconMap[item.key]
              const isActive = item.key === section

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isSidebarCollapsed ? item.label : undefined}
                  aria-label={item.label}
                  className={cn(
                    'relative flex items-center gap-3 rounded-none border border-transparent px-4 py-3 text-sm transition-colors',
                    isSidebarCollapsed && 'justify-center px-0',
                    isActive
                      ? 'border-white/10 bg-white/5 text-[#f5f5f5]'
                      : 'text-[#888] hover:border-white/5 hover:bg-white/[0.03] hover:text-[#f5f5f5]',
                  )}
                >
                  {isActive ? (
                    <span className="absolute bottom-2 left-0 top-2 w-[2px] bg-[#e4ff00] shadow-[0_0_8px_#e4ff00]" />
                  ) : null}
                  <Icon className={cn('h-4 w-4', isActive ? 'text-[#e4ff00]' : '')} />
                  <span className={cn(isSidebarCollapsed && 'sr-only')}>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {!onboarded ? null : (
            <header className="sticky top-0 z-40 h-20 border-b border-white/10 bg-[#0a0a0a]/90 px-4 backdrop-blur md:px-6">
              <div className="flex h-full items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
                    aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#111111] text-[#888] transition-colors hover:border-[#e4ff00]/40 hover:text-[#e4ff00] lg:flex"
                  >
                    {isSidebarCollapsed ? (
                      <PanelLeftOpen className="h-4 w-4" />
                    ) : (
                      <PanelLeftClose className="h-4 w-4" />
                    )}
                  </button>
                  <span className="hidden text-sm text-[#777] sm:inline">{today}</span>
                  <div className="sm:hidden">
                    <h1 className="font-mono text-lg font-black uppercase tracking-tighter text-[#f5f5f5]">
                      NUTR<span className="text-[#e4ff00]">IX</span>
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsLogMealSheetOpen(true)}
                    className="hidden items-center justify-center rounded-full bg-[#e4ff00] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-black transition-all hover:bg-[#e4ff00]/90 md:flex"
                  >
                    <span className="mr-2">+</span> Log Meal
                  </button>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#141414]">
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
                </div>
              </div>
            </header>
          )}

          <main className="flex-1 px-4 py-6 pb-32 md:px-6 md:pb-6">
            {!onboarded ? (
              <OnboardingWizard />
            ) : (
              renderSection(section, { dashboardView, historyView, suggestionsView })
            )}
          </main>
        </div>
      </div>

      {!onboarded || isKeyboardVisible ? null : (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#111111]/95 px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
          <div className="grid grid-cols-5 items-end gap-1">
            <MobileNavItem
              href="/dashboard"
              label="Home"
              active={section === 'dashboard'}
              icon={Home}
            />
            <MobileNavItem
              href="/dashboard/history"
              label="History"
              active={section === 'history'}
              icon={History}
            />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setIsLogMealSheetOpen(true)}
                aria-label="Log meal"
                className="flex h-16 w-16 -translate-y-5 items-center justify-center rounded-full bg-[#e4ff00] text-black shadow-[0_10px_30px_rgba(228,255,0,0.4)] transition-transform active:scale-95"
              >
                <Plus className="h-7 w-7" />
              </button>
            </div>
            <MobileNavItem
              href="/dashboard/goals"
              label="Goals"
              active={section === 'goals'}
              icon={Target}
            />
            <MobileNavItem
              href="/dashboard/settings"
              label="Settings"
              active={section === 'settings'}
              icon={SettingsIcon}
            />
          </div>
        </nav>
      )}

      {isLogMealSheetOpen ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close log meal sheet"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsLogMealSheetOpen(false)}
          />
          <div className="relative z-10 flex h-[90vh] w-full max-w-4xl min-h-0 flex-col overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#111111] lg:mb-8 lg:h-auto lg:max-h-[88vh] lg:rounded-[2rem]">
            <div className="flex justify-center pt-3 lg:hidden">
              <div className="h-1.5 w-14 rounded-full bg-white/10" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4 md:px-6">
              <LogMealSection presentation="sheet" onClose={() => setIsLogMealSheetOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MobileNavItem({
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
      <Icon className={cn('h-5 w-5 transition-transform', active ? 'text-[#e4ff00]' : 'text-[#999]')} />
      <span>{label}</span>
    </Link>
  )
}
