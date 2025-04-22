"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Phone, Save, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { CallHistory } from "@/components/call-history"
import { Lead as BaseLeadType, Task, Showing } from "@/lib/types"
import { ShowingCalendar } from "@/components/showing-calendar"
import { TaskManager } from "@/components/task-manager"
import type { Showing as ShowingType } from "@/lib/types"

const leadStatuses = [
  { value: 'cold', label: 'Cold' },
  { value: 'warm', label: 'Warm' },
  { value: 'hot', label: 'Hot' },
  { value: 'mild', label: 'Mild' },
];

const leadResponses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'not answering', label: 'Not Answering' },
  { value: 'not actively answering', label: 'Not Actively Answering' },
  { value: 'always responding', label: 'Always Responding' },
];

const leadSources = [
  { value: 'google ads', label: 'Google Ads' },
  { value: 'meta', label: 'Meta' },
  { value: 'refferal', label: 'Referral' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
];

const leadTypes = [
  { value: 'Pre construction', label: 'Pre Construction' },
  { value: 'resale', label: 'Resale' },
  { value: 'seller', label: 'Seller' },
  { value: 'buyer', label: 'Buyer' },
];

const clientTypes = [
  { value: 'Investor', label: 'Investor' },
  { value: 'custom buyer', label: 'Custom Buyer' },
  { value: 'first home buyer', label: 'First Home Buyer' },
  { value: 'seasonal investor', label: 'Seasonal Investor' },
  { value: 'commercial buyer', label: 'Commercial Buyer' },
];

// Add Call type definition from call-history.tsx
interface Call {
  date: string;
  duration: number;
  recording?: string;
}

// Add Task type definition from task-manager.tsx
interface Task {
  id: string;
  title: string;
  date: Date;
  description?: string;
  status: 'pending' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
}

// Add PropertyDetails type definition
interface PropertyDetails {
  lastClosedDate?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  yearBuilt?: number;
  lotSize?: string;
  parking?: string;
  features?: string[];
}

// Create a custom Lead type that extends the base Lead type
type Lead = BaseLeadType & {
  propertyDetails?: PropertyDetails;
};

// Component Props
interface CallHistoryProps {
  leadId: string;
}

interface TaskManagerProps {
  leadId: string;
}

interface ShowingCalendarProps {
  leadId: string;
}

export default function UserLeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [leadData, setLeadData] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [calls, setCalls] = useState<Call[]>([])
  const [showings, setShowings] = useState<Showing[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    fetchLead()
  }, [params.leadId])

  const fetchLead = async () => {
    try {
      const leadId = params.leadId as string
      if (!leadId) return

      // Get current user from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }
      const user = JSON.parse(userData);

      const response = await fetch(`/api/leads/${leadId}?userRole=${user.role}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch lead")
      }

      setLeadData(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching lead:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch lead details",
      })
      router.push('/user/leads')
    }
  }

  const handleSubmit = async () => {
    if (!leadData) return;
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/leads/${params.leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead');
      }

      const updatedLead = await response.json();
      setLeadData(updatedLead);
      
      toast({
        title: "Success",
        description: "Lead updated successfully"
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update lead"
      });
    } finally {
      setIsSaving(false)
    }
  };

  const handleCall = async () => {
    if (!leadData?.phone) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No phone number available"
      });
      return;
    }

    try {
      window.location.href = `tel:${leadData.phone}`;
    } catch (error) {
      console.error('Error making call:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initiate call"
      });
    }
  };

  if (isLoading || !leadData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading lead details...</h2>
          <p className="text-gray-500">Please wait while we fetch the information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/user/leads')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Button>
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleCall}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Phone className="mr-2 h-4 w-4" />
            Call Lead
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              {/* Basic Information */}
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={leadData.name}
                  onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={leadData.email}
                  onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={leadData.phone}
                  onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                />
              </div>

              {/* Location & Property */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Location & Property</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={leadData.location || ''}
                      onChange={(e) => setLeadData({
                        ...leadData,
                        location: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Property</Label>
                    <Input
                      value={leadData.property || ''}
                      onChange={(e) => setLeadData({
                        ...leadData,
                        property: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Lead Status and Type */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Lead Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lead Status</Label>
                    <Select
                      value={leadData.leadStatus || ''}
                      onValueChange={(value) => setLeadData({
                        ...leadData,
                        leadStatus: value as BaseLeadType['leadStatus']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead status" />
                      </SelectTrigger>
                      <SelectContent>
                        {leadStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lead Response</Label>
                    <Select
                      value={leadData.leadResponse || ''}
                      onValueChange={(value) => setLeadData({
                        ...leadData,
                        leadResponse: value as BaseLeadType['leadResponse']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead response" />
                      </SelectTrigger>
                      <SelectContent>
                        {leadResponses.map((response) => (
                          <SelectItem key={response.value} value={response.value}>
                            {response.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lead Source</Label>
                    <Select
                      value={leadData.leadSource || ''}
                      onValueChange={(value) => setLeadData({
                        ...leadData,
                        leadSource: value as BaseLeadType['leadSource']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead source" />
                      </SelectTrigger>
                      <SelectContent>
                        {leadSources.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lead Type</Label>
                    <Select
                      value={leadData.leadType || ''}
                      onValueChange={(value) => setLeadData({
                        ...leadData,
                        leadType: value as BaseLeadType['leadType']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leadTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Client Type</Label>
                    <Select
                      value={leadData.clientType || ''}
                      onValueChange={(value) => setLeadData({
                        ...leadData,
                        clientType: value as BaseLeadType['clientType']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client type" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Property Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Input
                      value={leadData.propertyDetails?.propertyType ?? ''}
                      onChange={(e) => setLeadData({
                        ...leadData,
                        propertyDetails: {
                          ...leadData.propertyDetails,
                          propertyType: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <Input
                      type="number"
                      value={leadData.propertyDetails?.bedrooms ?? ''}
                      onChange={(e) => setLeadData({
                        ...leadData,
                        propertyDetails: {
                          ...leadData.propertyDetails,
                          bedrooms: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bathrooms</Label>
                    <Input
                      type="number"
                      value={leadData.propertyDetails?.bathrooms ?? ''}
                      onChange={(e) => setLeadData({
                        ...leadData,
                        propertyDetails: {
                          ...leadData.propertyDetails,
                          bathrooms: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Square Footage</Label>
                    <Input
                      type="number"
                      value={leadData.propertyDetails?.squareFootage ?? ''}
                      onChange={(e) => setLeadData({
                        ...leadData,
                        propertyDetails: {
                          ...leadData.propertyDetails,
                          squareFootage: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Call History</CardTitle>
            </CardHeader>
            <CardContent>
              <CallHistory calls={calls} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskManager 
                tasks={tasks}
                onAddTask={(task: Task) => {
                  // Handle adding task
                  toast({
                    title: "Task added",
                    description: "The task has been added successfully."
                  });
                }}
                onUpdateTask={(taskId: string, updates: Partial<Task>) => {
                  // Handle updating task
                  toast({
                    title: "Task updated",
                    description: "The task has been updated successfully."
                  });
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Showings</CardTitle>
            </CardHeader>
            <CardContent>
              <ShowingCalendar 
                showings={showings}
                onAddShowing={async (showing: ShowingType) => {
                  // Handle adding showing
                  toast({
                    title: "Showing scheduled",
                    description: "The showing has been scheduled successfully."
                  });
                }}
                onUpdateShowing={async (showingId: string, updates: Partial<ShowingType>) => {
                  // Handle updating showing
                  toast({
                    title: "Showing updated",
                    description: "The showing has been updated successfully."
                  });
                }}
                onDateSelect={(date) => setSelectedDate(date || new Date())}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 