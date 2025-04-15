import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Lead } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase()
    const { leads } = await request.json()
    
    console.log(`Attempting to import ${leads.length} leads`)
    
    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: "No valid leads provided for import" }, 
        { status: 400 }
      )
    }
    
    // Check for missing fields but don't reject the leads
    const leadsWithMissingFields = leads.filter(lead => 
      !lead.name || !lead.email || !lead.phone || !lead.property
    )
    
    if (leadsWithMissingFields.length > 0) {
      console.warn(`${leadsWithMissingFields.length} leads are missing required fields but will still be imported`)
    }

    // Insert all leads into MongoDB
    const result = await db.collection("leads").insertMany(leads)
    
    console.log(`Successfully imported ${result.insertedCount} leads`)

    return NextResponse.json({ 
      success: true, 
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds,
      warning: leadsWithMissingFields.length > 0 ? 
        `${leadsWithMissingFields.length} leads were imported with missing required fields` : 
        undefined
    })
  } catch (error) {
    console.error("Bulk import error:", error)
    return NextResponse.json(
      { 
        error: "Failed to import leads",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
} 