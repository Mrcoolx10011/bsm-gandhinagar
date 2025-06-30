import { connectToDatabase } from './_lib/mongodb.js';
import { ObjectId } from 'mongodb';

// Middleware for JWT verification
const verifyToken = (token) => {
  // Simple token validation for Vercel serverless
  return token === process.env.ADMIN_TOKEN || token?.includes('Bearer');
};

export default async function handler(req, res) {
  try {
    const db = await connectToDatabase();
    const eventsCollection = db.collection('events');

    if (req.method === 'GET') {
      const { upcoming } = req.query;
      
      let query = {};
      if (upcoming) {
        // Get upcoming events for public display
        const today = new Date().toISOString().split('T')[0];
        query = { 
          date: { $gte: today },
          status: 'upcoming'
        };
      }

      const events = await eventsCollection.find(query).sort({ date: 1 }).toArray();
      
      const formattedEvents = events.map(event => ({
        id: event._id.toString(),
        ...event,
        createdAt: event.createdAt || new Date()
      }));

      res.status(200).json(formattedEvents);
    } else if (req.method === 'POST') {
      // Create new event
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const eventData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await eventsCollection.insertOne(eventData);
      const newEvent = await eventsCollection.findOne({ _id: result.insertedId });

      res.status(201).json({
        id: newEvent._id.toString(),
        ...newEvent
      });
    } else if (req.method === 'PUT') {
      // Update event
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.query;
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      const result = await eventsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const updatedEvent = await eventsCollection.findOne({ _id: new ObjectId(id) });
      res.status(200).json({
        id: updatedEvent._id.toString(),
        ...updatedEvent
      });
    } else if (req.method === 'DELETE') {
      // Delete event
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.query;
      const result = await eventsCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.status(200).json({ message: 'Event deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Events API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
