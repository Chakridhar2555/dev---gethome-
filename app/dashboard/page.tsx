import { DashboardClient } from "@/components/dashboard-client"
import { withPermission } from "@/components/protect-route"

function DashboardPage() {
  return <DashboardClient />
}

export default withPermission(DashboardPage, 'dashboard')

