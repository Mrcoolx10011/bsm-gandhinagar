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

// Get all inquiries (Admin only)
app.get('/', auth, async (req, res) => {
  try {
    const { status, priority } = req.query;
    
    let whereConditions = {};
    
    if (status && status !== 'all') {
      whereConditions.status = status.toUpperCase();
    }
    
    if (priority && priority !== 'all') {
      whereConditions.priority = priority.toUpperCase();
    }
    
    const inquiries = await prisma.inquiry.findMany({
      where: whereConditions,
      orderBy: { created_at: 'desc' }
    });
    
    res.json(inquiries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new inquiry
app.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        ...req.body,
        status: 'new',
        priority: 'medium'
      }
    });

    res.status(201).json(inquiry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update inquiry (Admin only)
app.put('/:id', auth, async (req, res) => {
  try {
    const inquiry = await prisma.inquiry.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...req.body,
        responded_at: req.body.response ? new Date() : null,
        responded_by_id: req.body.response ? req.user.id : null
      }
    });

    res.json(inquiry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete inquiry (Admin only)
app.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.inquiry.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default app;
