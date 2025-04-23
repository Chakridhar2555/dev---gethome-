"use client"

import dynamic from 'next/dynamic'
import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, Users, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, AlertCircle, MapPin } from "lucide-react"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

// Dynamically import heavy components
const MonthView = dynamic(
  () => import("@/components/calendar/month-view").then(mod => mod.MonthView),
  {
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        Loading calendar...
      </div>
    ),
    ssr: false
  }
);

interface Task {
  id: string
  title: string
  date: string | Date
  description?: string
  status: 'pending' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
}

interface Lead {
  _id: string
  name: string
  tasks?: Task[]
}

interface CalendarEvent {
  id: string
  title: string
  date: Date
  time: string
  type: 'viewing' | 'meeting' | 'open-house' | 'follow-up' | 'call'
  description: string
  location?: string
}

interface ScheduledTask {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'task' | 'event';
  source: 'task' | 'calendar';
  description?: string;
  priority?: string;
  status?: string;
  location?: string;
}

// Add type for motion table row
const MotionTableRow = motion(TableRow)

// Separate metrics cards into a component
function MetricsCards({ metrics }: { metrics: any }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mr-4">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <h2 className="text-2xl font-bold text-gray-900">{metrics.totalTasks}</h2>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mr-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <h2 className="text-2xl font-bold text-gray-900">{metrics.totalLeads}</h2>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mr-4">
              <CalendarIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Tasks</p>
              <h2 className="text-2xl font-bold text-gray-900">{metrics.todaysTasks}</h2>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mr-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Tasks</p>
              <h2 className="text-2xl font-bold text-gray-900">{metrics.upcomingTasks}</h2>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// Separate tasks table into a component
function TasksTable({ allTasks, getStatusIcon, getPriorityColor }: { 
  allTasks: Task[], 
  getStatusIcon: (status: string) => JSX.Element | null,
  getPriorityColor: (priority: string) => string 
}) {
  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTasks.length === 0 ? (
                <MotionTableRow
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                    No tasks found
                  </TableCell>
                </MotionTableRow>
              ) : (
                allTasks.map((task, index) => (
                  <MotionTableRow
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>{getStatusIcon(task.status)}</TableCell>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{format(new Date(task.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {task.description || 'No description'}
                    </TableCell>
                  </MotionTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function UserDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [metrics, setMetrics] = useState({
    totalTasks: 0,
    totalLeads: 0,
    todaysTasks: 0,
    upcomingTasks: 0
  });
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch metrics
      const metricsResponse = await fetch('/api/metrics');
      if (!metricsResponse.ok) throw new Error('Failed to fetch metrics');
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);

      // Fetch tasks
      const tasksResponse = await fetch('/api/tasks');
      if (!tasksResponse.ok) throw new Error('Failed to fetch tasks');
      const tasksData = await tasksResponse.json();
      setAllTasks(tasksData.tasks || []);

      // Fetch events
      const eventsResponse = await fetch('/api/events');
      if (!eventsResponse.ok) throw new Error('Failed to fetch events');
      const eventsData = await eventsResponse.json();
      setEvents(eventsData);

      // Combine tasks and events into scheduled tasks
      const combinedTasks: ScheduledTask[] = [
        ...tasksData.tasks.map((task: Task) => ({
          id: task.id,
          title: task.title,
          date: typeof task.date === 'string' ? new Date(task.date) : task.date,
          time: format(typeof task.date === 'string' ? new Date(task.date) : task.date, 'h:mm a'),
          type: 'task',
          source: 'task' as const,
          description: task.description,
          priority: task.priority,
          status: task.status
        })),
        ...eventsData.map((event: CalendarEvent) => ({
          id: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          type: 'event',
          source: 'calendar' as const,
          description: event.description,
          location: event.location
        }))
      ];

      setScheduledTasks(combinedTasks);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <MetricsCards metrics={metrics} />
      <TasksTable 
        allTasks={allTasks} 
        getStatusIcon={getStatusIcon}
        getPriorityColor={getPriorityColor}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading calendar...</div>}>
              <MonthView />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledTasks.map((task, index) => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {task.type === 'task' ? (
                        <ClipboardList className="h-5 w-5 text-gray-600" />
                      ) : (
                        <CalendarIcon className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{format(task.date, 'MMM dd, yyyy')} at {task.time}</span>
                      </div>
                      {task.location && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{task.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {task.type === 'task' && task.priority && (
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  )}
                </div>
              ))}
              {scheduledTasks.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No scheduled tasks
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
