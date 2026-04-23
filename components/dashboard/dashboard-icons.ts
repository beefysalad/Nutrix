import {
  Bot,
  History,
  Home,
  PlusCircle,
  Settings as SettingsIcon,
  Target,
} from 'lucide-react'

import type { DashboardSectionKey } from '@/components/dashboard/types'

export const dashboardIconMap = {
  dashboard: Home,
  log: PlusCircle,
  history: History,
  goals: Target,
  suggestions: Bot,
  settings: SettingsIcon,
} satisfies Record<DashboardSectionKey, React.ComponentType<{ className?: string }>>

export const mobileDashboardIcons = {
  home: Home,
  history: History,
  goals: Target,
  settings: SettingsIcon,
}
