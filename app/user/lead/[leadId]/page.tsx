"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Lead, Task, Call, Showing } from "@/lib/types"
import { leadStatuses, leadTypes, leadResponses, leadSources, clientTypes } from "@/lib/constants"
import { CallHistory } from "@/components/call-history"
import { TaskManager } from "@/components/task-manager"
import { ShowingCalendar } from "@/components/showing-calendar"

const defaultLead: Lead = {
  id: "",
  name: "",
  email: "",
  phone: "",
  language: "",
  religion: "",
  location: "",
  property: "",
  notes: "",
  leadStatus: "hot",
  leadResponse: "active",
  leadSource: "google ads",
  leadType: "buyer",
  clientType: "custom buyer",
  realtorAssociation: {
    name: "",
    membershipNumber: "",
    joinDate: ""
  },
  closedSales: {
    count: 0,
    totalValue: 0,
    lastClosedDate: ""
  },
  propertyPreferences: {
    budget: {
      min: 0,
      max: 0
    },
    locations: [],
    features: [],
    propertyType: "",
    bedrooms: 0,
    bathrooms: 0
  },
  callHistory: [],
  showings: [],
  tasks: [],
  createdAt: "",
  updatedAt: ""
}

export default function UserLeadPage({ params }: { params: { leadId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [leadData, setLeadData] = useState<Lead>(defaultLead)
  const [calls, setCalls] = useState<Call[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [showings, setShowings] = useState<Showing[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const fetchLeadData = useCallback(async () => {
    try {
      const response = await fetch(`/api/leads/${params.leadId}`)
      if (!response.ok) throw new Error('Failed to fetch lead data')
      const data = await response.json()
      
      setLeadData(prevData => ({
        ...defaultLead,
        ...data,
        realtorAssociation: {
          ...defaultLead.realtorAssociation,
          ...data.realtorAssociation
        },
        closedSales: {
          ...defaultLead.closedSales,
          ...data.closedSales
        },
        propertyPreferences: {
          ...defaultLead.propertyPreferences,
          ...data.propertyPreferences
        }
      }))
      
      setCalls(data.callHistory || [])
      setTasks(data.tasks || [])
      setShowings(data.showings || [])
    } catch (error) {
      console.error('Error fetching lead:', error)
      toast({
        title: "Error",
        description: "Failed to load lead information",
        variant: "destructive",
      })
    }
  }, [params.leadId, toast])

  useEffect(() => {
    fetchLeadData()
  }, [fetchLeadData])

  const handleSave = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/leads/${params.leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      })

      if (!response.ok) throw new Error('Failed to update lead')

      toast({
        title: "Success",
        description: "Lead information updated successfully",
      })
    } catch (error) {
      console.error('Error updating lead:', error)
      toast({
        title: "Error",
        description: "Failed to update lead information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [leadData, params.leadId, toast])

  const handleLeadDataChange = useCallback((field: keyof Lead, value: any) => {
    setLeadData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Lead Information</h1>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            "Saving..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={leadData.age || ''}
                    onChange={(e) => handleLeadDataChange('age', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={leadData.gender || ''}
                    onValueChange={(value) => handleLeadDataChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Input
                    value={leadData.language}
                    onChange={(e) => handleLeadDataChange('language', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Religion</Label>
                  <Input
                    value={leadData.religion}
                    onChange={(e) => handleLeadDataChange('religion', e.target.value)}
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Realtor Association Name</Label>
                  <Input
                    value={leadData.realtorAssociation.name}
                    onChange={(e) => handleLeadDataChange('realtorAssociation.name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Membership Number</Label>
                  <Input
                    value={leadData.realtorAssociation.membershipNumber}
                    onChange={(e) => handleLeadDataChange('realtorAssociation.membershipNumber', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Join Date</Label>
                <Input
                  type="date"
                  value={leadData.realtorAssociation.joinDate}
                  onChange={(e) => handleLeadDataChange('realtorAssociation.joinDate', e.target.value)}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Closed Sales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Number of Sales</Label>
                    <Input
                      type="number"
                      value={leadData.closedSales.count}
                      onChange={(e) => handleLeadDataChange('closedSales.count', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Value</Label>
                    <Input
                      type="number"
                      value={leadData.closedSales.totalValue}
                      onChange={(e) => handleLeadDataChange('closedSales.totalValue', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label>Last Closed Date</Label>
                  <Input
                    type="date"
                    value={leadData.closedSales.lastClosedDate}
                    onChange={(e) => handleLeadDataChange('closedSales.lastClosedDate', e.target.value)}
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Status</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lead Status</Label>
                  <Select
                    value={leadData.leadStatus}
                    onValueChange={(value) => handleLeadDataChange('leadStatus', value as Lead['leadStatus'])}
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
                    value={leadData.leadResponse}
                    onValueChange={(value) => handleLeadDataChange('leadResponse', value as Lead['leadResponse'])}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Type</Label>
                  <Select
                    value={leadData.clientType}
                    onValueChange={(value) => handleLeadDataChange('clientType', value as Lead['clientType'])}
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
                <div className="space-y-2">
                  <Label>Lead Type</Label>
                  <Select
                    value={leadData.leadType}
                    onValueChange={(value) => handleLeadDataChange('leadType', value as Lead['leadType'])}
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
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label>Preferred Locations</Label>
                <Input
                  placeholder="Add location and press Enter"
                  value={leadData.propertyPreferences.locations.join(', ')}
                  onChange={(e) => handleLeadDataChange('propertyPreferences.locations', e.target.value.split(',').map(loc => loc.trim()))}
                />
              </div>

              <div className="space-y-2">
                <Label>Desired Features</Label>
                <Input
                  placeholder="Add feature and press Enter"
                  value={leadData.propertyPreferences.features.join(', ')}
                  onChange={(e) => handleLeadDataChange('propertyPreferences.features', e.target.value.split(',').map(feature => feature.trim()))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Budget (Min)</Label>
                  <Input
                    type="number"
                    value={leadData.propertyPreferences.budget.min}
                    onChange={(e) => handleLeadDataChange('propertyPreferences.budget.min', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Budget (Max)</Label>
                  <Input
                    type="number"
                    value={leadData.propertyPreferences.budget.max}
                    onChange={(e) => handleLeadDataChange('propertyPreferences.budget.max', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

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
              onAddShowing={async (showing: Showing) => {
                // Handle adding showing
                toast({
                  title: "Showing scheduled",
                  description: "The showing has been scheduled successfully."
                });
              }}
              onUpdateShowing={async (showingId: string, updates: Partial<Showing>) => {
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
  )
} 