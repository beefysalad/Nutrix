import type { DashboardSectionKey } from '@/components/dashboard/types'

export const navItems: Array<{ key: DashboardSectionKey; href: string; label: string }> = [
  { key: 'overview', href: '/dashboard', label: 'Overview' },
  { key: 'log', href: '/dashboard/log', label: 'Log Meal' },
  { key: 'meals', href: '/dashboard/meals', label: 'Meals' },
  { key: 'calendar', href: '/dashboard/calendar', label: 'Calendar' },
  { key: 'trends', href: '/dashboard/trends', label: 'Trends' },
  { key: 'insights', href: '/dashboard/insights', label: 'Insights' },
  { key: 'daily-report', href: '/dashboard/report/daily', label: 'Daily Report' },
  { key: 'weekly-summary', href: '/dashboard/report/weekly', label: 'Weekly Summary' },
  { key: 'goals', href: '/dashboard/goals', label: 'Goals' },
  { key: 'settings', href: '/dashboard/settings', label: 'Settings' },
]

export const dietModes = [
  { id: 'cutting', label: 'Cutting', description: 'Reduce body fat while preserving muscle' },
  { id: 'maintenance', label: 'Maintenance', description: 'Maintain current weight and composition' },
  { id: 'bulking', label: 'Bulking', description: 'Build muscle mass with controlled surplus' },
]
