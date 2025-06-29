import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';

const app = express();
app.use(express.json());

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get all events
app.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    
    let whereConditions = {};
    
    if (status && status !== 'all') {
      whereConditions.status = status.toUpperCase();
    }
    
    if (category && category !== 'all') {
      whereConditions.category = category;
    }
    
    const events = await prisma.event.findMany({
      where: whereConditions,
      orderBy: { date: 'asc' }
    });
    
    // Filter by search if provided
    let filteredEvents = events;
    if (search) {
      filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json(filteredEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event by ID
app.get('/:id', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new event (Admin only)
app.post('/', auth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('location').notEmpty().withMessage('Location is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await prisma.event.create({
      data: {
        ...req.body,
        attendees: []
      }
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event (Admin only)
app.put('/:id', auth, async (req, res) => {
  try {
    const event = await prisma.event.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event (Admin only)
app.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.event.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for event
app.post('/:id/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventId = parseInt(req.params.id);
    const { name, email, phone } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is full
    if (event.max_attendees && event.registered_count >= event.max_attendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // For now, we'll just increment the count (in a real app, you'd store attendee details)
    await prisma.event.update({
      where: { id: eventId },
      data: {
        registered_count: event.registered_count + 1
      }
    });

    res.json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default app;
