import { NutrixDashboard } from '@/components/dashboard/nutrix-dashboard'
import type { DashboardSectionKey } from '@/components/dashboard/types'

type DashboardSlugPageProps = {
  params: Promise<{ slug: string[] }>
}

function resolveSection(slug: string[]): DashboardSectionKey {
  const joined = slug.join('/')

  switch (joined) {
    case 'log':
      return 'log'
    case 'meals':
      return 'meals'
    case 'calendar':
      return 'calendar'
    case 'trends':
      return 'trends'
    case 'insights':
      return 'insights'
    case 'report/daily':
      return 'daily-report'
    case 'report/weekly':
      return 'weekly-summary'
    case 'goals':
      return 'goals'
    case 'settings':
      return 'settings'
    default:
      return 'overview'
  }
}

export default async function DashboardSlugPage({ params }: DashboardSlugPageProps) {
  const { slug } = await params

  return <NutrixDashboard section={resolveSection(slug)} />
}
