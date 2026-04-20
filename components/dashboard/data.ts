import type { DashboardSectionKey } from '@/components/dashboard/types'

export const navItems: Array<{ key: DashboardSectionKey; href: string; label: string }> = [
  { key: 'dashboard', href: '/dashboard', label: 'Dashboard' },
  { key: 'history', href: '/dashboard/history', label: 'History' },
  { key: 'goals', href: '/dashboard/goals', label: 'Goals' },
  { key: 'settings', href: '/dashboard/settings', label: 'Settings' },
]

export const dietModes = [
  { id: 'cutting', label: 'Cutting', description: 'Reduce body fat while preserving muscle' },
  { id: 'maintenance', label: 'Maintenance', description: 'Maintain current weight and composition' },
  { id: 'bulking', label: 'Bulking', description: 'Build muscle mass with controlled surplus' },
]
