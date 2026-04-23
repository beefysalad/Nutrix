import type {
  DashboardSectionKey,
  DashboardSubview,
  HistorySubview,
  SuggestionsSubview,
} from '@/components/dashboard/types'

export function resolveDashboardSection(slug: string[]): DashboardSectionKey {
  const joined = slug.join('/')

  switch (joined) {
    case 'history':
    case 'meals':
    case 'calendar':
    case 'report/daily':
    case 'report/weekly':
      return 'history'
    case 'trends':
    case 'insights':
      return 'dashboard'
    case 'goals':
      return 'goals'
    case 'suggestions':
    case 'suggestions/saved':
      return 'suggestions'
    case 'settings':
      return 'settings'
    default:
      return 'dashboard'
  }
}

export function resolveDashboardSubview(slug: string[]): DashboardSubview | undefined {
  const joined = slug.join('/')

  switch (joined) {
    case 'trends':
      return 'trends'
    case 'insights':
      return 'insights'
    default:
      return undefined
  }
}

export function resolveHistorySubview(slug: string[]): HistorySubview | undefined {
  const joined = slug.join('/')

  switch (joined) {
    case 'calendar':
      return 'calendar'
    case 'report/daily':
      return 'daily-report'
    case 'report/weekly':
      return 'weekly-summary'
    case 'meals':
      return 'meals'
    default:
      return undefined
  }
}

export function resolveSuggestionsSubview(slug: string[]): SuggestionsSubview | undefined {
  const joined = slug.join('/')

  switch (joined) {
    case 'suggestions/saved':
      return 'saved'
    case 'suggestions':
      return 'generate'
    default:
      return undefined
  }
}
