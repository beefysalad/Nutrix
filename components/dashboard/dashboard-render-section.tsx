'use client'

import { GoalsSection } from '@/components/dashboard/sections/goals-section'
import { HistorySection } from '@/components/dashboard/sections/history-section'
import { LogMealSection } from '@/components/dashboard/sections/log-meal-section'
import { SettingsSection } from '@/components/dashboard/sections/settings-section'
import { SuggestionsSection } from '@/components/dashboard/sections/suggestions-section'
import { DashboardHomeSection } from '@/components/dashboard/sections/dashboard-home-section'
import type {
  DashboardSectionKey,
  DashboardSubview,
  HistorySubview,
  SuggestionsSubview,
} from '@/components/dashboard/types'

export function renderDashboardSection(
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
