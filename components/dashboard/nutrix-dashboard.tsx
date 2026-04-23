'use client'
import { useState, useEffect } from 'react'

import { UserButton, useUser } from '@clerk/nextjs'
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
  Goal,
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
import { Button } from '@/components/ui/button'
import { useDashboardSummaryQuery } from '@/lib/hooks/use-dashboard-api'

const iconMap = {
  dashboard: Home,
  log: PlusCircle,
  history: History,
  goals: Goal,
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
  const { user } = useUser()
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
  const userDisplayName =
    user?.fullName ??
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ??
    user?.username ??
    'Account'
  const userEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    'Profile and sign out'

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
                  {isActive && !isSidebarCollapsed ? (
                    <span className="absolute bottom-2 left-0 top-2 w-[2px] bg-[#e4ff00] shadow-[0_0_8px_#e4ff00]" />
                  ) : null}
                  <Icon className={cn('h-4 w-4', isActive ? 'text-[#e4ff00]' : '')} />
                  <span className={cn(isSidebarCollapsed && 'sr-only')}>{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <div
            className={cn(
              'border-t border-white/10 p-4',
              isSidebarCollapsed && 'flex justify-center px-3',
            )}
          >
            <div
              className={cn(
                'relative flex items-center gap-3 px-1 py-2',
                isSidebarCollapsed && 'justify-center p-0',
              )}
            >
              {!isSidebarCollapsed ? (
                <DashboardUserButton className="absolute inset-0 z-10 h-full w-full opacity-0 [&_*]:h-full [&_*]:w-full" />
              ) : null}
              <div className={cn(!isSidebarCollapsed && 'pointer-events-none')}>
                <DashboardUserButton />
              </div>
              <div className={cn('min-w-0', isSidebarCollapsed && 'sr-only')}>
                <div className="truncate text-sm font-semibold text-[#f5f5f5]">
                  {userDisplayName}
                </div>
                <div className="truncate text-xs text-[#777]">{userEmail}</div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {!onboarded ? null : (
            <header className="sticky top-0 z-40 h-20 border-b border-white/10 bg-[#0a0a0a]/90 px-4 backdrop-blur md:px-6">
              <div className="flex h-full items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="hidden text-sm text-[#777] sm:inline">{today}</span>
                  <div className="sm:hidden">
                    <h1 className="font-mono text-lg font-black uppercase tracking-tighter text-[#f5f5f5]">
                      NUTR<span className="text-[#e4ff00]">IX</span>
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button
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
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsLogMealSheetOpen(true)}
                    className="hidden items-center justify-center rounded-full bg-[#e4ff00] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-black transition-all hover:bg-[#e4ff00]/90 md:flex"
                  >
                    <span className="mr-2">+</span> Log Meal
                  </Button>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#141414] lg:hidden">
                    <DashboardUserButton />
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
        <nav className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pointer-events-none lg:hidden">
          <div className="pointer-events-auto mx-auto flex max-w-[22rem] items-center justify-between rounded-[2rem] border border-white/10 bg-[#141414]/80 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
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
            
            <div className="px-1">
              <Button
                type="button"
                onClick={() => setIsLogMealSheetOpen(true)}
                aria-label="Log meal"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e4ff00] text-black shadow-[0_0_20px_rgba(228,255,0,0.25)] transition-all hover:bg-[#efff4d] hover:shadow-[0_0_25px_rgba(228,255,0,0.35)] active:scale-95"
              >
                <Plus className="h-6 w-6 stroke-[2.5]" />
              </Button>
            </div>

            <MobileNavItem
              href="/dashboard/goals"
              label="Goals"
              active={section === 'goals'}
              icon={Goal}
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
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-transparent"
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
      aria-label={label}
      className={cn(
        'relative flex h-12 w-12 items-center justify-center rounded-full transition-all active:scale-95',
        active ? 'bg-white/10 text-[#e4ff00]' : 'text-[#777] hover:bg-white/5 hover:text-[#aaa]',
      )}
    >
      <Icon className={cn('h-5 w-5 transition-transform', active ? 'text-[#e4ff00] scale-110' : 'text-[#888]')} />
    </Link>
  )
}

function DashboardUserButton({ className }: { className?: string }) {
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
