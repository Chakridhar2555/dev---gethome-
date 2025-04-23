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
import { leadStatuses as importedLeadStatuses, leadTypes as importedLeadTypes, leadResponses as importedLeadResponses, clientTypes as importedClientTypes } from '@/lib/constants'
import { CallHistory } from "@/components/call-history"
import { TaskManager } from "@/components/task-manager"
import { ShowingCalendar } from "@/components/showing-calendar"
import type { UITask } from "@/components/task-manager"

interface RealtorAssociation {
  name: string;
  membershipNumber: string;
  joinDate: string;
}

interface ClosedSales {
  count: number;
  totalValue: number;
  lastClosedDate: string;
}

interface PropertyPreferences {
  budget: {
    min: number;
    max: number;
  };
  propertyType: string[];
  bedrooms: number;
  bathrooms: number;
  locations: string[];
  features: string[];
}

interface StatusOption {
  value: string;
  label: string;
}

interface LocalTask {
  id: string;
  title: string;
  date: string | Date;
  description?: string;
  status: 'pending' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
}

const defaultRealtorAssociation: Lead['realtorAssociation'] = {
  name: "",
  membershipNumber: "",
  joinDate: ""
};

const defaultClosedSales: Lead['closedSales'] = {
  count: 0,
  totalValue: 0,
  lastClosedDate: ""
};

const defaultPropertyPreferences: Lead['propertyPreferences'] = {
  budget: {
    min: 0,
    max: 0
  },
  propertyType: [],
  bedrooms: 0,
  bathrooms: 0,
  locations: [],
  features: []
};

const defaultLead: Lead = {
  _id: "",
  name: "",
  email: "",
  phone: "",
  date: new Date().toISOString(),
  status: "New",
  property: "",
  notes: "",
  tasks: [],
  callHistory: [],
  showings: [],
  assignedTo: "",
  location: "",
  leadStatus: "hot",
  leadType: "buyer",
  leadSource: "google ads",
  leadResponse: "active",
  clientType: "custom buyer",
  leadConversion: "not-converted",
  language: "",
  gender: "prefer-not-to-say",
  religion: "",
  age: 0,
  realtorAssociation: defaultRealtorAssociation,
  closedSales: defaultClosedSales,
  propertyPreferences: defaultPropertyPreferences,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString()
}

const leadStatuses: StatusOption[] = [
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Meeting Scheduled', label: 'Meeting Scheduled' },
  { value: 'Proposal Sent', label: 'Proposal Sent' },
  { value: 'Negotiating', label: 'Negotiating' },
  { value: 'Closed Won', label: 'Closed Won' },
  { value: 'Closed Lost', label: 'Closed Lost' },
  { value: 'On Hold', label: 'On Hold' }
];

const leadResponses: StatusOption[] = [
  { value: 'Interested', label: 'Interested' },
  { value: 'Not Interested', label: 'Not Interested' },
  { value: 'Follow Up', label: 'Follow Up' },
  { value: 'No Response', label: 'No Response' },
  { value: 'Wrong Number', label: 'Wrong Number' },
  { value: 'Do Not Contact', label: 'Do Not Contact' }
];

const clientTypes: StatusOption[] = [
  { value: 'Investor', label: 'Investor' },
  { value: 'Individual', label: 'Individual' },
  { value: 'Couple', label: 'Couple' },
  { value: 'Family', label: 'Family' },
  { value: 'Corporate', label: 'Corporate' },
  { value: 'Other', label: 'Other' }
];

const leadTypes: StatusOption[] = [
  { value: 'Buyer', label: 'Buyer' },
  { value: 'Seller', label: 'Seller' },
  { value: 'Both', label: 'Both' },
  { value: 'Rental', label: 'Rental' }
];

