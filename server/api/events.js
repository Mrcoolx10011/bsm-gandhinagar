import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../../lib/prisma.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const { category, status, upcoming, search } = req.query;
    
    const where = {};
    if (category) where.category = category;
    if (status) where.status = status.toUpperCase();
    if (upcoming === 'true') {
      where.date = { gte: new Date() };
      where.status = 'UPCOMING';
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        attendees: true,
        _count: {
          select: { attendees: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        attendees: true,
        _count: {
          select: { attendees: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create event (admin only)
router.post('/', auth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('maxAttendees').isInt({ min: 1 }).withMessage('Max attendees must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      date: new Date(req.body.date)
    };

    const event = await prisma.event.create({
      data: eventData,
      include: {
        attendees: true,
        _count: {
          select: { attendees: true }
        }
      }
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        attendees: true,
        _count: {
          select: { attendees: true }
        }
      }
    });

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.event.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Register for event
router.post('/:id/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { attendees: true } } }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check capacity
    if (event._count.attendees >= event.maxAttendees) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check if already registered
    const existingAttendee = await prisma.eventAttendee.findUnique({
      where: {
        eventId_email: {
          eventId: req.params.id,
          email: req.body.email
        }
      }
    });

    if (existingAttendee) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    const attendee = await prisma.eventAttendee.create({
      data: {
        eventId: req.params.id,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
      }
    });

    res.status(201).json({ message: 'Successfully registered for event', attendee });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

export default router;