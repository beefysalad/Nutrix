import { NutrixDashboard } from '@/components/dashboard/nutrix-dashboard'
import { userService } from '@/lib/services/user-service'

export default async function DashboardPage() {
  await userService.syncCurrentUserToDatabase()

  return <NutrixDashboard section="dashboard" />
}
