"use client"

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Plus, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

type ShowingStatus = 'scheduled' | 'completed' | 'cancelled';

interface Showing {
  id: string;
  date: Date;
  time: string;
  property: string;
  notes?: string;
  status: ShowingStatus;
  type: 'viewing';
}

interface NewShowing {
  time: string;
  property: string;
  notes: string;
  status: ShowingStatus;
}

interface ShowingCalendarProps {
  initialShowings?: Showing[];
  onShowingsChange?: (showings: Showing[]) => void;
}

export function ShowingCalendar({ initialShowings = [], onShowingsChange }: ShowingCalendarProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showings, setShowings] = useState<Showing[]>(initialShowings);
  const [newShowing, setNewShowing] = useState<NewShowing>({
    time: '',
    property: '',
    notes: '',
    status: 'scheduled'
  });

  const handleAddShowingClick = async () => {
    if (!newShowing.time || !newShowing.property) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    const showing: Showing = {
      id: Date.now().toString(),
      date: selectedDate,
      time: newShowing.time,
      property: newShowing.property,
      notes: newShowing.notes,
      status: newShowing.status as ShowingStatus,
      type: 'viewing'
    };

    try {
      const response = await fetch('/api/showings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(showing),
      });

      if (!response.ok) {
        throw new Error('Failed to create showing');
      }

      const data = await response.json();
      setShowings([...showings, data]);
      
      // Reset form and close dialog
      setNewShowing({ time: '', property: '', notes: '', status: 'scheduled' });
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Showing added successfully",
      });
    } catch (error) {
      console.error('Error creating showing:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add showing",
      });
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  }

  const getShowingsForDate = (date: Date) => {
    return showings.filter(showing => {
      const showingDate = new Date(showing.date);
      return showingDate.toDateString() === date.toDateString();
    });
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

  const handleStatusChange = (status: ShowingStatus) => {
    setNewShowing(prev => ({ ...prev, status }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Property Showings</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#ef4444] hover:bg-[#dc2626] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Showing
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Showing</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span>{selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newShowing.time || ''}
                  onChange={(e) => setNewShowing({ ...newShowing, time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property">Property</Label>
                <Input
                  id="property"
                  value={newShowing.property || ''}
                  onChange={(e) => setNewShowing({ ...newShowing, property: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newShowing.notes || ''}
                  onChange={(e) => setNewShowing({ ...newShowing, notes: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newShowing.status || 'scheduled'}
                  onValueChange={(value) => handleStatusChange(value as ShowingStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-6 mt-4 flex justify-end border-t">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddShowingClick}
                  className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-6"
                >
                  Schedule Showing
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <div className="w-full">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            modifiers={{
              hasShowing: (date) => getShowingsForDate(date).length > 0
            }}
            modifiersStyles={{
              hasShowing: {
                backgroundColor: '#fef2f2',
                color: '#ef4444',
                fontWeight: 'bold'
              }
            }}
          />
        </div>

        {/* Showings List Section */}
        <div className="space-y-4">
          {showings
            ?.filter(showing => {
              const showingDate = new Date(showing.date)
              return (
                showingDate.getDate() === selectedDate?.getDate() &&
                showingDate.getMonth() === selectedDate?.getMonth() &&
                showingDate.getFullYear() === selectedDate?.getFullYear()
              )
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((showing) => (
              <div key={showing.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{showing.property}</h3>
                  <Badge className={getStatusColor(showing.status)}>
                    {showing.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {showing.time}
                  </div>
                  {showing.notes && (
                    <p className="mt-2">{showing.notes}</p>
                  )}
                </div>
              </div>
            ))}
          {!showings?.filter(showing => {
            const showingDate = new Date(showing.date)
            return (
              showingDate.getDate() === selectedDate?.getDate() &&
              showingDate.getMonth() === selectedDate?.getMonth() &&
              showingDate.getFullYear() === selectedDate?.getFullYear()
            )
          }).length && (
              <p className="text-gray-500 text-center">No showings scheduled for this date</p>
            )}
        </div>
      </div>
    </div>
  )
} 