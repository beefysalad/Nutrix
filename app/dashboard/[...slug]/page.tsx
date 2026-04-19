import { NutrixDashboard } from '@/components/dashboard/nutrix-dashboard'
import type {
  DashboardSectionKey,
  DashboardSubview,
  HistorySubview,
} from '@/components/dashboard/types'
import { userService } from '@/lib/services/user-service'

type DashboardSlugPageProps = {
  params: Promise<{ slug: string[] }>
}

function resolveSection(slug: string[]): DashboardSectionKey {
  const joined = slug.join('/')

  switch (joined) {
    case 'log':
      return 'log'
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
      return 'suggestions'
    case 'settings':
      return 'settings'
    default:
      return 'dashboard'
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
    />
  )
}
