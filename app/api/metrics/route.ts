import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get next week's date
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Get all tasks
    const tasks = await db.collection('tasks').find({
      status: 'pending'
    }).toArray();

    // Get all leads
    const totalLeads = await db.collection('leads').countDocuments();

    // Calculate metrics
    const todaysTasks = tasks.filter(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });

    const upcomingTasks = tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= today && taskDate <= nextWeek;
    });

    return NextResponse.json({
      totalTasks: tasks.length,
      totalLeads,
      todaysTasks: todaysTasks.length,
      upcomingTasks: upcomingTasks.length
    });

  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
} 