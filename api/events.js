import { connectToDatabase } from './_lib/mongodb.js';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

// Improved JWT verification
const verifyToken = (token) => {
  if (!token) return false;
  
  try {
    // Remove Bearer prefix if present
    const cleanToken = token.replace('Bearer ', '');
    
    // Verify JWT token
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'fallback-secret');
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
      const token = req.headers.authorization;
      const verified = verifyToken(token);
      if (!verified) {
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
      const token = req.headers.authorization;
      const verified = verifyToken(token);
      if (!verified) {
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
      const token = req.headers.authorization;
      const verified = verifyToken(token);
      if (!verified) {
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
