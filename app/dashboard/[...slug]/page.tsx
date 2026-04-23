import { NutrixDashboard } from '@/components/dashboard/nutrix-dashboard'
import type {
  DashboardSectionKey,
  DashboardSubview,
  HistorySubview,
  SuggestionsSubview,
} from '@/components/dashboard/types'
import { userService } from '@/lib/services/user-service'

type DashboardSlugPageProps = {
  params: Promise<{ slug: string[] }>
}

function resolveSection(slug: string[]): DashboardSectionKey {
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

function resolveSuggestionsView(slug: string[]): SuggestionsSubview | undefined {
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

function resolveDashboardView(slug: string[]): DashboardSubview | undefined {
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

function resolveHistoryView(slug: string[]): HistorySubview | undefined {
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

export default async function DashboardSlugPage({ params }: DashboardSlugPageProps) {
  const { slug } = await params
  await userService.syncCurrentUserToDatabase()

  return (
    <NutrixDashboard
      section={resolveSection(slug)}
      dashboardView={resolveDashboardView(slug)}
      historyView={resolveHistoryView(slug)}
      suggestionsView={resolveSuggestionsView(slug)}
    />
  )
}
