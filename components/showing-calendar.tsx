"use client"

import { useState, useEffect, useCallback } from 'react'
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
import type { Showing } from '@/lib/types'

interface ShowingCalendarProps {
  showings?: Showing[];
  onAddShowing?: (showing: Showing) => void;
  onUpdateShowing?: (showingId: string, updates: Partial<Showing>) => void;
  onDateSelect?: (date: Date | undefined) => void;
}

export function ShowingCalendar({ 
  showings = [], 
  onAddShowing, 
  onUpdateShowing,
  onDateSelect 
}: ShowingCalendarProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localShowings, setLocalShowings] = useState<Showing[]>(showings);
  const [newShowing, setNewShowing] = useState<Partial<Showing>>({
    time: '',
    property: '',
    notes: '',
    status: 'scheduled'
  });

  // Update local state when showings prop changes
  useEffect(() => {
    setLocalShowings(showings);
  }, [showings]);

  const handleAddShowingClick = useCallback(() => {
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
      status: newShowing.status as Showing['status'],
    };

    try {
      // Update local state
      const updatedShowings = [...localShowings, showing];
      setLocalShowings(updatedShowings);
      
      // Call parent callback if provided
      if (onAddShowing) {
        onAddShowing(showing);
      }
      
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
  }, [newShowing, selectedDate, localShowings, onAddShowing, toast]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      if (onDateSelect) {
        onDateSelect(date);
      }
    }
  }, [onDateSelect]);

  const getShowingsForDate = useCallback((date: Date) => {
    return localShowings.filter(showing => {
      const showingDate = new Date(showing.date);
      return showingDate.toDateString() === date.toDateString();
    });
  }, [localShowings]);

  const getStatusColor = useCallback((status: Showing['status']) => {
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
  }, []);

  const handleStatusChange = useCallback((status: Showing['status']) => {
    setNewShowing(prev => ({ ...prev, status }));
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Property Showings</h2>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
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
                  onChange={(e) => setNewShowing(prev => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property">Property</Label>
                <Input
                  id="property"
                  value={newShowing.property || ''}
                  onChange={(e) => setNewShowing(prev => ({ ...prev, property: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newShowing.notes || ''}
                  onChange={(e) => setNewShowing(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newShowing.status || 'scheduled'}
                  onValueChange={(value) => handleStatusChange(value as Showing['status'])}
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
                borderRadius: '50%',
                fontWeight: 'bold'
              }
            }}
          />
        </div>

        {/* Showings List Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Showings for {format(selectedDate, 'MMMM d, yyyy')}</h3>
          <div className="space-y-3">
            {getShowingsForDate(selectedDate).length > 0 ? (
              getShowingsForDate(selectedDate).map((showing) => (
                <div key={showing.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{showing.time}</span>
                    </div>
                    <Badge className={getStatusColor(showing.status)}>
                      {showing.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{showing.property}</span>
                  </div>
                  {showing.notes && (
                    <p className="text-sm text-gray-600 mt-2">{showing.notes}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No showings scheduled for this date.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 