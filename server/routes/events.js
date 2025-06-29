import express from 'express';
import { body, validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../lib/mongodb.js';

const router = express.Router();

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get all events (public route)
router.get('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const eventsCollection = db.collection('events');
    
    const { category, upcoming } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (upcoming === 'true') {
      filter.date = { $gte: new Date().toISOString().split('T')[0] };
    }
    
    const events = await eventsCollection.find(filter).sort({ date: 1 }).toArray();
    
    const formattedEvents = events.map(event => ({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      image: event.image || 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=600',
      attendees: event.attendees || 0,
      maxAttendees: event.maxAttendees || 100,
      gallery: event.gallery || [],
      status: event.status,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));
    
    res.json(formattedEvents);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event (admin only)
router.post('/', auth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('category').notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, date, time, location, category, image, maxAttendees, gallery } = req.body;

    const db = await connectToDatabase();
    const eventsCollection = db.collection('events');

    const eventData = {
      title,
      description,
      date,
      time,
      location,
      category,
      image: image || 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=600',
      attendees: 0,
      maxAttendees: maxAttendees || 100,
      gallery: gallery || [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await eventsCollection.insertOne(eventData);
    
    const newEvent = {
      id: result.insertedId.toString(),
      ...eventData
    };

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event (admin only)
router.put('/:id', auth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('category').notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, date, time, location, category, image, maxAttendees, gallery, status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const db = await connectToDatabase();
    const eventsCollection = db.collection('events');

    const updateData = {
      title,
      description,
      date,
      time,
      location,
      category,
      image,
      maxAttendees,
      gallery,
      status,
      updatedAt: new Date().toISOString()
    };

    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updatedEvent = await eventsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      id: updatedEvent._id.toString(),
      title: updatedEvent.title,
      description: updatedEvent.description,
      date: updatedEvent.date,
      time: updatedEvent.time,
      location: updatedEvent.location,
      category: updatedEvent.category,
      image: updatedEvent.image,
      attendees: updatedEvent.attendees,
      maxAttendees: updatedEvent.maxAttendees,
      gallery: updatedEvent.gallery,
      status: updatedEvent.status,
      createdAt: updatedEvent.createdAt,
      updatedAt: updatedEvent.updatedAt
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const db = await connectToDatabase();
    const eventsCollection = db.collection('events');

    const result = await eventsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
