"use client"

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from "@/components/layout"
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCcw, Clock, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from 'date-fns'

interface Showing {
  id: string
  date: Date
  time: string
  property: string
  notes?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  leadName: string
  leadId: string
}

interface Event {
  _id: string
  title: string
  date: Date
  time: string
  type: 'viewing' | 'meeting' | 'open-house' | 'follow-up' | 'call'
  description: string
  location?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  leadId?: string
  leadName?: string
  showingId?: string
}

export default function CalendarPage() {
  const router = useRouter()
  const [showings, setShowings] = useState<Showing[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch lead showings
      const showingsResponse = await fetch('/api/showings')
      if (!showingsResponse.ok) {
        throw new Error('Failed to fetch showings')
      }
      const showingsData = await showingsResponse.json()
      setShowings(showingsData.map((showing: any) => ({
        ...showing,
        date: new Date(showing.date)
      })))

      // Fetch all events
      const eventsResponse = await fetch('/api/events')
      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch events')
      }
      const eventsData = await eventsResponse.json()
      setEvents(eventsData.map((event: any) => ({
        ...event,
        date: new Date(event.date)
      })))

      // Store in localStorage for components that read from there
      localStorage.setItem('calendar_events', JSON.stringify(eventsData))

      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch calendar data",
      })
      setIsLoading(false)
    }
  }, [toast])

  const getShowingsForDate = (date: Date) => {
    return showings.filter(showing => {
      const showingDate = new Date(showing.date)
      return showingDate.toDateString() === date.toDateString()
    })
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const hasActivitiesOnDate = (date: Date) => {
    return getShowingsForDate(date).length > 0 || getEventsForDate(date).length > 0
  }

  const getAllActivitiesForDate = (date: Date) => {
    const dateShowings = getShowingsForDate(date).map(showing => ({
      id: showing.id,
      title: showing.property,
      time: showing.time,
      type: 'viewing' as const,
      description: showing.notes || '',
      status: showing.status,
      location: showing.property,
      leadName: showing.leadName,
      leadId: showing.leadId
    }))

    const dateEvents = getEventsForDate(date).map(event => ({
      id: event._id,
      title: event.title,
      time: event.time,
      type: event.type,
      description: event.description || '',
      status: event.status,
      location: event.location,
      leadName: event.leadName,
      leadId: event.leadId
    }))

    return [...dateShowings, ...dateEvents].sort((a, b) =>
      a.time.localeCompare(b.time)
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'viewing':
        return 'bg-purple-100 text-purple-700'
      case 'meeting':
        return 'bg-blue-100 text-blue-700'
      case 'open-house':
        return 'bg-green-100 text-green-700'
      case 'follow-up':
        return 'bg-yellow-100 text-yellow-700'
      case 'call':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isLoading}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              className="bg-[#ef4444] hover:bg-[#dc2626] text-white"
              size="sm"
              onClick={() => router.push('/calendar/add')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="w-full"
                  modifiers={{
                    hasActivity: (date) => hasActivitiesOnDate(date)
                  }}
                  modifiersStyles={{
                    hasActivity: {
                      backgroundColor: 'var(--primary-50)',
                      color: 'var(--primary-900)',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Activities Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>
                Activities for {format(selectedDate, 'MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getAllActivitiesForDate(selectedDate).length > 0 ? (
                <div className="space-y-4">
                  {getAllActivitiesForDate(selectedDate).map((activity) => (
                    <div
                      key={activity.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{activity.title}</h3>
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {activity.time}
                        </div>
                        {activity.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {activity.location}
                          </div>
                        )}
                        {activity.description && (
                          <p className="mt-2">{activity.description}</p>
                        )}
                        {activity.leadName && (
                          <p className="text-sm text-gray-500">
                            Lead: {activity.leadName}
                          </p>
                        )}
                      </div>
                      <Badge className={`mt-2 ${getTypeColor(activity.type)}`}>
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-6">
                  Select a date to view scheduled activities
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

