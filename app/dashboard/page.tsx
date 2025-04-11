"use client"

import { DashboardClient } from "@/components/dashboard-client"
import { ProtectRoute } from "@/components/protect-route"

export default function DashboardPage() {
  return (
    <ProtectRoute requiredPermission="dashboard">
      <DashboardClient />
    </ProtectRoute>
  )
}

