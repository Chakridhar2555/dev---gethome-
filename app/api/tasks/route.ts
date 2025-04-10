import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Get all tasks
    const tasks = await db.collection('tasks')
      .find()
      .sort({ date: 1 }) // Sort by date ascending
      .toArray();

    return NextResponse.json({
      tasks,
      total: tasks.length
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
} 