import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function DELETE() {
  try {
    const { db } = await connectToDatabase()
    
    // Delete all leads from the collection
    const result = await db.collection("leads").deleteMany({})
    
    return NextResponse.json({ 
      success: true, 
      deletedCount: result.deletedCount 
    })
  } catch (error) {
    console.error("Clear leads error:", error)
    return NextResponse.json(
      { error: "Failed to clear leads" }, 
      { status: 500 }
    )
  }
} 