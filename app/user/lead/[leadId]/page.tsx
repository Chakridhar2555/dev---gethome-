"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Phone, Mail, MapPin, Calendar, History, FileText, MessageSquare, ArrowLeft, Save, Loader2, DollarSign, User, Clock, CheckCircle2, XCircle, AlertCircle, Plus } from "lucide-react"
import { CallHistory } from "@/components/call-history"
import { ShowingCalendar } from "@/app/components/showing-calendar"
import { TaskManager } from "@/components/task-manager"
import type { Lead, Task, Showing } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ExtendedLead extends Lead {
  source?: string;
  address?: string;
  createdAt?: string;
  propertyDetails?: {
    propertyType: string;
    lastClosedDate: string;
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    yearBuilt: number;
    lotSize: string;
    parking: string;
    features: string[];
  };
  propertyPreferences?: {
    budget: {
      min: number;
      max: number;
    };
    propertyType: string[];
    bedrooms: number;
    bathrooms: number;
    locations: string[];
    features: string[];
  };
  realtorAssociation?: {
    name: string;
    membershipNumber: string;
    joinDate: string;
  };
  closedSales?: {
    count: number;
    totalValue: number;
    lastClosedDate: string;
  };
}

interface TaskType {
  id: string;
  title: string;
  date: string;
  description?: string;
  status: 'pending' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
}

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
  { value: 'refferal', label: 'Refferal' },
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