export default function UserLeadPage({ params }: { params: { leadId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [leadData, setLeadData] = useState<Lead>(defaultLead)
  const [calls, setCalls] = useState<Call[]>([])
  const [tasks, setTasks] = useState<UITask[]>([])
  const [showings, setShowings] = useState<Showing[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    fetchLeadData()
  }, [params.leadId])

  const fetchLeadData = async () => {
    try {
      const response = await fetch(`/api/leads/${params.leadId}`)
      if (!response.ok) throw new Error('Failed to fetch lead data')
      const data = await response.json()
      
      // Ensure all required fields have default values
      const updatedData: Lead = {
        ...defaultLead,
        ...data,
        realtorAssociation: {
          name: data.realtorAssociation?.name ?? "",
          membershipNumber: data.realtorAssociation?.membershipNumber ?? "",
          joinDate: data.realtorAssociation?.joinDate ?? ""
        },
        closedSales: {
          count: data.closedSales?.count ?? 0,
          totalValue: data.closedSales?.totalValue ?? 0,
          lastClosedDate: data.closedSales?.lastClosedDate ?? ""
        },
        propertyPreferences: {
          budget: {
            min: data.propertyPreferences?.budget?.min ?? 0,
            max: data.propertyPreferences?.budget?.max ?? 0
          },
          propertyType: data.propertyPreferences?.propertyType ?? [],
          bedrooms: data.propertyPreferences?.bedrooms ?? 0,
          bathrooms: data.propertyPreferences?.bathrooms ?? 0,
          locations: data.propertyPreferences?.locations ?? [],
          features: data.propertyPreferences?.features ?? []
        }
      }
      
      setLeadData(updatedData)
      setCalls(data.callHistory ?? [])
      setTasks(data.tasks ?? [])
      setShowings(data.showings ?? [])
    } catch (error) {
      console.error('Error fetching lead:', error)
      toast({
        title: "Error",
        description: "Failed to load lead information",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
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
  }

  const convertToLibTask = (task: UITask) => ({
    id: task.id,
    title: task.title,
    date: typeof task.date === 'string' ? task.date : task.date.toISOString(),
    description: task.description || '',
    status: task.status,
    priority: task.priority
  })

  const handleAddTask = useCallback((task: UITask) => {
    const newTask: UITask = {
      ...task,
      id: Date.now().toString(),
      date: task.date
    }
    
    setLeadData(prevData => ({
      ...prevData,
      tasks: [...(prevData.tasks || []), convertToLibTask(newTask)]
    }))
    
    setTasks(prevTasks => [...prevTasks, newTask])
    
    toast({
      title: "Success",
      description: "Task added successfully"
    })
  }, [toast])

  const handleUpdateTask = useCallback((taskId: string, updates: Partial<UITask>) => {
    setLeadData(prevData => ({
      ...prevData,
      tasks: (prevData.tasks || []).map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, ...updates }
          return convertToLibTask(updatedTask as UITask)
        }
        return task
      })
    }))
    
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    )
    
    toast({
      title: "Success",
      description: "Task updated successfully"
    })
  }, [toast])

  const handleAddShowing = useCallback((showing: Showing) => {
    setShowings(prevShowings => [...prevShowings, showing]);
    
    setLeadData(prevData => ({
      ...prevData,
      showings: [...(prevData.showings ?? []), showing]
    }));
    
    toast({
      title: "Showing scheduled",
      description: "The showing has been scheduled successfully."
    });
  }, [toast]);

  const handleUpdateShowing = useCallback((showingId: string, updates: Partial<Showing>) => {
    setShowings(prevShowings => 
      prevShowings.map(showing => 
        showing.id === showingId ? { ...showing, ...updates } : showing
      )
    );
    
    setLeadData(prevData => ({
      ...prevData,
      showings: (prevData.showings ?? []).map(showing => 
        showing.id === showingId ? { ...showing, ...updates } : showing
      )
    }));
    
    toast({
      title: "Showing updated",
      description: "The showing has been updated successfully."
    });
  }, [toast]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    setSelectedDate(date || new Date());
  }, []);

  const handleRealtorAssociationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadData) return

    const realtorAssociation = {
      name: leadData.realtorAssociation?.name || '',
      membershipNumber: leadData.realtorAssociation?.membershipNumber || '',
      joinDate: leadData.realtorAssociation?.joinDate || ''
    }

    const updatedData = {
      ...leadData,
      realtorAssociation
    }

    try {
      const response = await fetch(`/api/leads/${params.leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })
      if (!response.ok) throw new Error('Failed to update realtor association')
      toast({
        title: "Success",
        description: "Realtor association information updated",
      })
    } catch (error) {
      console.error('Error updating realtor association:', error)
      toast({
        title: "Error",
        description: "Failed to update realtor association information",
        variant: "destructive",
      })
    }
  }

  const handleClosedSalesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadData) return

    const closedSales = {
      count: leadData.closedSales?.count || 0,
      totalValue: leadData.closedSales?.totalValue || 0,
      lastClosedDate: leadData.closedSales?.lastClosedDate || ''
    }

    const updatedData = {
      ...leadData,
      closedSales
    }

    try {
      const response = await fetch(`/api/leads/${params.leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })
      if (!response.ok) throw new Error('Failed to update closed sales')
      toast({
        title: "Success",
        description: "Closed sales information updated",
      })
    } catch (error) {
      console.error('Error updating closed sales:', error)
      toast({
        title: "Error",
        description: "Failed to update closed sales information",
        variant: "destructive",
      })
    }
  }

  const handleRealtorAssociationChange = (field: keyof RealtorAssociation, value: string) => {
    setLeadData(prev => {
      const updatedData = {
        ...prev,
        realtorAssociation: {
          name: prev.realtorAssociation?.name || '',
          membershipNumber: prev.realtorAssociation?.membershipNumber || '',
          joinDate: prev.realtorAssociation?.joinDate || '',
          [field]: value
        }
      } as Lead;
      return updatedData;
    });
  }

  const handleClosedSalesChange = (field: keyof ClosedSales, value: string | number) => {
    setLeadData(prev => {
      const updatedData = {
        ...prev,
        closedSales: {
          count: prev.closedSales?.count || 0,
          totalValue: prev.closedSales?.totalValue || 0,
          lastClosedDate: prev.closedSales?.lastClosedDate || '',
          [field]: value
        }
      } as Lead;
      return updatedData;
    });
  }

  const handlePropertyPreferencesChange = (field: keyof PropertyPreferences, value: any) => {
    setLeadData(prev => {
      const updatedData = {
        ...prev,
        propertyPreferences: {
          budget: {
            min: prev.propertyPreferences?.budget?.min || 0,
            max: prev.propertyPreferences?.budget?.max || 0
          },
          propertyType: prev.propertyPreferences?.propertyType || [],
          bedrooms: prev.propertyPreferences?.bedrooms || 0,
          bathrooms: prev.propertyPreferences?.bathrooms || 0,
          locations: prev.propertyPreferences?.locations || [],
          features: prev.propertyPreferences?.features || [],
          [field]: value
        }
      } as Lead;
      return updatedData;
    });
  }

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
                    value={leadData.age ?? ''}
                    onChange={(e) => setLeadData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={leadData.gender ?? ''}
                    onValueChange={(value) => setLeadData(prev => ({ ...prev, gender: value as Lead['gender'] }))}
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
                    value={leadData.realtorAssociation?.name || ''}
                    onChange={(e) => handleRealtorAssociationChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Membership Number</Label>
                  <Input
                    value={leadData.realtorAssociation?.membershipNumber || ''}
                    onChange={(e) => handleRealtorAssociationChange('membershipNumber', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Join Date</Label>
                <Input
                  type="date"
                  value={leadData.realtorAssociation?.joinDate || ''}
                  onChange={(e) => handleRealtorAssociationChange('joinDate', e.target.value)}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Closed Sales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Number of Sales</Label>
                    <Input
                      type="number"
                      value={leadData.closedSales?.count || 0}
                      onChange={(e) => handleClosedSalesChange('count', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Value</Label>
                    <Input
                      type="number"
                      value={leadData.closedSales?.totalValue || 0}
                      onChange={(e) => handleClosedSalesChange('totalValue', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label>Last Closed Date</Label>
                  <Input
                    type="date"
                    value={leadData.closedSales?.lastClosedDate || ''}
                    onChange={(e) => handleClosedSalesChange('lastClosedDate', e.target.value)}
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
                    onValueChange={(value) => setLeadData({
                      ...leadData,
                      leadStatus: value as Lead['leadStatus']
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
                    value={leadData.leadResponse}
                    onValueChange={(value) => setLeadData({
                      ...leadData,
                      leadResponse: value as Lead['leadResponse']
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Type</Label>
                  <Select
                    value={leadData.clientType}
                    onValueChange={(value) => setLeadData({
                      ...leadData,
                      clientType: value as Lead['clientType']
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
                <div className="space-y-2">
                  <Label>Lead Type</Label>
                  <Select
                    value={leadData.leadType}
                    onValueChange={(value) => setLeadData({
                      ...leadData,
                      leadType: value as Lead['leadType']
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
                  value={(leadData.propertyPreferences?.locations || []).join(', ')}
                  onChange={(e) => handlePropertyPreferencesChange('locations', e.target.value.split(',').map(loc => loc.trim()))}
                />
              </div>

              <div className="space-y-2">
                <Label>Desired Features</Label>
                <Input
                  placeholder="Add feature and press Enter"
                  value={(leadData.propertyPreferences?.features || []).join(', ')}
                  onChange={(e) => handlePropertyPreferencesChange('features', e.target.value.split(',').map(feature => feature.trim()))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Budget (Min)</Label>
                  <Input
                    type="number"
                    value={leadData.propertyPreferences?.budget?.min || 0}
                    onChange={(e) => handlePropertyPreferencesChange('budget', {
                      ...(leadData.propertyPreferences?.budget || {}),
                      min: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Budget (Max)</Label>
                  <Input
                    type="number"
                    value={leadData.propertyPreferences?.budget?.max || 0}
                    onChange={(e) => handlePropertyPreferencesChange('budget', {
                      ...(leadData.propertyPreferences?.budget || {}),
                      max: parseInt(e.target.value) || 0
                    })}
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
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
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
              onAddShowing={handleAddShowing}
              onUpdateShowing={handleUpdateShowing}
              onDateSelect={handleDateSelect}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 