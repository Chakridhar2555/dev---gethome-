import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout"

export function PermissionDenied() {
  const router = useRouter()

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-red-100">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-3">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to access this page. 
            Please contact your administrator if you believe this is an error.
          </p>
          <Button 
            onClick={() => router.push('/dashboard')}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
} 