export default function UserLeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [leadData, setLeadData] = useState<ExtendedLead | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [newNote, setNewNote] = useState("")

  useEffect(() => {
    fetchLead()
  }, [params.leadId])

  const fetchLead = async () => {
    try {
      const leadId = params.leadId as string
      if (!leadId) return

      const response = await fetch(`/api/leads/${leadId}`)
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
      router.push("/user/leads")
    }
  }

  const handleCall = async () => {
    if (!leadData) return
    
    try {
      const response = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          leadId: leadData._id,
          phoneNumber: leadData.phone 
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to initiate call")
      }

      toast({
        title: "Call Initiated",
        description: "Connecting your call...",
      })
      
      fetchLead()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initiate call",
      })
    }
  }

  const addNote = async () => {
    if (!newNote.trim() || !leadData) return

    try {
      const response = await fetch(`/api/leads/${leadData._id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote }),
      })

      if (!response.ok) {
        throw new Error("Failed to add note")
      }

      setNewNote("")
      fetchLead()
      toast({
        title: "Success",
        description: "Note added successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add note",
      })
    }
  }

  const handleTaskUpdate = async (taskId: string, updates: Partial<{
    id: string;
    title: string;
    date: string | Date;
    description?: string;
    status: 'pending' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
  }>) => {
    if (!leadData) return;

    // Convert Date to string if present
    const processedUpdates = {
      ...updates,
      date: updates.date ? (typeof updates.date === 'string' ? updates.date : updates.date.toISOString()) : new Date().toISOString()
    };

    const updatedTasks = leadData.tasks?.map(task =>
      task.id === taskId ? { ...task, ...processedUpdates } : task
    ) || [];
    
    // Ensure all dates are strings and tasks have required fields
    const normalizedTasks = updatedTasks.map((task: {
      id: string;
      title: string;
      date: string | Date;
      description?: string;
      status: 'pending' | 'completed' | 'cancelled';
      priority: 'low' | 'medium' | 'high';
    }) => ({
      id: task.id,
      title: task.title,
      date: typeof task.date === 'string' ? task.date : (task.date as Date).toISOString(),
      description: task.description,
      status: task.status || 'pending',
      priority: task.priority || 'medium'
    }));

    const updatedData = {
      ...leadData,
      tasks: normalizedTasks
    } as Lead;
    setLeadData(updatedData);

    try {
      const response = await fetch(`/api/leads/${params.leadId}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: normalizedTasks })
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      // Trigger a refresh of the leads list to update metrics
      window.dispatchEvent(new Event('storage'));

      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task",
      });
    }
  };

  const handleSave = async () => {
    if (!leadData) return;
    
    setIsLoading(true);
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
        description: "Lead information updated successfully"
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update lead information"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !leadData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/user/leads")}
          className="flex items-center text-gray-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leads
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-[#EF4444] hover:bg-[#DC2626] text-white"
        >
          {isLoading ? (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Property Details */}
              <div>
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
                          propertyType: e.target.value,
                          lastClosedDate: leadData.propertyDetails?.lastClosedDate || '',
                          bedrooms: leadData.propertyDetails?.bedrooms || 0,
                          bathrooms: leadData.propertyDetails?.bathrooms || 0,
                          squareFootage: leadData.propertyDetails?.squareFootage || 0,
                          yearBuilt: leadData.propertyDetails?.yearBuilt || 0,
                          lotSize: leadData.propertyDetails?.lotSize || '',
                          parking: leadData.propertyDetails?.parking || '',
                          features: leadData.propertyDetails?.features || []
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Closed Date</Label>
                    <Input
                      type="date"
                      value={leadData.propertyDetails?.lastClosedDate ? new Date(leadData.propertyDetails.lastClosedDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setLeadData({
                        ...leadData,
                        propertyDetails: {
                          ...leadData.propertyDetails,
                          lastClosedDate: e.target.value,
                          propertyType: leadData.propertyDetails?.propertyType || '',
                          bedrooms: leadData.propertyDetails?.bedrooms || 0,
                          bathrooms: leadData.propertyDetails?.bathrooms || 0,
                          squareFootage: leadData.propertyDetails?.squareFootage || 0,
                          yearBuilt: leadData.propertyDetails?.yearBuilt || 0,
                          lotSize: leadData.propertyDetails?.lotSize || '',
                          parking: leadData.propertyDetails?.parking || '',
                          features: leadData.propertyDetails?.features || []
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div>
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
              </div>

              {/* Assignment & Property */}
              <div>
                <h3 className="text-lg font-medium mb-4">Assignment & Property</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input 
                      value={leadData.location || ''} 
                      onChange={(e) => setLeadData({ ...leadData, location: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div>
                <h3 className="text-lg font-medium mb-4">Demographics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input 
                      value={leadData.age || ''} 
                      onChange={(e) => setLeadData({ ...leadData, age: parseInt(e.target.value) || undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      value={leadData.gender || ''}
                      onValueChange={(value) => setLeadData({ ...leadData, gender: value as Lead['gender'] })}
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
                      value={leadData.language || ''} 
                      onChange={(e) => setLeadData({ ...leadData, language: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Religion</Label>
                    <Input 
                      value={leadData.religion || ''} 
                      onChange={(e) => setLeadData({ ...leadData, religion: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Sales Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Sales Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Realtor Association Name</Label>
                    <Input
                      value={leadData.realtorAssociation?.name || ''}
                      onChange={(e) => setLeadData({
                        ...leadData,
                        realtorAssociation: {
                          name: e.target.value,
                          membershipNumber: leadData.realtorAssociation?.membershipNumber || '',
                          joinDate: leadData.realtorAssociation?.joinDate || ''
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Membership Number</Label>
                    <Input
                      value={leadData.realtorAssociation?.membershipNumber || ''}
                      onChange={(e) => setLeadData({
                        ...leadData,
                        realtorAssociation: {
                          name: leadData.realtorAssociation?.name || '',
                          membershipNumber: e.target.value,
                          joinDate: leadData.realtorAssociation?.joinDate || ''
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Join Date</Label>
                    <Input
                      type="date"
                      value={leadData.realtorAssociation?.joinDate ? new Date(leadData.realtorAssociation.joinDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setLeadData({
                        ...leadData,
                        realtorAssociation: {
                          name: leadData.realtorAssociation?.name || '',
                          membershipNumber: leadData.realtorAssociation?.membershipNumber || '',
                          joinDate: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Closed Sales */}
              <div>
                <h3 className="text-lg font-medium mb-4">Closed Sales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Number of Sales</Label>
                    <Input
                      type="number"
                      value={leadData.closedSales?.count || 0}
                      onChange={(e) => setLeadData({
                        ...leadData,
                        closedSales: {
                          count: parseInt(e.target.value) || 0,
                          totalValue: leadData.closedSales?.totalValue || 0,
                          lastClosedDate: leadData.closedSales?.lastClosedDate || ''
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Value</Label>
                    <Input
                      type="number"
                      value={leadData.closedSales?.totalValue || 0}
                      onChange={(e) => setLeadData({
                        ...leadData,
                        closedSales: {
                          count: leadData.closedSales?.count || 0,
                          totalValue: parseInt(e.target.value) || 0,
                          lastClosedDate: leadData.closedSales?.lastClosedDate || ''
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Closed Date</Label>
                    <Input
                      type="date"
                      value={leadData.closedSales?.lastClosedDate ? new Date(leadData.closedSales.lastClosedDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setLeadData({
                        ...leadData,
                        closedSales: {
                          count: leadData.closedSales?.count || 0,
                          totalValue: leadData.closedSales?.totalValue || 0,
                          lastClosedDate: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Lead Status and Type */}
              <div>
                <div className="space-y-2">
                  <Label>Lead Status</Label>
                  <Select
                    value={leadData.leadStatus || ''}
                    onValueChange={(value) => setLeadData({ ...leadData, leadStatus: value as Lead['leadStatus'] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cold">Cold</SelectItem>
                      <SelectItem value="mild">Mild</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lead Response</Label>
                  <Select
                    value={leadData.leadResponse || ''}
                    onValueChange={(value) => setLeadData({ ...leadData, leadResponse: value as Lead['leadResponse'] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select response" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="not answering">Not Answering</SelectItem>
                      <SelectItem value="not actively answering">Not Actively Answering</SelectItem>
                      <SelectItem value="always responding">Always Responding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Client Type</Label>
                  <Select
                    value={leadData.clientType || ''}
                    onValueChange={(value) => setLeadData({ ...leadData, clientType: value as Lead['clientType'] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Investor">Investor</SelectItem>
                      <SelectItem value="custom buyer">Custom Buyer</SelectItem>
                      <SelectItem value="first home buyer">First Home Buyer</SelectItem>
                      <SelectItem value="seasonal investor">Seasonal Investor</SelectItem>
                      <SelectItem value="commercial buyer">Commercial Buyer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lead Type</Label>
                  <Select
                    value={leadData.leadType || ''}
                    onValueChange={(value) => setLeadData({ ...leadData, leadType: value as Lead['leadType'] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lead type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pre construction">Pre Construction</SelectItem>
                      <SelectItem value="resale">Resale</SelectItem>
                      <SelectItem value="seller">Seller</SelectItem>
                      <SelectItem value="buyer">Buyer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Communication Section */}
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={handleCall}>
                <Phone className="h-4 w-4 mr-2" />
                Make Call
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push(`/user/lead/${leadData._id}/calls`)}>
                View Call History
              </Button>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add a new note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <Button onClick={addNote} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
              <div className="space-y-2">
                {Array.isArray(leadData.notes) ? (
                  leadData.notes.map((note: string, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{note}</p>
                    </div>
                  ))
                ) : leadData.notes ? (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{leadData.notes}</p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Property Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Property Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Budget Range</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Min"
                      value={leadData.propertyPreferences?.budget?.min || ''}
                      readOnly
                    />
                    <Input
                      placeholder="Max"
                      value={leadData.propertyPreferences?.budget?.max || ''}
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <Label>Property Type</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {leadData.propertyPreferences?.propertyType?.map((type, index) => (
                      <Badge key={index} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Preferred Locations</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {leadData.propertyPreferences?.locations?.map((location, index) => (
                      <Badge key={index} variant="secondary">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Desired Features</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {leadData.propertyPreferences?.features?.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Showings */}
          <Card>
            <CardHeader>
              <CardTitle>Property Showings</CardTitle>
            </CardHeader>
            <CardContent>
              <ShowingCalendar
                showings={leadData.showings?.map(showing => ({
                  ...showing,
                  date: new Date(showing.date),
                  status: showing.status || 'scheduled'
                })) || []}
                onAddShowing={async () => {}}
                onUpdateShowing={async () => {}}
              />
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskManager
                tasks={leadData.tasks || []}
                onAddTask={(task: Task) => {
                  // Handle task addition
                }}
                onUpdateTask={(taskId: string, updates: Partial<Task>) => {
                  // Handle task update
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 