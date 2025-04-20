import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Handler for GET /api/events
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch all events from the events collection
    const events = await db.collection('events').find({}).toArray();
    
    // Transform MongoDB _id to string and ensure consistent date format
    const formattedEvents = events.map(event => ({
      ...event,
      _id: event._id.toString(),
      date: event.date instanceof Date ? event.date : new Date(event.date),
      // Ensure consistent type and status
      type: event.type || 'meeting',
      status: event.status || 'scheduled'
    }));
    
    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// Handler for POST /api/events
export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const eventData = await request.json();
    
    // Add timestamps
    const newEvent = {
      ...eventData,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Ensure consistent type and status
      type: eventData.type || 'meeting',
      status: eventData.status || 'scheduled'
    };
    
    const result = await db.collection('events').insertOne(newEvent);
    
    // If this is a showing event, also update the corresponding lead
    if (eventData.showingId && eventData.leadId) {
      try {
        const lead = await db.collection('leads').findOne(
          { _id: new ObjectId(eventData.leadId) },
          { projection: { showings: 1 } }
        );

        if (lead) {
          const currentShowings = lead.showings || [];
          const newShowing = {
            id: eventData.showingId,
            date: new Date(eventData.date),
            time: eventData.time,
            property: eventData.location,
            notes: eventData.description,
            status: eventData.status
          };

          const updatedShowings = [...currentShowings, newShowing];
          
          await db.collection('leads').updateOne(
            { _id: new ObjectId(eventData.leadId) },
            { $set: { showings: updatedShowings } }
          );
        }
      } catch (error) {
        console.error('Error updating lead showing:', error);
      }
    }
    
    return NextResponse.json({
      ...newEvent,
      _id: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// Handler for PUT /api/events
export async function PUT(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const eventData = await request.json();
    
    // Extract _id and convert to MongoDB ObjectId
    const { _id, ...updateData } = eventData;
    
    // Add updated timestamp
    updateData.updatedAt = new Date();
    
    const result = await db.collection('events').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // If this is a showing event, also update the corresponding showing in the lead
    if (updateData.showingId && updateData.leadId) {
      try {
        const lead = await db.collection('leads').findOne(
          { _id: new ObjectId(updateData.leadId) },
          { projection: { showings: 1 } }
        );

        if (lead && lead.showings) {
          const updatedShowings = lead.showings.map((showing: any) => {
            if (showing.id === updateData.showingId) {
              return {
                ...showing,
                status: updateData.status,
                time: updateData.time,
                date: new Date(updateData.date),
                property: updateData.location,
                notes: updateData.description
              };
            }
            return showing;
          });

          await db.collection('leads').updateOne(
            { _id: new ObjectId(updateData.leadId) },
            { $set: { showings: updatedShowings } }
          );
        }
      } catch (error) {
        console.error('Error updating lead showing:', error);
      }
    }

    return NextResponse.json({
      ...updateData,
      _id
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// Handler for DELETE /api/events
export async function DELETE(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const result = await db.collection('events').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
} 